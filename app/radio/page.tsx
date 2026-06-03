"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Headphones, Radio as RadioIcon, User, Clock } from "lucide-react";

interface Radio {
  id: string;
  title: string;
  description?: string;
  isLive: boolean;
  startedAt: string;
  listenerCount: number;
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function RadioPage() {
  const [radios, setRadios] = useState<Radio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/radio")
      .then((res) => res.json())
      .then((data) => {
        if (data.radios) setRadios(data.radios);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const liveRadios = radios.filter((r) => r.isLive);
  const pastRadios = radios.filter((r) => !r.isLive);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Headphones className="text-emerald-600" />
          Radio Live
        </h1>
        <Link
          href="/radio/start"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          🎙️ Démarrer une radio
        </Link>
      </div>

      {/* LIVE NOW */}
      <section>
        <h2 className="text-lg font-semibold text-emerald-600 flex items-center gap-2 mb-3">
          <RadioIcon size={18} />
          En direct
        </h2>
        {loading ? (
          <div className="text-gray-500 text-sm">Chargement...</div>
        ) : liveRadios.length === 0 ? (
          <div className="text-gray-500 text-sm">Aucune radio en cours.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {liveRadios.map((radio) => (
              <Link
                key={radio.id}
                href={`/radio/${radio.id}`}
                className="block bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-emerald-600 transition">
                      {radio.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <User size={12} />
                      {radio.user.name}
                    </div>
                    {radio.description && (
                      <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {radio.description}
                      </div>
                    )}
                  </div>
                  <span className="bg-emerald-100 text-emerald-600 text-xs font-medium px-2 py-1 rounded-full animate-pulse">
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Headphones size={12} />
                    {radio.listenerCount} auditeurs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(radio.startedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PAST RADIOS */}
      {pastRadios.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Headphones size={18} />
            Archives
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastRadios.map((radio) => (
              <div
                key={radio.id}
                className="bg-gray-50 rounded-2xl p-5 border opacity-70"
              >
                <div className="font-semibold text-gray-600">{radio.title}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {radio.user.name} — Terminé
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
