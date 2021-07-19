const InMemorySessionStore = require("./memory-store");
const MessageStore = require("./message-store");
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
  path: "/ws",
});
const { v4: uuid } = require("uuid");

const sessionStore = new InMemorySessionStore();
const messageStore = new MessageStore();
io.use((socket, next) => {
  const userID = socket.handshake.auth.userID;
  if (userID) {
    const session = sessionStore.findSession(userID);
    if (session) {
      session.active = true;
      sessionStore.saveSession(session.userID, session);
      socket.session = session;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("Username is needed"));
  }
  // create new session
  socket.session = {
    userID: uuid(),
    username: username,
    active: true,
  };
  sessionStore.saveSession(socket.session.userID, socket.session);
  next();
});

io.on("connection", (socket) => {
  socket.join(socket.session.userID);
  socket.emit("session", socket.session.userID, socket.session);

  socket.on("users", (callback) => {
    callback(sessionStore.findAllSessions());
  });

  socket.broadcast.emit("user connected", socket.session);

  socket.on("private message", (content, callback) => {
    const messageBody = messageStore.addMessages(content);
    socket.to(content.to).emit("private message", messageBody);
    callback(messageBody);
  });

  socket.on("message received", (id, seen, callback) => {
    const messageBody = messageStore.notify(id, seen);
    callback(messageBody);
    socket.to(messageBody.from).emit("delivered", messageBody);
  });

  socket.on("messages", (from, to, callback) => {
    const messages = messageStore.getMessages(from, to);
    messages.forEach((message) => {
      socket.to(message.from).emit("delivered", message);
    });
    callback(messages);
  });

  socket.on("disconnect", () => {
    if (socket.session) {
      sessionStore.saveSession(socket.session.userID, {
        ...socket.session,
        active: false,
      });
      socket.broadcast.emit("user disconnected", socket.session.userID);
    }
  });
});

httpServer.listen(4000, () =>
  console.log(`server listening at http://localhost:4000`)
);
