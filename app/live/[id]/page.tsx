"use client";

import { useEffect, useState } from "react";
import { Play, Radio, Users, MessageCircle, Heart, Share2, Clock, Calendar } from "lucide-react";
import type { LiveBroadcast } from "@/types/preaching";

export default function LivePage({ params }: { params: { id: string } }) {
  const [broadcast, setBroadcast] = useState<LiveBroadcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    fetchBroadcast();
    // Simulate real-time viewer count updates
    const interval = setInterval(() => {
      if (broadcast?.status === "LIVE") {
        setViewerCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [params.id, broadcast?.status]);

  const fetchBroadcast = async () => {
    try {
      const res = await fetch(`/api/live/${params.id}`);
      const data = await res.json();
      setBroadcast(data);
      setViewerCount(data.viewerCount || 0);
    } catch (error) {
      console.error("Error fetching broadcast:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Non programmé";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Radio size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Diffusion non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Video Player Section */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center relative">
            {broadcast.status === "LIVE" ? (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-semibold">EN DIRECT</span>
              </div>
            ) : broadcast.status === "SCHEDULED" ? (
              <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <Calendar size={16} />
                <span className="font-semibold">PROGRAMMÉ</span>
              </div>
            ) : (
              <div className="absolute top-4 left-4 bg-gray-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <span className="font-semibold">TERMINÉ</span>
              </div>
            )}
            
            {broadcast.status === "LIVE" ? (
              <Play size={96} className="text-white opacity-80" />
            ) : broadcast.status === "SCHEDULED" ? (
              <div className="text-center text-white">
                <Calendar size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-2xl font-semibold">{formatDate(broadcast.scheduledAt)}</p>
              </div>
            ) : (
              <div className="text-center text-white">
                <Radio size={64} className="mx-auto mb-4 opacity-80" />
                <p className="text-2xl font-semibold">Diffusion terminée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{broadcast.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {broadcast.author?.image && (
                      <img
                        src={broadcast.author.image || "/default-avatar.png"}
                        alt={broadcast.author.name || ""}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span>{broadcast.author?.name}</span>
                  </div>
                </div>
                {broadcast.status === "LIVE" && (
                  <div className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-xl">
                    <Users size={18} />
                    <span className="font-semibold">{viewerCount}</span>
                  </div>
                )}
              </div>

              {broadcast.description && (
                <p className="text-gray-700 mb-6">{broadcast.description}</p>
              )}

              <div className="flex items-center gap-3">
                {broadcast.status === "LIVE" && (
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:opacity-90 transition-opacity font-medium">
                    <Radio size={18} />
                    Regarder le live
                  </button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <Heart size={20} />
                  <span>J'aime</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <Share2 size={20} />
                  <span>Partager</span>
                </button>
              </div>

              {broadcast.status === "SCHEDULED" && broadcast.scheduledAt && (
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-emerald-600" size={24} />
                    <div>
                      <p className="font-semibold text-gray-900">Date de diffusion</p>
                      <p className="text-gray-600">{formatDate(broadcast.scheduledAt)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Chat */}
            {broadcast.status === "LIVE" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Chat en direct
                </h3>
                <div className="h-96 bg-gray-50 rounded-xl p-4 mb-4 overflow-y-auto">
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Chat en direct (Socket.IO implementation needed)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Envoyer un message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity">
                    Envoyer
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-4 space-y-4">
              {/* Broadcast Info */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Radio className="text-red-500" size={16} />
                    <span className="text-gray-600">Statut:</span>
                    <span className="font-medium">
                      {broadcast.status === "LIVE" ? "En direct" : broadcast.status === "SCHEDULED" ? "Programmé" : "Terminé"}
                    </span>
                  </div>
                  {broadcast.status === "LIVE" && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="text-emerald-500" size={16} />
                      <span className="text-gray-600">Spectateurs:</span>
                      <span className="font-medium">{viewerCount}</span>
                    </div>
                  )}
                  {broadcast.scheduledAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-purple-500" size={16} />
                      <span className="text-gray-600">Programmé:</span>
                      <span className="font-medium">{formatDate(broadcast.scheduledAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Live Broadcasts */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Autres lives</h3>
                <div className="text-center py-8 text-gray-500">
                  <Radio size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Chargement...</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
