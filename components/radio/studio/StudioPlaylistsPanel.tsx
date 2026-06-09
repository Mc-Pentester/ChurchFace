"use client";

import { useEffect, useState } from "react";
import { Plus, Music, Check } from "lucide-react";

export default function StudioPlaylistsPanel({
  radio,
  onRadioUpdate,
}: {
  radio: any;
  onRadioUpdate?: (radio: any) => void;
}) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/playlists");
      const data = await res.json();
      setPlaylists(data.playlists || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createPlaylist(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/studio/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (data.playlist) {
        setPlaylists((prev) => [data.playlist, ...prev]);
        setTitle("");
      }
    } finally {
      setCreating(false);
    }
  }

  async function assignToRadio(playlistId: string) {
    if (!radio?.id) return;
    try {
      const res = await fetch("/api/studio/radio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: radio.id, playlistId }),
      });
      const data = await res.json();
      if (data.radio) onRadioUpdate?.(data.radio);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-lg font-bold">Playlists</h2>

      <form onSubmit={createPlaylist} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nouvelle playlist..."
          className="flex-1 bg-[#16161f] border border-[#252535] rounded-lg px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-1 px-4 py-2 bg-violet-600 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <Plus size={14} /> Créer
        </button>
      </form>

      <div className="space-y-2">
        {playlists.map((pl) => {
          const isActive = radio?.playlistId === pl.id;
          return (
            <div
              key={pl.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                isActive ? "border-violet-500/50 bg-violet-500/10" : "border-[#252535] bg-[#16161f]"
              }`}
            >
              <Music size={16} className="text-violet-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{pl.title}</div>
                <div className="text-[10px] text-gray-500">
                  {pl.items?.length || 0} piste(s)
                </div>
              </div>
              {isActive ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <Check size={12} /> Active
                </span>
              ) : (
                <button
                  onClick={() => assignToRadio(pl.id)}
                  className="text-[10px] px-2 py-1 rounded bg-[#252535] hover:bg-violet-600/30 transition"
                >
                  Assigner
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
