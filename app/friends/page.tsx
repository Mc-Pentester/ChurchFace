"use client";

import { useState } from "react";
import { Search, UserPlus, Mail, Users, Settings, Church, BookOpen, Radio, Tv, Music, Grid3x3, Calendar, Home, Menu, X, MessageCircle, Bell, User as UserIcon } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const mobileNavItems = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/friends", icon: Users, label: "Amis" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/profile", icon: UserIcon, label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <Navbar onLoginClick={() => {}} />
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">Amis</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
                    activeTab === tab.id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              <div className="border-t my-4" />
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition">
                <Settings size={18} />
                Paramètres
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Amis</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar Navigation - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <nav className="divide-y">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
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
          <div className="flex-1 min-w-0">
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Amis de mon église</h2>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {["Tous", "Pasteurs", "Responsables", "Jeunesse", "Musiciens"].map((category) => (
                      <button
                        key={category}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition whitespace-nowrap"
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Groupes</h2>
                <p className="text-gray-500 text-sm py-8 text-center">
                  Fonctionnalité à venir
                </p>
              </div>
            )}

            {activeTab === "birthdays" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Anniversaires</h2>
                <p className="text-gray-500 text-sm py-8 text-center">
                  Fonctionnalité à venir
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop/Tablet */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className="space-y-6">
              <OnlineFriends />
              <PeopleYouKnow />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition min-w-[3rem] ${
                item.href === "/friends"
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <item.icon size={22} strokeWidth={item.href === "/friends" ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
