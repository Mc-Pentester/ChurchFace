"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video, Radio, Eye, Clock } from "lucide-react";

interface Stream {
  id: string;
  title: string;
  description?: string;
  isLive: boolean;
  startedAt: string;
  viewerCount: number;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function LivePage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/streams")
      .then((res) => res.json())
      .then((data) => {
        if (data.streams) setStreams(data.streams);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const liveStreams = streams.filter((s) => s.isLive);
  const pastStreams = streams.filter((s) => !s.isLive);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Radio className="text-red-500" />
          Lives & Streams
        </h1>
        <Link
          href="/live/start"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          📡 Démarrer un live
        </Link>
      </div>

      {/* LIVE NOW */}
      <section>
        <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          En direct
        </h2>
        {loading ? (
          <div className="text-gray-500 text-sm">Chargement...</div>
        ) : liveStreams.length === 0 ? (
          <div className="text-gray-500 text-sm">Aucun live en cours.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {liveStreams.map((stream) => (
              <Link
                key={stream.id}
                href={`/live/${stream.id}`}
                className="block bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-emerald-600 transition">
                      {stream.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {stream.user.name}
                    </div>
                    {stream.description && (
                      <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {stream.description}
                      </div>
                    )}
                  </div>
                  <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {stream.viewerCount} spectateurs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(stream.startedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PAST STREAMS */}
      {pastStreams.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Video size={18} />
            Replays
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastStreams.map((stream) => (
              <div
                key={stream.id}
                className="bg-gray-50 rounded-2xl p-5 border opacity-70"
              >
                <div className="font-semibold text-gray-600">{stream.title}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {stream.user.name} — Terminé
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatDuration(startedAt: string) {
  const diff = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}
