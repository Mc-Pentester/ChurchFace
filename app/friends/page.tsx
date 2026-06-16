"use client";

import { useState } from "react";
import { Search, UserPlus, Mail, Users, Settings, Church, BookOpen, Radio, Tv, Music, Grid3x3, Calendar, Home } from "lucide-react";
import UserSearch from "@/components/friends/UserSearch";
import FriendRequests from "@/components/friends/FriendRequests";
import FriendSuggestions from "@/components/friends/FriendSuggestions";
import FriendsListWithOnline from "@/components/friends/FriendsListWithOnline";
import SentRequests from "@/components/friends/SentRequests";
import OnlineFriends from "@/components/friends/OnlineFriends";
import PeopleYouKnow from "@/components/friends/PeopleYouKnow";

type Tab = "overview" | "requests" | "sent" | "friends" | "suggestions" | "church" | "groups" | "birthdays";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs = [
    { id: "overview" as Tab, icon: Home, label: "Vue d'ensemble" },
    { id: "requests" as Tab, icon: Mail, label: "Demandes reçues" },
    { id: "sent" as Tab, icon: UserPlus, label: "Demandes envoyées" },
    { id: "friends" as Tab, icon: Users, label: "Mes amis" },
    { id: "suggestions" as Tab, icon: UserPlus, label: "Suggestions" },
    { id: "church" as Tab, icon: Church, label: "Amis de mon église" },
    { id: "groups" as Tab, icon: Grid3x3, label: "Groupes" },
    { id: "birthdays" as Tab, icon: Calendar, label: "Anniversaires" },
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
          {/* Left Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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

          {/* Central Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <UserSearch />
                <FriendRequests />
                <FriendSuggestions />
              </div>
            )}

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

            {activeTab === "groups" && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Groupes</h2>
                <p className="text-gray-500 text-sm py-8 text-center">
                  Fonctionnalité à venir
                </p>
              </div>
            )}

            {activeTab === "birthdays" && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Anniversaires</h2>
                <p className="text-gray-500 text-sm py-8 text-center">
                  Fonctionnalité à venir
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6">
              <OnlineFriends />
              <PeopleYouKnow />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
