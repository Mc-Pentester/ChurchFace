"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Users, Flame, Video, Plus, Search, Bell } from "lucide-react";
import { PrayerAdvancedSearch } from "@/components/prayer/search/PrayerAdvancedSearch";
import { PrayerNotificationCenter } from "@/components/prayer/notifications/PrayerNotificationCenter";

export default function PrayersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chains" | "campaigns" | "rooms">("chains");
  const [showSearch, setShowSearch] = useState(false);

  const TABS = [
    { id: "chains" as const, label: "Chaînes", icon: Users, href: "/prayers/chains" },
    { id: "campaigns" as const, label: "Campagnes", icon: Flame, href: "/prayers/campaigns" },
    { id: "rooms" as const, label: "Salles", icon: Video, href: "/prayers/rooms" },
  ];

  const handleTabChange = (tabId: "chains" | "campaigns" | "rooms") => {
    setActiveTab(tabId);
    router.push(TABS.find((t) => t.id === tabId)?.href || "/prayers/chains");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-emerald-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Réseau d'Intercession</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              <PrayerNotificationCenter
                notifications={[]}
                unreadCount={0}
                onMarkAsRead={() => {}}
                onMarkAllAsRead={() => {}}
                onDelete={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("chains")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "chains"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Chaînes
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "campaigns"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Campagnes
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === "rooms"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Salles
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "chains" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Chaînes de prière récentes</h2>
                <button
                  onClick={() => router.push("/prayers/chains")}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Voir toutes les chaînes →
                </button>
              </div>
            )}
            {activeTab === "campaigns" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Campagnes actives</h2>
                <button
                  onClick={() => router.push("/prayers/campaigns")}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Voir toutes les campagnes →
                </button>
              </div>
            )}
            {activeTab === "rooms" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Salles disponibles</h2>
                <button
                  onClick={() => router.push("/prayers/rooms")}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Voir toutes les salles →
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PrayerAdvancedSearch
              onSearch={(filters) => console.log("Search:", filters)}
              churches={[]}
              groups={[]}
              ministries={[]}
            />
            <button className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors w-full">
              <Plus className="w-4 h-4" />
              Nouveau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
