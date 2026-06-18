"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MoreVertical, Phone, Video, Info, Plus } from "lucide-react";
import type { Message, Chat } from "@/types/messaging";
import { socket } from "@/lib/socket";
import CallModal from "./CallModal";

interface ChatWindowProps {
  chat: Chat | null;
  currentUserId: string;
  onBack: () => void;
  onNewConversation?: () => void;
}

export default function ChatWindow({ chat, currentUserId, onBack, onNewConversation }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");

  const typingTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chat) return;

    setIsLoading(true);

    // Fetch initial messages
    fetch(`/api/conversations/${chat.id}/messages`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        setIsLoading(false);
      });

    // Join chat room
    socket.emit("chat:join", chat.id);

    // Listen for new messages
    const handleNewMessage = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };

    // Listen for typing updates
    const handleTyping = ({ userId, isTyping }: any) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.includes(userId)) return [...prev, userId];
          return prev;
        } else {
          return prev.filter((u) => u !== userId);
        }
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:update", handleTyping);
    };
  }, [chat]);

  const sendMessage = async () => {
    if (!text.trim() || !chat) return;

    const msg = {
      chatId: chat.id,
      senderId: currentUserId,
      content: text,
    };

    try {
      // Save message to database via API
      const res = await fetch(`/api/conversations/${chat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        console.error("Failed to send message");
        return;
      }

      const savedMessage = await res.json();

      // Add message to local state immediately
      setMessages((prev) => [...prev, savedMessage]);
      setText("");

      // Broadcast via socket for real-time updates
      socket.emit("message:send", savedMessage);
      socket.emit("typing", { chatId: chat.id, userId: currentUserId, isTyping: false });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTypingInput = (value: string) => {
    setText(value);

    if (!chat) return;

    socket.emit("typing", { chatId: chat.id, userId: currentUserId, isTyping: true });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("typing", { chatId: chat.id, userId: currentUserId, isTyping: false });
    }, 1000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const getChatName = () => {
    if (!chat) return "";
    if (chat.isGroup) return chat.name || "Groupe";
    const otherMember = chat.members.find((m) => m.userId !== currentUserId);
    return otherMember?.user?.name || "Inconnu";
  };

  const getChatAvatar = () => {
    if (!chat) return null;
    if (chat.isGroup) return null;
    const otherMember = chat.members.find((m) => m.userId !== currentUserId);
    return otherMember?.user?.image || null;
  };

  const handleStartAudioCall = () => {
    setCallType("audio");
    setIsCallModalOpen(true);
  };

  const handleStartVideoCall = () => {
    setCallType("video");
    setIsCallModalOpen(true);
  };

  const handleEndCall = () => {
    setIsCallModalOpen(false);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-purple-50">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-200 to-purple-200 flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Bienvenue dans Messages</h2>
          <p className="text-gray-500 text-sm mb-4">Sélectionnez une conversation pour commencer</p>
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
            >
              Nouvelle conversation
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-purple-500 shadow-sm flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/20 transition text-white"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
            {getChatAvatar() ? (
              <img src={getChatAvatar()!} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-emerald-600 font-bold">
                {getChatName()[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-white">{getChatName()}</h2>
            {typingUsers.length > 0 && (
              <p className="text-xs text-white/80">Écrit...</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStartAudioCall}
            className="p-2 rounded-full hover:bg-white/20 transition text-white"
          >
            <Phone size={18} />
          </button>
          <button
            onClick={handleStartVideoCall}
            className="p-2 rounded-full hover:bg-white/20 transition text-white"
          >
            <Video size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/20 transition text-white">
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 bg-emerald-500/10" />
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isMe = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${isMe ? "flex flex-col items-end" : "flex flex-col items-start"}`}>
                    {!isMe && message.sender && (
                      <p className="text-xs text-gray-500 mb-1 ml-2">
                        {message.sender.name || "Utilisateur"}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? "bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${isMe ? "mr-2" : "ml-2"}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500">
            <Plus size={20} />
          </button>
          <input
            value={text}
            onChange={(e) => handleTypingInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            placeholder="Écrire un message..."
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="p-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={handleEndCall}
        callType={callType}
        recipientName={getChatName()}
        recipientImage={getChatAvatar()}
      />
    </div>
  );
}
