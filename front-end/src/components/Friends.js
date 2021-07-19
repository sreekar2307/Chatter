import { useContext, useEffect, useState } from "react";
import socket from "../app/socket";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Paper,
  Tooltip,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import SendIcon from "@material-ui/icons/Send";
import { UserContext } from "./User";
import { makeStyles } from "@material-ui/core/styles";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import DoneIcon from "@material-ui/icons/Done";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 0,
    height: "10vh",
    right: 0,
  },
  input: {
    height: "100%",
  },
  friends: {
    borderRight: "2px solid grey",
    position: "relative",
    height: "100vh",
  },
}));

export default function Friends() {
  const classes = useStyles();
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState("");
  const user = useContext(UserContext)[0];

  useEffect(() => {
    socket.emit("users", (resp) => {
      const friends = resp.filter((res) => res.userID !== user.userID);
      setFriends(friends)
      if(friends.length > 0 ) setSelectedFriend(friends[0])
    });
  }, []);


  useEffect(() => {
    if(selectedFriend !== null) {
      socket.emit("messages", user.userID, selectedFriend.userID, (resp) => {
        const newMessages = messages.map(message => ({...message, active: false}))
        resp.forEach(value => {
          const position = newMessages.findIndex(message => message.id === value.id)
          if(position !== -1){
            newMessages.splice(position, 1)
          }
          newMessages.push({...value, active: true})
        });
        setMessages(newMessages)
      });
    }
  }, [selectedFriend, setSelectedFriend])

  useEffect(() => {
    const userConnectedHandler = (newUser) => {
      const existing = friends.findIndex(
        (friend) => friend.userID === newUser.userID
      );
      if (existing !== -1) {
        friends[existing].active = true;
        setFriends([...friends]);
      } else {
        setFriends([...friends, newUser]);
      }
    };

    const userDisconnectHandler = (userID) => {
      const NewList = friends.map((friend) => {
        if (friend.userID === userID) {
          friend.active = false;
        }
        return friend;
      });
      setFriends(NewList);
    };

    const privateMessageHandler = (content) => {
      const seen = selectedFriend && content.from === selectedFriend.userID;
      socket.emit("message received", content.id, seen, (message) => {
        setMessages([...messages, {...message, active: seen}])
      });
    };

    const messageDeliveredHandler = (content) => {
      setMessages(messages.map((message) => {
        if (message.id === content.id) {
          const seen = selectedFriend && content.to === selectedFriend.userID;
          return {...content, active: seen};
        }
        return message;
      }))
    };

    socket.on("user connected", userConnectedHandler);
    socket.on("user disconnected", userDisconnectHandler);
    socket.on("private message", privateMessageHandler);
    socket.on("delivered", messageDeliveredHandler);

    return () => {
      socket.off("user connected", userConnectedHandler);
      socket.off("user disconnected", userDisconnectHandler);
      socket.off("private message", privateMessageHandler);
      socket.off("delivered", messageDeliveredHandler);
    };
  });

  const handleSendMessage = () => {
    const toUser = selectedFriend;
    setMessage("");
    socket.emit(
      "private message",
      {
        from: user.userID,
        to: toUser.userID,
        text: message,
      },
      (resp) => {
        const seen = selectedFriend && resp.to === selectedFriend.userID;
        setMessages([...messages, {...resp, active: seen}]);
      }
    );
  };

  const messagesBody = messages.filter(message => message.active).map((message, index) => (
    <Message
      to={message.to}
      from={message.from}
      delivered={message.delivered}
      seen={message.seen}
      text={message.text}
      key={`message-${index}`}
    >
      {message.text}
    </Message>
  ));
  return (
    <Grid container style={{ height: "100vh" }}>
      <Grid item xs={3} className={classes.friends}>
        {friends.map((friend, index) => (
          <List component="nav">
            <Friend
              key={friend.userID}
              username={friend.username}
              userID={friend.userID}
              active={friend.active}
              selectedUser={()=> setSelectedFriend(friend)}
              selected={selectedFriend && friend.userID === selectedFriend.userID}
            />
          </List>
        ))}
        <Welcome />
      </Grid>
      <Grid item xs={9} style={{ position: "relative" }}>
        <Paper style={{ maxHeight: "90vh", overflow: "auto" }}>
          {messagesBody}
        </Paper>
        <Paper className={classes.root}>
          <OutlinedInput
            className={classes.input}
            disabled={selectedFriend === -1}
            value={message}
            id="message"
            fullWidth
            type="text"
            onKeyDown={(e) => {
              if (e.which === 13) {
                handleSendMessage();
              }
            }}
            placeholder="Send Message"
            onChange={(event) => setMessage(event.target.value)}
            endAdornment={
              <IconButton
                disabled={selectedFriend === -1}
                type="button"
                aria-label="send"
                onClick={handleSendMessage}
              >
                <SendIcon />
              </IconButton>
            }
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

function Friend({ username, active, selectedUser, selected }) {
  return (
    <ListItem button onClick={selectedUser} selected={selected}>
      <ListItemIcon>
        <Tooltip title={active ? "online" : "offline"}>
          <Badge
            variant="dot"
            color={active ? "primary" : "secondary"}
            overlap="circular"
          >
            <AccountCircleIcon fontSize="large" color="primary" />
          </Badge>
        </Tooltip>
      </ListItemIcon>
      <ListItemText primary={username} />
    </ListItem>
  );
}

function Welcome() {
  const user = useContext(UserContext)[0];
  return (
    <List component="nav" style={{ position: "absolute", bottom: 0, left: 0 }}>
      <ListItem>
        <ListItemText primary={"Welcome"} secondary={user.username} />
      </ListItem>
    </List>
  );
}

function Message({ text, from, to, delivered, seen }) {
  const user = useContext(UserContext)[0];
  let statusIcon = <DoneIcon />;
  if (delivered && seen) {
    statusIcon = <DoneAllIcon color="primary" />;
  } else if (delivered) {
    statusIcon = <DoneAllIcon color="default" />;
  }
  return (
    <Card style={{ position: "relative" }}>
      <CardHeader subheader={user.userID === from ? "You:" : "Friend:"} />
      <CardContent>
        {text}
        {from === user.userID && <div style={{ position: "absolute", right: 10 }}>{statusIcon}</div>}
      </CardContent>
    </Card>
  );
}
