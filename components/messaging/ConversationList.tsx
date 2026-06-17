"use client";

import { useEffect, useState } from "react";
import { Search, MoreVertical, Plus, MessageCircle } from "lucide-react";
import type { Conversation } from "@/types/messaging";
import { socket } from "@/lib/socket";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    socket.on("presence:update", setOnlineUsers);

    return () => {
      socket.off("presence:update");
    };
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-50 to-purple-50">
      {/* Header */}
      <div className="p-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
            Messages
          </h1>
          <button
            onClick={onNewConversation}
            className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white hover:shadow-lg transition"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">
              {searchQuery ? "Aucune conversation trouvée" : "Aucune conversation"}
            </p>
            <button
              onClick={onNewConversation}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
            >
              Nouvelle conversation
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => {
              const isOnline = conversation.members.some(
                (m) => onlineUsers.includes(m.userId) && m.userId !== conversation.members[0]?.userId
              );

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-3 rounded-xl transition flex items-center gap-3 ${
                    selectedConversationId === conversation.id
                      ? "bg-gradient-to-r from-emerald-500 to-purple-500 text-white shadow-lg"
                      : "hover:bg-white/50"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center overflow-hidden">
                      {conversation.avatar ? (
                        <img src={conversation.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {conversation.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`font-semibold truncate text-sm ${
                        selectedConversationId === conversation.id ? "text-white" : "text-gray-900"
                      }`}>
                        {conversation.name}
                      </h3>
                      <span className={`text-xs ${
                        selectedConversationId === conversation.id ? "text-white/80" : "text-gray-400"
                      }`}>
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${
                        selectedConversationId === conversation.id ? "text-white/80" : "text-gray-500"
                      }`}>
                        {conversation.isTyping ? "Écrit..." : conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div className="flex-shrink-0 ml-2 px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-purple-500 text-white text-xs font-bold rounded-full">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
