import { io } from "socket.io-client";

// Must point to backend WebSocket server, not static frontend
const SOCKET_URL = import.meta.env.VITE_API_URL || "https://criksy.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;