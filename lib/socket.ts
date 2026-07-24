import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const socketUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://churchface.onrender.com";

export const socket = io(socketUrl, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("CONNECTÉ ID :", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

// Hook to emit register when session is available
export function useSocketPresence() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id && socket.connected) {
      console.log("Emitting register for:", session.user.id);
      socket.emit("register", session.user.id);
    }
  }, [session?.user?.id, socket.connected]);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected, checking session");
      if (session?.user?.id) {
        console.log("Emitting register on connect for:", session.user.id);
        socket.emit("register", session.user.id);
      }
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [session?.user?.id]);
}