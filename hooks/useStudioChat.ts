"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  isPinned: boolean;
  isDeleted: boolean;
  replyTo?: string;
  reactions?: {
    emoji: string;
    count: number;
    userIds: string[];
  }[];
}

export interface StudioChatConfig {
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  socketUrl?: string;
}

export function useStudioChat(config: StudioChatConfig) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const socketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to chat server
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const socketUrl = config.socketUrl || `ws://localhost:3001/chat/${config.roomId}`;
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      setIsConnected(true);
      console.log("Studio chat connected");
      
      // Send join message
      socket.send(JSON.stringify({
        type: "join",
        roomId: config.roomId,
        userId: config.userId,
        userName: config.userName,
        userAvatar: config.userAvatar,
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSocketMessage(data);
      } catch (error) {
        console.error("Error parsing chat message:", error);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log("Studio chat disconnected");
      
      // Attempt reconnection after 3 seconds
      setTimeout(() => {
        connect();
      }, 3000);
    };

    socket.onerror = (error) => {
      console.error("Studio chat error:", error);
      setIsConnected(false);
    };

    socketRef.current = socket;
  }, [config]);

  // Handle incoming socket messages
  const handleSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case "message":
        setMessages((prev) => [...prev, data.message]);
        break;
      
      case "message_deleted":
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, isDeleted: true } : msg
          )
        );
        break;
      
      case "message_pinned":
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, isPinned: data.pinned } : msg
          )
        );
        break;
      
      case "typing":
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
        break;
      
      case "reaction":
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  reactions: data.reactions,
                }
              : msg
          )
        );
        break;
      
      case "history":
        setMessages(data.messages || []);
        break;
    }
  }, []);

  // Send message
  const sendMessage = useCallback((content: string, replyTo?: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("Chat not connected");
      return;
    }

    const message: Omit<ChatMessage, "id" | "timestamp"> = {
      userId: config.userId,
      userName: config.userName,
      userAvatar: config.userAvatar,
      content,
      isPinned: false,
      isDeleted: false,
      replyTo,
    };

    socketRef.current.send(
      JSON.stringify({
        type: "message",
        roomId: config.roomId,
        message,
      })
    );
  }, [config]);

  // Reply to message
  const replyToMessage = useCallback((messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      // In a real implementation, this would open a reply UI
      console.log("Replying to:", message);
    }
  }, [messages]);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "delete_message",
        roomId: config.roomId,
        messageId,
        userId: config.userId,
      })
    );
  }, [config]);

  // Pin message
  const pinMessage = useCallback((messageId: string, pinned: boolean) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "pin_message",
        roomId: config.roomId,
        messageId,
        pinned,
        userId: config.userId,
      })
    );
  }, [config]);

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "reaction",
        roomId: config.roomId,
        messageId,
        emoji,
        userId: config.userId,
      })
    );
  }, [config]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "typing",
        roomId: config.roomId,
        userId: config.userId,
        isTyping,
      })
    );

    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 3000);
    }
  }, [config]);

  // Get pinned messages
  const getPinnedMessages = useCallback(() => {
    return messages.filter((m) => m.isPinned && !m.isDeleted);
  }, [messages]);

  // Get active messages (not deleted)
  const getActiveMessages = useCallback(() => {
    return messages.filter((m) => !m.isDeleted);
  }, [messages]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [connect, disconnect]);

  return {
    // State
    messages,
    isConnected,
    isTyping,
    typingUsers,
    pinnedMessages: getPinnedMessages(),
    activeMessages: getActiveMessages(),

    // Actions
    sendMessage,
    replyToMessage,
    deleteMessage,
    pinMessage,
    addReaction,
    sendTyping,
    clearChat,

    // Connection
    connect,
    disconnect,
  };
}
