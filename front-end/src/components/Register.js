import { useContext, useEffect, useState } from "react";
import { Button, Grid, Modal, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { UserContext } from "./User";
import socket from "../app/socket";
import Friends from "./Friends";
function getModalStyle() {
  return {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function Register() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [user, setUser] = useContext(UserContext);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const handleUsernameChange = (event) => {
    setTextFieldValue(event.target.value);
    const validity = event.target.value.length > 2;
    setValid(validity);
    setButtonDisabled(!validity);
  };

  useEffect(() => {
    const userID = localStorage.getItem("userID");
    if (userID) {
      socket.auth = { userID };
      socket.on("session", (userID, sessionObj) => {
        setLoading(false);
        setUser(sessionObj);
      });
      socket.connect();
    } else {
      setLoading(false);
    }
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleButtonClick = () => {
    setOpen(false);
    socket.auth = { username: textFieldValue };
    setLoading(true);
    socket.on("session", (userID, sessionObj) => {
      setUser(sessionObj);
      setLoading(false);
      localStorage.setItem("userID", userID);
    });
    socket.connect();
  };

  const body = (
    <Grid
      container
      style={modalStyle}
      className={classes.paper}
      direction="column"
      spacing={3}
    >
      <Grid item>
        <Typography variant="h5" gutterBottom style={{ textAlign: "center" }}>
          Welcome To Chatter
        </Typography>
      </Grid>
      <Grid item>
        <TextField
          error={!valid}
          id="username"
          label="Enter Username"
          variant="outlined"
          helperText={"length greater than 2"}
          fullWidth
          required
          onChange={handleUsernameChange}
        />
      </Grid>
      <Grid item>
        <Button
          variant="outlined"
          color="primary"
          disabled={buttonDisabled}
          fullWidth
          onClick={handleButtonClick}
        >
          Okay
        </Button>
      </Grid>
    </Grid>
  );

  if (loading) return <div />;

  return user ? (
    <Friends />
  ) : (
    <Modal
      open={open}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      {body}
    </Modal>
  );
}

export default Register;
