"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Users, MoreVertical, Trash2, Shield, AlertTriangle, RefreshCw } from "lucide-react";
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
  isSubscriber?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

interface StudioChatProps {
  broadcastId: string;
  userId: string;
  userName: string;
  onMessageDelete?: (messageId: string) => void;
  onUserBan?: (userId: string) => void;
  onUserTimeout?: (userId: string, duration: number) => void;
  isModerator?: boolean;
}

const EMOJIS = ["😀", "😂", "❤️", "👍", "🎉", "🔥", "💯", "🙏", "😮", "🤔", "👋", "✨"];

export default function StudioChat({
  broadcastId,
  userId,
  userName,
  onMessageDelete,
  onUserBan,
  onUserTimeout,
  isModerator = false,
}: StudioChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showModeratorMenu, setShowModeratorMenu] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to Socket.io
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      socket.emit("stream:join", broadcastId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsReconnecting(true);
    };

    const handleReconnect = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      socket.emit("stream:join", broadcastId);
    };

    const handleChatMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleViewerCount = (count: number) => {
      setViewerCount(count);
    };

    const handleTyping = (data: { userId: string; userName: string }) => {
      if (data.userId !== userId) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter(name => name !== data.userName));
        }, 3000);
      }
    };

    const handleDeleteMessage = (messageId: string) => {
      setMessages((prev) => prev.filter(msg => msg.id !== messageId));
      onMessageDelete?.(messageId);
    };

    const handleBanUser = (data: { userId: string }) => {
      setMessages((prev) => prev.filter(msg => msg.userId !== data.userId));
      onUserBan?.(data.userId);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);
    socket.on("stream:chat", handleChatMessage);
    socket.on("viewer-count", handleViewerCount);
    socket.on("user-typing", handleTyping);
    socket.on("message-deleted", handleDeleteMessage);
    socket.on("user-banned", handleBanUser);

    // Initial connection
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);
      socket.off("stream:chat", handleChatMessage);
      socket.off("viewer-count", handleViewerCount);
      socket.off("user-typing", handleTyping);
      socket.off("message-deleted", handleDeleteMessage);
      socket.off("user-banned", handleBanUser);
    };
  }, [broadcastId, userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Emit typing indicator
  const handleTypingStart = () => {
    if (socketRef.current && newMessage.trim()) {
      socketRef.current.emit("user-typing", { broadcastId, userId, userName });
    }
  };

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

    socketRef.current.emit("stream:chat", {
      streamId: broadcastId,
      msg: message,
    });

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("delete-message", { broadcastId, messageId });
      setMessages((prev) => prev.filter(msg => msg.id !== messageId));
      onMessageDelete?.(messageId);
      setShowModeratorMenu(null);
    }
  };

  const handleBanUser = (targetUserId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("ban-user", { broadcastId, userId: targetUserId });
      setMessages((prev) => prev.filter(msg => msg.userId !== targetUserId));
      onUserBan?.(targetUserId);
      setShowModeratorMenu(null);
    }
  };

  const handleTimeoutUser = (targetUserId: string, duration: number) => {
    if (socketRef.current) {
      socketRef.current.emit("timeout-user", { broadcastId, userId: targetUserId, duration });
      onUserTimeout?.(targetUserId, duration);
      setShowModeratorMenu(null);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (socketRef.current) {
      socketRef.current.emit("add-reaction", { broadcastId, messageId, emoji, userId });
      setMessages((prev) => prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions?.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, users: [...r.users, userId] }
                  : r
              )
            };
          } else {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { emoji, count: 1, users: [userId] }]
            };
          }
        }
        return msg;
      }));
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
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm">Chat en direct</h3>
          {isReconnecting && (
            <RefreshCw size={14} className="text-yellow-500 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Users size={14} />
          <span>{viewerCount} spectateurs</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <div className="text-3xl mb-2">💬</div>
            <p>Aucun message pour le moment</p>
            <p className="text-xs mt-1">Soyez le premier à saluer !</p>
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
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white text-sm font-medium">
                      {msg.userName}
                    </span>
                    {msg.isModerator && (
                      <span className="bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Shield size={10} />
                        Mod
                      </span>
                    )}
                    {msg.isSubscriber && (
                      <span className="bg-purple-500/20 text-purple-400 text-xs px-1.5 py-0.5 rounded">
                        ⭐ Sub
                      </span>
                    )}
                    <span className="text-gray-500 text-xs">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm break-words">{msg.message}</p>
                  
                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {msg.reactions.map((reaction, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleReaction(msg.id, reaction.emoji)}
                          className="bg-[#353545] hover:bg-[#454555] text-xs px-2 py-1 rounded-full flex items-center gap-1 transition"
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-gray-400">{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Moderator actions */}
              {isModerator && msg.userId !== userId && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                  <button
                    onClick={() => setShowModeratorMenu(showModeratorMenu === msg.id ? null : msg.id)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded"
                    title="Actions modérateur"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              )}

              {/* Moderator dropdown menu */}
              {showModeratorMenu === msg.id && (
                <div className="absolute top-10 right-2 bg-[#252535] rounded-lg shadow-xl border border-gray-700 z-20 w-40">
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-[#353545] rounded-t-lg"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                  <button
                    onClick={() => handleTimeoutUser(msg.userId, 600)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-yellow-400 hover:bg-[#353545]"
                  >
                    <AlertTriangle size={14} />
                    Timeout 10m
                  </button>
                  <button
                    onClick={() => handleBanUser(msg.userId)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-[#353545] rounded-b-lg"
                  >
                    <Shield size={14} />
                    Bannir
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="text-gray-500 text-xs py-2">
            {typingUsers.length === 1
              ? `${typingUsers[0]} est en train d'écrire...`
              : `${typingUsers.join(", ")} sont en train d'écrire...`}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 relative overflow-hidden">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-400 hover:text-white p-2 relative flex-shrink-0"
        >
          <Smile size={20} />
        </button>
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 bg-[#252535] rounded-lg shadow-xl border border-gray-700 p-2 grid grid-cols-4 gap-1 z-20">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiSelect(emoji)}
              className="text-2xl hover:bg-[#353545] p-2 rounded transition"
            >
              {emoji}
            </button>
          ))}
        </div>
        )}
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTypingStart();
          }}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez un message..."
          className="flex-1 min-w-0 bg-[#252535] text-white placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          disabled={!isConnected}
        />
        
        <button
          onClick={handleSendMessage}
          disabled={!isConnected || !newMessage.trim()}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition flex-shrink-0"
        >
          <Send size={20} />
        </button>
      </div>

      {!isConnected && (
        <div className="text-center text-red-400 text-xs mt-2">
          {isReconnecting ? "Reconnexion..." : "Connexion au chat en cours..."}
        </div>
      )}
    </div>
  );
}
