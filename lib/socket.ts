import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

// Configuration centralisée Socket.IO
const SOCKET_URL = 
  process.env.NEXT_PUBLIC_SOCKET_URL || 
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

// Options de connexion Socket.IO
const SOCKET_OPTIONS = {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
};

// Instance unique Socket.IO
let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, SOCKET_OPTIONS);
    
    socketInstance.on("connect", () => {
      console.log("CONNECTÉ ID :", socketInstance?.id);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }
  
  return socketInstance;
}

// Export de l'instance pour compatibilité
export const socket = getSocket();

// Hook to emit register when session is available
export function useSocketPresence() {
  const { data: session } = useSession();

  useEffect(() => {
    const socket = getSocket();
    if (session?.user?.id && socket.connected) {
      console.log("Emitting register for:", session.user.id);
      socket.emit("register", session.user.id);
    }
  }, [session?.user?.id, socket.connected]);

  useEffect(() => {
    const socket = getSocket();
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

// Fonction de cleanup pour déconnecter proprement
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}