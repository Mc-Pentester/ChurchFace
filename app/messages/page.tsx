"use client";

import { useEffect, useState } from "react";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import NewConversationModal from "@/components/messaging/NewConversationModal";
import Navbar from "@/components/layout/Navbar";
import type { Conversation, Chat } from "@/types/messaging";
import { socket } from "@/lib/socket";
import { useCurrentUser } from "@/lib/client-auth";

export default function MessagesPage() {
  const { userId: currentUserId, isLoading: sessionLoading } = useCurrentUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConversationList, setShowConversationList] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    fetchConversations();
    
    socket.on("user:online", (userId: string) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.members.some((m) => m.userId === userId)
            ? { ...conv, isOnline: true }
            : conv
        )
      );
    });

    return () => {
      socket.off("user:online");
    };
  }, [currentUserId]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchChat(selectedConversationId);
    }
  }, [selectedConversationId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChat = async (chatId: string) => {
    try {
      const res = await fetch(`/api/conversations/${chatId}`);
      const data = await res.json();
      setSelectedChat(data);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowConversationList(false);
  };

  const handleBack = () => {
    setShowConversationList(true);
    setSelectedConversationId(null);
    setSelectedChat(null);
  };

  const handleNewConversation = () => {
    setShowNewConversationModal(true);
  };

  const handleSelectUser = async (userId: string) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      });
      
      if (!res.ok) {
        console.error("Failed to create conversation:", res.status);
        return;
      }
      
      const data = await res.json();
      
      // Refresh conversations and select the new one
      await fetchConversations();
      
      // Find the new conversation from the refreshed list
      const newConversation = conversations.find(c => 
        c.members.some((m: { user?: { id: string } }) => m.user?.id === userId)
      );
      
      if (newConversation) {
        setSelectedConversationId(newConversation.id);
        setShowConversationList(false);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      {/* Navbar */}
      <Navbar />

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
            
          </h1>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List - Desktop Sidebar */}
        <div className={`hidden lg:flex lg:w-96 flex-col ${showConversationList ? "flex" : "hidden"}`}>
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Conversation List - Mobile */}
        <div className={`lg:hidden flex-1 flex-col ${showConversationList ? "flex" : "hidden"}`}>
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Chat Window - Desktop */}
        <div className={`hidden lg:flex flex-1 ${!showConversationList ? "flex" : "hidden"}`}>
          <ChatWindow
            chat={selectedChat}
            currentUserId={currentUserId || ""}
            onBack={handleBack}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Chat Window - Mobile */}
        <div className={`lg:hidden flex-1 flex-col ${!showConversationList ? "flex" : "hidden"}`}>
          <ChatWindow
            chat={selectedChat}
            currentUserId={currentUserId || ""}
            onBack={handleBack}
            onNewConversation={handleNewConversation}
          />
        </div>
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}