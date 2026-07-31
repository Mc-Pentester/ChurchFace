"use client";

import { useState, useEffect } from "react";
import ChurchFeed from "./ChurchFeed";

interface ChurchTabsProps {
  church: any;
  churchSlug: string;
}

type TabType = "feed" | "events" | "sermons" | "prayer" | "media" | "radio" | "members" | "about" | "admin";

export default function ChurchTabs({ church, churchSlug }: ChurchTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [events, setEvents] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const tabs = [
    { id: "feed" as TabType, label: "Fil d'actualité", icon: "📝" },
    { id: "events" as TabType, label: "Événements", icon: "📅" },
    { id: "sermons" as TabType, label: "Prédications", icon: "🎤" },
    { id: "prayer" as TabType, label: "Prières", icon: "🙏" },
    { id: "media" as TabType, label: "Médias", icon: "📷" },
    { id: "radio" as TabType, label: "Radio", icon: "📻" },
    { id: "members" as TabType, label: "Membres", icon: "👥" },
    { id: "about" as TabType, label: "À propos", icon: "ℹ️" },
    ...(church.isAdmin ? [{ id: "admin" as TabType, label: "Admin", icon: "⚙️" }] : []),
  ];

  useEffect(() => {
    if (activeTab === "events") {
      fetchEvents();
    } else if (activeTab === "media") {
      fetchMedia();
    } else if (activeTab === "members") {
      fetchMembers();
    }
  }, [activeTab, churchSlug]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await fetch(`/api/church/${churchSlug}/events`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const response = await fetch(`/api/church/${churchSlug}/media`);
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch(`/api/church/${churchSlug}/members`);
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case "feed":
        return <ChurchFeed churchId={church.id} churchSlug={churchSlug} />;
      case "events":
        if (loadingEvents) {
          return (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Aucun événement à venir.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                    )}
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>📅 {formatDate(event.startDate)}</p>
                      {event.location && (
                        <p>📍 {event.location}</p>
                      )}
                      <p>👥 {event._count?.attendees || 0} participants</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "sermons":
        return (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Prédications</p>
              <p className="text-sm mt-2">Les prédications seront bientôt disponibles.</p>
            </div>
          </div>
        );
      case "prayer":
        return (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Prières</p>
              <p className="text-sm mt-2">Les prières seront bientôt disponibles.</p>
            </div>
          </div>
        );
      case "media":
        if (loadingMedia) {
          return (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="p-6">
            {media.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Aucun média disponible.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.caption || "Media"}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-4xl">📄</span>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.caption || "Sans titre"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "radio":
        return (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Radio</p>
              <p className="text-sm mt-2">La radio sera bientôt disponible.</p>
            </div>
          </div>
        );
      case "members":
        if (loadingMembers) {
          return (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className="p-6">
            {members.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Aucun membre.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    {member.user?.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                        {member.user?.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{member.user?.name}</h3>
                      {member.user?.email && (
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
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
      case "admin":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Administration</h2>
            <div className="space-y-4">
              <a
                href={`/church/${churchSlug}/admin`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dashboard</h3>
                    <p className="text-sm text-gray-500">Vue d'ensemble de l'église</p>
                  </div>
                </div>
              </a>
              <a
                href={`/church/${churchSlug}/admin/events`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gérer les événements</h3>
                    <p className="text-sm text-gray-500">Créer et modifier les événements</p>
                  </div>
                </div>
              </a>
              <a
                href={`/church/${churchSlug}/admin/members`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gérer les membres</h3>
                    <p className="text-sm text-gray-500">Administrer les membres de l'église</p>
                  </div>
                </div>
              </a>
              <a
                href={`/church/${churchSlug}/admin/settings`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Paramètres</h3>
                    <p className="text-sm text-gray-500">Modifier les informations de l'église</p>
                  </div>
                </div>
              </a>
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
