"use client";

import { useState, useEffect } from "react";

interface StudioMediaPanelProps {
  radioId?: string;
}

export default function StudioMediaPanel({ radioId }: StudioMediaPanelProps) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
    fetchPlaylists();
  }, []);

  async function fetchTracks() {
    try {
      const res = await fetch("/api/admin/playlists");
      const data = await res.json();
      setPlaylists(data.playlists || []);
    } catch (e) { console.error(e); }
  }

  async function fetchPlaylists() {
    try {
      const res = await fetch("/api/admin/playlists");
      const data = await res.json();
      setPlaylists(data.playlists || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const categories = [
    { key: "MUSIC", label: "🎶 Musique", color: "text-emerald-400" },
    { key: "PREACHING", label: "📖 Prédication", color: "text-blue-400" },
    { key: "JINGLE", label: "🔔 Jingle", color: "text-yellow-400" },
    { key: "PODCAST", label: "🎙️ Podcast", color: "text-purple-400" },
    { key: "MESSAGE", label: "📢 Message", color: "text-pink-400" },
  ];

  return (
    <div className="space-y-3">
      {/* CATEGORY TABS */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 transition"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* PLAYLISTS */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Playlists</h4>
        {playlists.length === 0 ? (
          <div className="text-center text-gray-500 text-xs py-4">
            Aucune playlist. Créez-en une depuis l'admin.
          </div>
        ) : (
          <div className="space-y-1">
            {playlists.map((pl: any) => (
              <button
                key={pl.id}
                onClick={() => setActivePlaylist(pl.id === activePlaylist?.id ? null : pl)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${activePlaylist?.id === pl.id ? "bg-emerald-600/20 border border-emerald-600/40 text-emerald-300" : "bg-gray-800/40 text-gray-300 hover:bg-gray-800"}`}
              >
                <span className="truncate">{pl.title}</span>
                <span className="text-xs text-gray-500">{pl.items?.length || 0} tracks</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE PLAYLIST ITEMS */}
      {activePlaylist && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {activePlaylist.title}
            </h4>
            <div className="flex gap-1">
              <button className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">▶</button>
              <button className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">🔀</button>
              <button className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">🔁</button>
            </div>
          </div>
          <div className="space-y-1 max-h-40 overflow-auto">
            {(activePlaylist.items || []).map((item: any, i: number) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded bg-gray-800/30 text-xs text-gray-300 hover:bg-gray-800/60 transition"
              >
                <span className="text-gray-500 w-4 text-center">{i + 1}</span>
                <span className="flex-1 truncate">{item.title}</span>
                <span className="text-gray-500">{formatDuration(item.duration)}</span>
                <button className="text-gray-500 hover:text-emerald-400">▶</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds?: number) {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
