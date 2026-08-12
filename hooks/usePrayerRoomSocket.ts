"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface PrayerRoomSocketProps {
  roomId: string;
  onParticipantJoin?: (participantId: string, userId: string) => void;
  onParticipantLeave?: (participantId: string, userId: string) => void;
  onMessage?: (message: any) => void;
  onHandRaised?: (participantId: string, raised: boolean) => void;
  onMuteChange?: (participantId: string, muted: boolean) => void;
}

export function usePrayerRoomSocket({
  roomId,
  onParticipantJoin,
  onParticipantLeave,
  onMessage,
  onHandRaised,
  onMuteChange,
}: PrayerRoomSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"}/prayer-rooms/${roomId}`;
      const socket = new WebSocket(wsUrl);
      
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connecté à la salle de prière:", roomId);
        setIsConnected(true);
        setError(null);
      };

      socket.onclose = (event) => {
        console.log("WebSocket déconnecté:", event.code, event.reason);
        setIsConnected(false);
        
        // Reconnexion automatique après 5 secondes
        if (!event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Tentative de reconnexion...");
            connect();
          }, 5000);
        }
      };

      socket.onerror = (event) => {
        console.error("Erreur WebSocket:", event);
        setError("Erreur de connexion WebSocket");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case "participant_joined":
              onParticipantJoin?.(data.participantId, data.userId);
              break;
            case "participant_left":
              onParticipantLeave?.(data.participantId, data.userId);
              break;
            case "message":
              onMessage?.(data);
              break;
            case "hand_raised":
              onHandRaised?.(data.participantId, data.raised);
              break;
            case "mute_changed":
              onMuteChange?.(data.participantId, data.muted);
              break;
            default:
              console.log("Message WebSocket non géré:", data.type);
          }
        } catch (error) {
          console.error("Erreur parsing message WebSocket:", error);
        }
      };
    } catch (error) {
      console.error("Erreur connexion WebSocket:", error);
      setError("Impossible de se connecter à la salle de prière");
    }
  }, [roomId, onParticipantJoin, onParticipantLeave, onMessage, onHandRaised, onMuteChange]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, ...data }));
    } else {
      console.error("WebSocket non connecté");
    }
  }, []);

  const raiseHand = useCallback((raised: boolean) => {
    sendMessage("raise_hand", { raised });
  }, [sendMessage]);

  const toggleMute = useCallback((muted: boolean) => {
    sendMessage("toggle_mute", { muted });
  }, [sendMessage]);

  const sendChatMessage = useCallback((content: string) => {
    sendMessage("chat_message", { content });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    sendMessage,
    raiseHand,
    toggleMute,
    sendChatMessage,
    disconnect,
  };
}
