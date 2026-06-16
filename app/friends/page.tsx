"use client";

import { useState } from "react";
import { Search, UserPlus, Mail, Users, Settings, Church, BookOpen, Radio, Tv, Music } from "lucide-react";
import UserSearch from "@/components/friends/UserSearch";
import FriendRequests from "@/components/friends/FriendRequests";
import FriendSuggestions from "@/components/friends/FriendSuggestions";
import FriendsListWithOnline from "@/components/friends/FriendsListWithOnline";
import SentRequests from "@/components/friends/SentRequests";

type Tab = "requests" | "friends" | "search" | "suggestions" | "sent" | "church" | "interests";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("requests");

  const tabs = [
    { id: "requests" as Tab, icon: Mail, label: "Demandes" },
    { id: "sent" as Tab, icon: UserPlus, label: "Envoyées" },
    { id: "friends" as Tab, icon: Users, label: "Mes amis" },
    { id: "search" as Tab, icon: Search, label: "Recherche" },
    { id: "suggestions" as Tab, icon: UserPlus, label: "Suggestions" },
    { id: "church" as Tab, icon: Church, label: "Mon église" },
    { id: "interests" as Tab, icon: BookOpen, label: "Centres d'intérêt" },
  ];

  const interests = [
    { id: "bible", icon: BookOpen, label: "Étude biblique", count: 45 },
    { id: "prayer", icon: Church, label: "Prière", count: 32 },
    { id: "worship", icon: Music, label: "Louange", count: 28 },
    { id: "radio", icon: Radio, label: "Radio", count: 15 },
    { id: "live", icon: Tv, label: "Live", count: 12 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Amis</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher un ami..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <nav className="divide-y">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition">
                  <Settings size={18} />
                  Paramètres
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "requests" && (
              <div>
                <FriendRequests />
              </div>
            )}

            {activeTab === "sent" && (
              <div>
                <SentRequests />
              </div>
            )}

            {activeTab === "friends" && (
              <div>
                <FriendsListWithOnline />
              </div>
            )}

            {activeTab === "search" && (
              <div>
                <UserSearch />
              </div>
            )}

            {activeTab === "suggestions" && (
              <div>
                <FriendSuggestions />
              </div>
            )}

            {activeTab === "church" && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Amis de mon église</h2>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    {["Tous", "Pasteurs", "Responsables", "Jeunesse", "Musiciens"].map((category) => (
                      <button
                        key={category}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm py-8 text-center">
                    Sélectionnez une catégorie pour voir les amis de votre église
                  </p>
                </div>
              </div>
            )}

            {activeTab === "interests" && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Centres d'intérêt</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interests.map((interest) => (
                    <div
                      key={interest.id}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <interest.icon size={20} className="text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{interest.label}</h3>
                      </div>
                      <p className="text-sm text-gray-500">{interest.count} personnes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
