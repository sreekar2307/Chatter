import { io } from "socket.io-client";

const URL = "http://ec2-52-66-160-163.ap-south-1.compute.amazonaws.com:80/ws";
export default io(URL, {
  transports: ["websocket"],
  upgrade: false,
  autoConnect: false,
  path: "/ws",
});

// export function userListeners(socket) {
//   socket.once("user connected", (newUser) => {
//     if (newUser) {
//       const existing = friends.findIndex(
//         (friend) => friend.userID === newUser.userID
//       );
//       if (existing !== -1) {
//         friends[existing].active = true;
//         setFriends([...friends]);
//       } else {
//         setFriends([...friends, newUser]);
//       }
//     }
//   });
//
//   socket.once("user disconnected", (userID) => {
//     const NewList = friends.map((friend) => {
//       if (friend.userID === userID) {
//         friend.active = false;
//       }
//       return friend;
//     });
//     setFriends(NewList);
//   });
// }
//
// export function messageListeners(socket) {
//   socket.once("private message", (content) => {
//     if (friends.length > selectedFriend) {
//       const seen = content.to === friends[selectedFriend].userID;
//       socket.emit("message received", content.id, seen, (message) => {
//         const newMessages = [...messages, message];
//         setMessages(newMessages);
//       });
//     }
//   });
//
//   socket.once("delivered", (content) => {
//     const newMessages = messages.map((message) => {
//       if (message.id === content.id) {
//         return content;
//       }
//       return message;
//     });
//     setMessages(newMessages);
//   });
// }
