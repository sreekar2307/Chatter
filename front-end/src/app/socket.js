import { io } from "socket.io-client";
import config from "./config";

const URL = config.backendUrl;
export default io(URL, {
  transports: ["websocket"],
  upgrade: false,
  autoConnect: false,
  path: "/ws",
});
