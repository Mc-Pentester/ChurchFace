import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

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
      console.log("[CALL][SOCKET][CONNECT]", { socketId: socketInstance?.id });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[CALL][SOCKET][DISCONNECT]", { socketId: socketInstance?.id, reason });
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[CALL][SOCKET][CONNECT_ERROR]", { error });
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("[CALL][SOCKET][RECONNECT]", { socketId: socketInstance?.id, attemptNumber });
    });
  }
  
  return socketInstance;
}

// Export de l'instance pour compatibilité
export const socket = getSocket();

// Hook to emit register when session is available
export function useSocketPresence() {
  const { data: session } = useSession();
  const registeredUserIdRef = useRef<string | null>(null);
  const callsReadyRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    const userId = session?.user?.id;

    // Éviter les register multiples pour le même utilisateur
    if (userId && userId !== registeredUserIdRef.current && socket.connected) {
      console.log("[SOCKET][REGISTER]", { userId, socketId: socket.id });
      socket.emit("register", userId);
      registeredUserIdRef.current = userId;
    }
  }, [session?.user?.id, socket.connected]);

  useEffect(() => {
    const socket = getSocket();
    const userId = session?.user?.id;

    const handleConnect = () => {
      console.log("[SOCKET][CONNECTED]", { socketId: socket.id });
      callsReadyRef.current = false;
      if (userId && userId !== registeredUserIdRef.current) {
        console.log("[SOCKET][REGISTER_ON_CONNECT]", { userId });
        socket.emit("register", userId);
        registeredUserIdRef.current = userId;
      }
    };

    const handleDisconnect = () => {
      console.log("[SOCKET][DISCONNECTED]", { socketId: socket.id });
      // Réinitialiser pour permettre un nouveau register à la reconnexion
      registeredUserIdRef.current = null;
      callsReadyRef.current = false;
    };

    const handleRegisterAck = (data: { userId: string; socketId: string }) => {
      console.log("[SOCKET][REGISTER_ACK]", data);
      if (data.userId === userId) {
        callsReadyRef.current = true;
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("register:ack", handleRegisterAck);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("register:ack", handleRegisterAck);
    };
  }, [session?.user?.id]);

  return callsReadyRef.current;
}

// Fonction de cleanup pour déconnecter proprement
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}