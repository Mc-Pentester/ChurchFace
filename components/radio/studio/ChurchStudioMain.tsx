"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRadioBroadcast } from "@/hooks/useRadioBroadcast";
import { UploadButton } from "@/lib/uploadthing";
import {
  Play, Pause, Square, Plus, Search, Mic, Music, Bell, Volume2, MonitorUp, Signal, Radio, StopCircle, Link2, Upload
} from "lucide-react";

/* ─── Helpers ─── */
function probeDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => resolve(Math.floor(audio.duration) || 0);
    audio.onerror = () => resolve(0);
    audio.src = url;
  });
}

function fmtDuration(seconds?: number) {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ─── VU Meter ─── */
function VUMeter({ peak, active }: { peak: number; active: boolean }) {
  const levels = Array.from({ length: 14 });
  const fill = active ? Math.round((peak / 100) * 14) : 0;
  return (
    <div className="flex flex-col-reverse gap-[1.5px] w-[6px]">
      {levels.map((_, i) => {
        const on = i < fill;
        let cls = "bg-gray-800";
        if (on) {
          if (i < 8) cls = "bg-emerald-500";
          else if (i < 11) cls = "bg-yellow-500";
          else cls = "bg-red-500";
        }
        return <div key={i} className={`w-full h-[2px] rounded-full ${cls}`} />;
      })}
    </div>
  );
}

/* ─── Channel Strip ─── */
interface ChannelData { id: string; name: string; volume: number; muted: boolean; solo: boolean; peak: number; color: string; icon: any; }
function ChannelStrip({ ch, onUpdate }: { ch: ChannelData; onUpdate: (u: Partial<ChannelData>) => void }) {
  const Icon = ch.icon;
  return (
    <div className="flex flex-col items-center gap-2 bg-[#16161f] rounded-lg p-2 min-w-[90px]">
      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
        <Icon size={10} className={ch.color} />
        <span className="truncate max-w-[70px]">{ch.name}</span>
      </div>
      <div className="flex gap-1 h-28">
        <VUMeter peak={ch.peak} active={!ch.muted} />
        <VUMeter peak={ch.peak} active={!ch.muted} />
      </div>
      <div className="relative h-24 w-5 flex items-center justify-center">
        <input
          type="range"
          min="0" max="100" value={ch.volume}
          onChange={(e) => onUpdate({ volume: parseInt(e.target.value) })}
          className="absolute w-24 -rotate-90 origin-center accent-gray-400 opacity-60 hover:opacity-100 transition"
          style={{ appearance: "slider-vertical" as any }}
        />
      </div>
      <div className="text-[9px] font-mono text-gray-500">{ch.volume > 0 ? `-${(36 - ch.volume / 2.7).toFixed(1)}` : "-∞ dB"}</div>
      <div className="flex gap-1 w-full">
        <button
          onClick={() => onUpdate({ muted: !ch.muted })}
          className={`flex-1 py-0.5 rounded text-[9px] font-bold transition ${ch.muted ? "bg-red-600/80 text-white" : "bg-[#252535] text-gray-500 hover:text-gray-300"}`}
        >MUTE</button>
        <button
          onClick={() => onUpdate({ solo: !ch.solo })}
          className={`flex-1 py-0.5 rounded text-[9px] font-bold transition ${ch.solo ? "bg-yellow-500/80 text-black" : "bg-[#252535] text-gray-500 hover:text-gray-300"}`}
        >SOLO</button>
      </div>
    </div>
  );
}

/* ─── Web Audio Helpers ─── */
function playTone(freq: number, duration: number, type: OscillatorType = "sine") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), duration * 1000 + 100);
  } catch (e) { console.error("Audio error:", e); }
}

function playJingle() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.3, "triangle"), i * 150));
}

/* ─── Main Component ─── */
interface ChurchStudioMainProps {
  radio: any;
  isLive: boolean;
  setIsLive: (v: boolean) => void;
  onRadioUpdate?: (radio: any) => void;
  churchSlug: string;
}

export default function ChurchStudioMain({
  radio,
  isLive,
  setIsLive,
  onRadioUpdate,
  churchSlug,
}: ChurchStudioMainProps) {
  /* ── Audio / Playback State ── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackElapsed, setTrackElapsed] = useState(0);
  const [autoDj, setAutoDj] = useState(Boolean(radio?.isAutoDJ));
  const [isRecording, setIsRecording] = useState(false);
  const [recElapsed, setRecElapsed] = useState(0);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<any>(null);
  const [plLoading, setPlLoading] = useState(true);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);

  /* ── Mixer State ── */
  const [channels, setChannels] = useState<ChannelData[]>([
    { id: "mic1", name: "MIC PRINCIPAL", volume: 75, muted: false, solo: false, peak: 0, color: "text-emerald-400", icon: Mic },
    { id: "mic2", name: "MIC INVITÉ 1", volume: 60, muted: false, solo: false, peak: 0, color: "text-blue-400", icon: Mic },
    { id: "mic3", name: "MIC INVITÉ 2", volume: 0, muted: true, solo: false, peak: 0, color: "text-orange-400", icon: Mic },
    { id: "music", name: "MUSIQUE", volume: 70, muted: false, solo: false, peak: 0, color: "text-violet-400", icon: Music },
    { id: "jingle", name: "JINGLE", volume: 50, muted: false, solo: false, peak: 0, color: "text-yellow-400", icon: Bell },
    { id: "aux", name: "AUX", volume: 30, muted: false, solo: false, peak: 0, color: "text-gray-400", icon: Volume2 },
  ]);

  /* ── Library State ── */
  const [libTab, setLibTab] = useState("music");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addingTrack, setAddingTrack] = useState(false);
  const [playlistMsg, setPlaylistMsg] = useState<string | null>(null);

  const refreshTracks = useCallback(async () => {
    try {
      const res = await fetch(`/api/church/${churchSlug}/studio/tracks`);
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (e) {
      console.error(e);
    }
  }, [churchSlug]);

  useEffect(() => {
    if (radio) setAutoDj(Boolean(radio.isAutoDJ));
  }, [radio?.isAutoDJ]);

  /* ── Fetch playlists + bibliothèque ── */
  useEffect(() => {
    async function fetchData() {
      try {
        const [plRes, trRes] = await Promise.all([
          fetch(`/api/church/${churchSlug}/studio/playlists`),
          fetch(`/api/church/${churchSlug}/studio/tracks`),
        ]);
        const plData = await plRes.json();
        const trData = await trRes.json();
        const pls = plData.playlists || [];
        setPlaylists(pls);
        setTracks(trData.tracks || []);

        const assigned = radio?.playlistId
          ? pls.find((p: any) => p.id === radio.playlistId)
          : radio?.playlist;
        if (assigned) {
          setActivePlaylist(assigned);
        } else if (radio?.playlist) {
          setActivePlaylist(radio.playlist);
        } else if (pls.length > 0) {
          setActivePlaylist(pls[0]);
        }
      } catch (e) {
        console.error("Studio data fetch error:", e);
      } finally {
        setPlLoading(false);
      }
    }
    fetchData();
  }, [radio?.id, radio?.playlistId, churchSlug]);

  const activePlaylistItems = activePlaylist?.items || [];

  const micChannel = channels.find((c) => c.id === "mic1");
  const musicChannel = channels.find((c) => c.id === "music");
  const { status: broadcastStatus, peerCount, error: broadcastError } = useRadioBroadcast({
    radioId: radio?.id,
    isLive,
    audioRef,
    micVolume: micChannel?.volume ?? 75,
    micMuted: micChannel?.muted ?? false,
    musicVolume: musicChannel?.volume ?? 70,
    musicMuted: musicChannel?.muted ?? false,
  });

  /* ── Lecture audio réelle ── */
  useEffect(() => {
    const audio = audioRef.current;
    const items = activePlaylist?.items || [];
    const track = items[currentTrackIndex];
    if (!audio || !track?.url) return;

    audio.src = track.url;
    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentTrackIndex, activePlaylist?.id, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(console.error);
    else audio.pause();
  }, [isPlaying]);

  /* ── Animate VU meters ── */
  useEffect(() => {
    const iv = setInterval(() => {
      setChannels((prev) => prev.map((ch) => ({
        ...ch,
        peak: ch.muted ? 0 : Math.max(0, Math.min(100, ch.volume + (Math.random() * 30 - 15))),
      })));
    }, 180);
    return () => clearInterval(iv);
  }, []);

  const currentTrack = activePlaylistItems[currentTrackIndex] || null;
  const currentDuration = currentTrack?.duration || 0;

  const categoryMap: Record<string, string> = {
    GENERAL: "music",
    MUSIC: "music",
    PREACHING: "preaching",
    JINGLE: "jingles",
    PODCAST: "podcasts",
  };

  const trackItems = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist || "Bibliothèque",
    duration: t.duration,
    url: t.url,
    category: categoryMap[t.category] || categoryMap[t.type] || "music",
  }));

  const playlistLibItems = playlists.flatMap((pl) =>
    (pl.items || []).map((it: any) => ({
      id: it.id,
      title: it.title,
      artist: pl.title,
      duration: it.duration,
      url: it.url,
      category: it.type === "VIDEO" ? "preaching" : "music",
    }))
  );

  const allItems = [...trackItems, ...playlistLibItems];
  const activeLibItems = allItems.filter((i) =>
    (libTab === "music" ? ["music", "jingles", "podcasts"] : [libTab]).includes(i.category) &&
    (search === "" || i.title.toLowerCase().includes(search.toLowerCase()))
  );

  /* ── Recording timer ── */
  useEffect(() => {
    if (isRecording) {
      recTimerRef.current = setInterval(() => setRecElapsed((e) => e + 1), 1000);
    } else {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    }
    return () => { if (recTimerRef.current) clearInterval(recTimerRef.current); };
  }, [isRecording]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.ctrlKey) return;
      if (e.key === "l" || e.key === "L") { e.preventDefault(); toggleLive(); }
      if (e.key === "k" || e.key === "K") { e.preventDefault(); if (isLive) toggleLive(); }
      if (e.key === "j" || e.key === "J") { e.preventDefault(); playJingle(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLive]);

  /* ── Helpers ── */
  function updateChannel(id: string, updates: Partial<ChannelData>) {
    setChannels((prev) => prev.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch)));
  }

  async function persistPlaylist(items: any[]): Promise<boolean> {
    if (!activePlaylist?.id) {
      setPlaylistMsg("Aucune playlist active — créez-en une dans l'onglet Playlists.");
      return false;
    }

    const payload = items.map((it: any) => ({
      title: it.title || "Sans titre",
      url: it.url,
      type: it.type === "VIDEO" ? "VIDEO" : "AUDIO",
      duration: it.duration ?? null,
    }));

    if (payload.some((it) => !it.url)) {
      setPlaylistMsg("Chaque piste doit avoir une URL valide.");
      return false;
    }

    try {
      const res = await fetch(`/api/church/${churchSlug}/studio/playlists`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activePlaylist.id, items: payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPlaylistMsg(data.error || "Erreur lors de la sauvegarde.");
        return false;
      }
      if (data.playlist) {
        setActivePlaylist(data.playlist);
        setPlaylists((prev) =>
          prev.map((p) => (p.id === data.playlist.id ? data.playlist : p))
        );
        setPlaylistMsg(null);
      }
      return true;
    } catch (e) {
      console.error("Persist playlist error:", e);
      setPlaylistMsg("Erreur réseau lors de la sauvegarde.");
      return false;
    }
  }

  async function saveToLibrary(item: {
    title: string;
    url: string;
    duration?: number;
    category?: string;
  }) {
    const res = await fetch(`/api/church/${churchSlug}/studio/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title,
        url: item.url,
        duration: item.duration ?? 0,
        category: item.category || "GENERAL",
        type: "MUSIC",
      }),
    });
    if (res.ok) await refreshTracks();
  }

  /* ── Live toggle ── */
  async function toggleLive() {
    if (!radio?.id) return;
    try {
      const next = !isLive;
      const res = await fetch(`/api/church/${churchSlug}/studio/radio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: radio.id,
          radioId: radio.id,
          isLive: next,
          isAutoDJ: autoDj,
          title: radio.title,
          description: radio.description,
          currentTrackId: currentTrack?.id || null,
          ...(next ? { startedAt: new Date().toISOString(), endedAt: null } : { endedAt: new Date().toISOString() }),
        }),
      });
      const data = await res.json();
      if (data.radio) {
        onRadioUpdate?.(data.radio);
        setIsLive(next);
      }
      if (next && !isPlaying && activePlaylistItems.length > 0) {
        setIsPlaying(true);
        setTrackElapsed(0);
      }
    } catch (e) {
      console.error("Toggle live error:", e);
    }
  }

  async function syncCurrentTrack(trackId: string | null) {
    if (!radio?.id) return;
    try {
      const res = await fetch(`/api/church/${churchSlug}/studio/radio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: radio.id, radioId: radio.id, currentTrackId: trackId }),
      });
      const data = await res.json();
      if (data.radio) onRadioUpdate?.(data.radio);
    } catch (e) {
      console.error("Sync track error:", e);
    }
  }

  async function switchPlaylist(pl: any) {
    setActivePlaylist(pl);
    setCurrentTrackIndex(0);
    setTrackElapsed(0);
    if (radio?.id) {
      try {
        const res = await fetch(`/api/church/${churchSlug}/studio/radio`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: radio.id, radioId: radio.id, playlistId: pl.id }),
        });
        const data = await res.json();
        if (data.radio) onRadioUpdate?.(data.radio);
      } catch (e) {
        console.error("Assign playlist error:", e);
      }
    }
  }

  /* ── Playlist controls ── */
  function playTrack(index: number) {
    setCurrentTrackIndex(index);
    setTrackElapsed(0);
    setIsPlaying(true);
    const track = activePlaylistItems[index];
    if (track?.id) syncCurrentTrack(track.id);
  }

  function moveTrack(index: number, dir: -1 | 1) {
    if (!activePlaylist) return;
    const items = [...activePlaylistItems];
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    [items[index], items[newIdx]] = [items[newIdx], items[index]];
    const updated = { ...activePlaylist, items };
    setActivePlaylist(updated);
    persistPlaylist(items);
  }

  function removeTrack(index: number) {
    if (!activePlaylist) return;
    const items = activePlaylistItems.filter((_: any, i: number) => i !== index);
    setActivePlaylist({ ...activePlaylist, items });
    persistPlaylist(items);
    if (index === currentTrackIndex) {
      setTrackElapsed(0);
      setIsPlaying(false);
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex((i) => Math.max(0, i - 1));
    }
  }

  async function addToPlaylist(item: {
    title: string;
    url: string;
    type?: string;
    duration?: number;
    saveToLib?: boolean;
  }) {
    if (!item.url?.trim()) {
      setPlaylistMsg("URL de la piste manquante.");
      return false;
    }
    if (!activePlaylist?.id) {
      setPlaylistMsg("Aucune playlist active.");
      return false;
    }

    const newItem = {
      title: item.title?.trim() || "Sans titre",
      url: item.url.trim(),
      type: item.type || "AUDIO",
      duration: item.duration,
    };

    try {
      const res = await fetch(`/api/church/${churchSlug}/studio/playlists/${activePlaylist.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();

      if (!res.ok) {
        setPlaylistMsg(data.error || "Impossible d'ajouter la piste.");
        return false;
      }

      if (data.playlist) {
        setActivePlaylist(data.playlist);
        setPlaylists((prev) =>
          prev.map((p) => (p.id === data.playlist.id ? data.playlist : p))
        );
      }

      if (item.saveToLib !== false) {
        await saveToLibrary(newItem);
      }

      setPlaylistMsg(`« ${newItem.title} » ajouté à la playlist.`);
      setTimeout(() => setPlaylistMsg(null), 3000);
      return true;
    } catch (e) {
      console.error("Add to playlist error:", e);
      setPlaylistMsg("Erreur réseau.");
      return false;
    }
  }

  async function handleAddByUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!addTitle.trim() || !addUrl.trim()) {
      setPlaylistMsg("Titre et URL requis.");
      return;
    }
    setAddingTrack(true);
    try {
      const duration = await probeDuration(addUrl.trim());
      const ok = await addToPlaylist({
        title: addTitle.trim(),
        url: addUrl.trim(),
        duration,
      });
      if (ok) {
        setAddTitle("");
        setAddUrl("");
        setShowAddForm(false);
      }
    } finally {
      setAddingTrack(false);
    }
  }

  async function handleAudioUpload(res: { url?: string; ufsUrl?: string; name?: string }[]) {
    const file = res?.[0];
    const url = file?.url || (file as any)?.ufsUrl;
    if (!url) {
      setPlaylistMsg("Upload échoué — URL introuvable.");
      return;
    }
    setAddingTrack(true);
    try {
      const title = file?.name?.replace(/\.[^.]+$/, "") || "Piste audio";
      const duration = await probeDuration(url);
      await addToPlaylist({ title, url, duration });
    } finally {
      setAddingTrack(false);
    }
  }

  return (
    <main className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto">
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => setTrackElapsed(Math.floor(audioRef.current?.currentTime || 0))}
        onEnded={() => {
          if (autoDj && activePlaylistItems.length > 0) {
            const next = (currentTrackIndex + 1) % activePlaylistItems.length;
            setCurrentTrackIndex(next);
            setTrackElapsed(0);
            const track = activePlaylistItems[next];
            if (track?.id) syncCurrentTrack(track.id);
          } else {
            setIsPlaying(false);
          }
        }}
        className="hidden"
      />
      <div className="p-4 space-y-4">
        {/* ── Top Row: Diffusion + Statut ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Diffusion en direct */}
          <div className="xl:col-span-2 bg-[#16161f] rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Diffusion en direct</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop" alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1 rounded">{fmtDuration(trackElapsed)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-semibold truncate">{currentTrack?.title || "En attente"}</h4>
                  {isLive && <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded">ON AIR</span>}
                </div>
                <p className="text-xs text-gray-400">{activePlaylist?.title || "Playlist"}</p>
                {/* Waveform progress */}
                <div className="flex items-end gap-[2px] h-6 mt-2">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const isPast = currentDuration > 0 && i / 60 < trackElapsed / currentDuration;
                    return (
                      <div
                        key={i}
                        className={`w-[3px] rounded-full transition-all duration-300 ${isPlaying ? (isPast ? "bg-violet-500" : "bg-violet-500/30") : "bg-gray-700"}`}
                        style={{ height: `${15 + Math.random() * 50}%` }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-gray-500">{fmtDuration(trackElapsed)}</span>
                  <span className="text-[9px] text-gray-500">{fmtDuration(currentDuration)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex gap-2">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition">
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button onClick={() => { setIsPlaying(false); setTrackElapsed(0); }} className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition">
                    <Square size={12} />
                  </button>
                </div>
                <button
                  onClick={toggleLive}
                  className={`flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded transition font-medium ${isLive ? "bg-red-600/20 text-red-400" : "bg-emerald-600/20 text-emerald-400"}`}
                >
                  <Radio size={10} /> {isLive ? "OFF AIR" : "ON AIR"}
                </button>
                <button
                  onClick={async () => {
                    const next = !autoDj;
                    setAutoDj(next);
                    if (radio?.id) {
                      const res = await fetch(`/api/church/${churchSlug}/studio/radio`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: radio.id, radioId: radio.id, isAutoDJ: next }),
                      });
                      const data = await res.json();
                      if (data.radio) onRadioUpdate?.(data.radio);
                    }
                  }}
                  className={`flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded transition ${autoDj ? "bg-violet-600/30 text-violet-300" : "text-gray-400 bg-[#1e1e2d] hover:bg-[#252535]"}`}
                >
                  <MonitorUp size={10} /> AutoDJ {autoDj ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>

          {/* Statut diffusion */}
          <div className="bg-[#16161f] rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Statut diffusion</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Statut</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isLive ? "bg-red-500/20 text-red-400" : "bg-gray-700 text-gray-400"}`}>{isLive ? "EN DIRECT" : "HORS LIGNE"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Qualité</span>
                <span className="text-[10px] font-bold text-emerald-400">EXCELLENTE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Source</span>
                <span className="text-xs text-gray-300">Live Studio</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">WebRTC</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  broadcastStatus === "live"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : broadcastStatus === "connecting"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : broadcastStatus === "error"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-700 text-gray-400"
                }`}>
                  {broadcastStatus === "live"
                    ? `ACTIF · ${peerCount} flux`
                    : broadcastStatus === "connecting"
                      ? "CONNEXION..."
                      : broadcastStatus === "error"
                        ? "ERREUR"
                        : "INACTIF"}
                </span>
              </div>
              {broadcastError && (
                <p className="text-[10px] text-red-400">{broadcastError}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Audio</span>
                <span className="text-xs text-gray-300">128 kbps <Signal size={10} className="inline text-emerald-400" /></span>
              </div>
              {isLive && radio?.id && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Page d&apos;écoute</span>
                  <a
                    href={`/radio/${radio.id}`}
                    className="text-[10px] text-violet-400 hover:text-violet-300 underline"
                  >
                    Ouvrir le lecteur flottant
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Diffusion sur</span>
                <div className="flex gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 text-[9px]">W</span>
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 text-[9px]">F</span>
                  <span className="w-5 h-5 rounded-full bg-red-600/30 flex items-center justify-center text-red-300 text-[9px]">Y</span>
                  <span className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 text-[9px]">T</span>
                  <span className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-[9px]">+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mixeur Audio ── */}
        <div className="bg-[#16161f] rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Mixeur Audio</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {channels.map((ch) => (
              <ChannelStrip key={ch.id} ch={ch} onUpdate={(u) => updateChannel(ch.id, u)} />
            ))}
          </div>
        </div>

        {/* ── Playlist + Bibliothèque ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Playlist en cours */}
          <div className="bg-[#16161f] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Playlist en cours</h3>
                <select
                  value={activePlaylist?.id || ""}
                  onChange={(e) => {
                    const pl = playlists.find((p) => p.id === e.target.value);
                    if (pl) switchPlaylist(pl);
                  }}
                  className="mt-1 w-full bg-[#1e1e2d] rounded-lg px-2 py-1 text-xs text-white"
                >
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>{pl.title}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-600 mt-0.5">{activePlaylistItems.length} titres · {fmtDuration(activePlaylistItems.reduce((a: number, b: any) => a + (b.duration || 0), 0))}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-white bg-violet-600 hover:bg-violet-500 px-2.5 py-1.5 rounded-lg transition shrink-0"
              >
                <Plus size={12} /> Ajouter
              </button>
            </div>

            {playlistMsg && (
              <p className={`text-[10px] mb-2 ${playlistMsg.includes("ajouté") ? "text-emerald-400" : "text-red-400"}`}>
                {playlistMsg}
              </p>
            )}

            {showAddForm && (
              <form onSubmit={handleAddByUrl} className="mb-3 p-2 rounded-lg bg-[#1e1e2d] space-y-2">
                <input
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder="Titre de la piste"
                  className="w-full bg-[#16161f] rounded px-2 py-1.5 text-xs text-white"
                />
                <input
                  value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                  placeholder="URL audio (mp3, wav, lien UploadThing...)"
                  className="w-full bg-[#16161f] rounded px-2 py-1.5 text-xs text-white"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={addingTrack}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded transition"
                  >
                    {addingTrack ? "Ajout..." : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition"
                  >
                    Annuler
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">Ou uploader:</span>
                  <UploadButton
                    endpoint="audioUploader"
                    onClientUploadComplete={handleAudioUpload}
                    onUploadError={(error: Error) => {
                      setPlaylistMsg(`Upload erreur: ${error.message}`);
                    }}
                  />
                </div>
              </form>
            )}

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {activePlaylistItems.map((track: any, idx: number) => (
                <div
                  key={track.id || idx}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${idx === currentTrackIndex ? "bg-violet-600/20 text-violet-300" : "bg-[#1e1e2d] text-gray-300 hover:bg-[#252535]"}`}
                >
                  <span className="w-4 text-gray-500">{idx + 1}</span>
                  <span className="flex-1 truncate">{track.title}</span>
                  <span className="text-gray-500 text-[10px]">{fmtDuration(track.duration)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => playTrack(idx)}
                      className="p-1 hover:bg-violet-600/30 rounded transition"
                      title="Lecture"
                    >
                      <Play size={10} />
                    </button>
                    <button
                      onClick={() => moveTrack(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 hover:bg-violet-600/30 rounded transition disabled:opacity-30"
                      title="Monter"
                    >
                      <Plus size={10} className="rotate-180" />
                    </button>
                    <button
                      onClick={() => moveTrack(idx, 1)}
                      disabled={idx === activePlaylistItems.length - 1}
                      className="p-1 hover:bg-violet-600/30 rounded transition disabled:opacity-30"
                      title="Descendre"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => removeTrack(idx)}
                      className="p-1 hover:bg-red-600/30 rounded transition text-red-400"
                      title="Supprimer"
                    >
                      <StopCircle size={10} />
                    </button>
                  </div>
                </div>
              ))}
              {activePlaylistItems.length === 0 && (
                <p className="text-center text-gray-500 text-xs py-4">Aucune piste dans la playlist</p>
              )}
            </div>
          </div>

          {/* Bibliothèque */}
          <div className="bg-[#16161f] rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Bibliothèque</h3>
            <div className="flex gap-2 mb-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-[#16161f] rounded px-2 py-1.5 text-xs text-white"
              />
              <select
                value={libTab}
                onChange={(e) => setLibTab(e.target.value)}
                className="bg-[#1e1e2d] rounded px-2 py-1.5 text-xs text-white"
              >
                <option value="music">Musique</option>
                <option value="preaching">Prédications</option>
                <option value="jingles">Jingles</option>
                <option value="podcasts">Podcasts</option>
              </select>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {activeLibItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs bg-[#1e1e2d] text-gray-300 hover:bg-[#252535] cursor-pointer"
                  onClick={() => addToPlaylist({ title: item.title, url: item.url, duration: item.duration, type: item.category === "preaching" ? "VIDEO" : "AUDIO" })}
                >
                  <span className="flex-1 truncate">{item.title}</span>
                  <span className="text-gray-500 text-[10px]">{item.artist}</span>
                  <span className="text-gray-500 text-[10px]">{fmtDuration(item.duration)}</span>
                  <Plus size={10} className="text-violet-400 shrink-0" />
                </div>
              ))}
              {activeLibItems.length === 0 && (
                <p className="text-center text-gray-500 text-xs py-4">Aucun élément trouvé</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
