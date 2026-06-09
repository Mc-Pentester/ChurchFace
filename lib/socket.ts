import { io } from "socket.io-client";

function getSocketUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

export const socket = io(getSocketUrl(), {
  path: "/socket.io",
  autoConnect: true,
});