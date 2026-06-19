import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

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

// Hook to emit user:online when session is available
export function useSocketPresence() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id && socket.connected) {
      socket.emit("user:online", session.user.id);
    }
  }, [session?.user?.id, socket.connected]);

  useEffect(() => {
    const handleConnect = () => {
      if (session?.user?.id) {
        socket.emit("user:online", session.user.id);
      }
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [session?.user?.id]);
}