"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Users, MoreVertical, Trash2 } from "lucide-react";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  isModerator?: boolean;
}

interface StudioChatProps {
  broadcastId: string;
  userId: string;
  userName: string;
  onMessageDelete?: (messageId: string) => void;
  onUserBan?: (userId: string) => void;
  isModerator?: boolean;
}

export default function StudioChat({
  broadcastId,
  userId,
  userName,
  onMessageDelete,
  onUserBan,
  isModerator = false,
}: StudioChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to Socket.io
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // Use stream:join instead of join-live (matches server.ts events)
      socket.emit("stream:join", broadcastId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Use stream:chat instead of chat-message (matches server.ts events)
    socket.on("stream:chat", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Note: viewer-count not implemented in server.ts, would need to be added
    // socket.on("viewer-count", (count: number) => {
    //   setViewerCount(count);
    // });

    return () => {
      // Don't disconnect the global socket, just remove listeners
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stream:chat");
    };
  }, [broadcastId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId,
      userName,
      message: newMessage.trim(),
      timestamp: new Date(),
      isModerator,
    };

    // Use stream:chat instead of send-chat-message (matches server.ts events)
    socketRef.current.emit("stream:chat", {
      streamId: broadcastId,
      msg: message,
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("delete-message", { broadcastId, messageId });
      onMessageDelete?.(messageId);
    }
  };

  const handleBanUser = (targetUserId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("ban-user", { broadcastId, userId: targetUserId });
      onUserBan?.(targetUserId);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Chat en direct</h3>
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Users size={14} />
          <span>{viewerCount} spectateurs</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Aucun message pour le moment
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`group relative p-2 rounded-lg ${
                msg.userId === userId
                  ? "bg-violet-600/20"
                  : "bg-[#252535]"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {msg.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-medium">
                      {msg.userName}
                    </span>
                    {msg.isModerator && (
                      <span className="bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded">
                        Mod
                      </span>
                    )}
                    <span className="text-gray-500 text-xs">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm break-words">{msg.message}</p>
                </div>
              </div>

              {/* Moderator actions */}
              {isModerator && msg.userId !== userId && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="bg-red-600/80 hover:bg-red-700 text-white p-1 rounded"
                    title="Supprimer"
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    onClick={() => handleBanUser(msg.userId)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded"
                    title="Bannir"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <button className="text-gray-400 hover:text-white p-2">
          <Smile size={20} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez un message..."
          className="flex-1 bg-[#252535] text-white placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          disabled={!isConnected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || !isConnected}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition"
        >
          <Send size={20} />
        </button>
      </div>

      {!isConnected && (
        <div className="text-center text-red-400 text-xs mt-2">
          Connexion au chat en cours...
        </div>
      )}
    </div>
  );
}
