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
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
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