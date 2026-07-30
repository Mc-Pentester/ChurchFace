"use client";

import { useState } from "react";
import ChurchFeed from "./ChurchFeed";

interface ChurchTabsProps {
  church: any;
  churchSlug: string;
}

type TabType = "feed" | "events" | "sermons" | "prayer" | "media" | "radio" | "members" | "about";

export default function ChurchTabs({ church, churchSlug }: ChurchTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("feed");

  const tabs = [
    { id: "feed" as TabType, label: "Fil d'actualité", icon: "📝" },
    { id: "events" as TabType, label: "Événements", icon: "📅" },
    { id: "sermons" as TabType, label: "Prédications", icon: "🎤" },
    { id: "prayer" as TabType, label: "Prières", icon: "🙏" },
    { id: "media" as TabType, label: "Médias", icon: "📷" },
    { id: "radio" as TabType, label: "Radio", icon: "📻" },
    { id: "members" as TabType, label: "Membres", icon: "👥" },
    { id: "about" as TabType, label: "À propos", icon: "ℹ️" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "feed":
        return <ChurchFeed churchId={church.id} churchSlug={churchSlug} />;
      case "events":
        return <div className="p-6 text-center text-gray-500">Événements - À venir</div>;
      case "sermons":
        return <div className="p-6 text-center text-gray-500">Prédications - À venir</div>;
      case "prayer":
        return <div className="p-6 text-center text-gray-500">Prières - À venir</div>;
      case "media":
        return <div className="p-6 text-center text-gray-500">Médias - À venir</div>;
      case "radio":
        return <div className="p-6 text-center text-gray-500">Radio - À venir</div>;
      case "members":
        return <div className="p-6 text-center text-gray-500">Membres - À venir</div>;
      case "about":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>
            {church.description && (
              <p className="text-gray-700 mb-4">{church.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{church._count.members}</div>
                <div className="text-sm text-gray-600">Membres</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{church._count.follows}</div>
                <div className="text-sm text-gray-600">Abonnés</div>
              </div>
            </div>
          </div>
        );
      default:
        return <ChurchFeed churchId={church.id} churchSlug={churchSlug} />;
    }
  };

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
        <div className="flex gap-1 p-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
        {renderTab()}
      </div>
    </div>
  );
}
