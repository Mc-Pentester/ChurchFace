import { io } from "socket.io-client";

const socketUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "";

export const socket = io(socketUrl, {
  path: "/socket.io",
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("CONNECTÉ ID :", socket.id);
});