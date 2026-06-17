"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Radio, Eye, Calendar } from "lucide-react";
import type { LiveBroadcast } from "@/types/preaching";

export default function LivePage() {
  const [broadcasts, setBroadcasts] = useState<LiveBroadcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch("/api/live?status=LIVE");
      const data = await res.json();
      setBroadcasts(data || []);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const liveBroadcasts = broadcasts.filter((b) => b.status === "LIVE");
  const scheduledBroadcasts = broadcasts.filter((b) => b.status === "SCHEDULED");

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Radio className="text-red-500" />
            Diffusions en direct
          </h1>
          <Link
            href="/preachings"
            className="bg-gradient-to-r from-emerald-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Voir les prédications
          </Link>
        </div>

        {/* LIVE NOW */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-red-500 flex items-center gap-2 mb-6">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            En direct maintenant
          </h2>
          {loading ? (
            <div className="text-gray-500">Chargement...</div>
          ) : liveBroadcasts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <Radio size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune diffusion en cours</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveBroadcasts.map((broadcast) => (
                <Link
                  key={broadcast.id}
                  href={`/live/${broadcast.id}`}
                  className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition group"
                >
                  <div className="aspect-video bg-gradient-to-br from-red-500 to-purple-600 rounded-t-2xl flex items-center justify-center relative">
                    <Play size={48} className="text-white opacity-80" />
                    <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition mb-2">
                      {broadcast.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      {broadcast.author?.image && (
                        <img
                          src={broadcast.author.image || "/default-avatar.png"}
                          alt={broadcast.author.name || ""}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span>{broadcast.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {broadcast.viewerCount} spectateurs
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* SCHEDULED */}
        {scheduledBroadcasts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-6">
              <Calendar size={20} />
              Programmés
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {scheduledBroadcasts.map((broadcast) => (
                <div
                  key={broadcast.id}
                  className="bg-white rounded-2xl shadow-sm p-4"
                >
                  {broadcast.thumbnail && (
                    <div className="aspect-video bg-gray-200 rounded-xl mb-4 overflow-hidden">
                      <img
                        src={broadcast.thumbnail}
                        alt={broadcast.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">{broadcast.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    {broadcast.author?.image && (
                      <img
                        src={broadcast.author.image || "/default-avatar.png"}
                        alt={broadcast.author.name || ""}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span>{broadcast.author?.name}</span>
                  </div>
                  {broadcast.scheduledAt && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <Calendar size={14} />
                      {formatDate(broadcast.scheduledAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
