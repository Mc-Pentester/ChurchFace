"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Pause, Square, SkipForward, SkipBack, Plus, Search, Mic, Music, Bell, Volume2, VolumeX, MonitorUp, Signal, Radio, StopCircle
} from "lucide-react";

/* ─── Helpers ─── */
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
    <div className="flex flex-col items-center gap-2 bg-[#16161f] rounded-lg p-2 border border-[#252535] min-w-[90px]">
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
function playApplause() {
  for (let i = 0; i < 15; i++) setTimeout(() => playTone(200 + Math.random() * 800, 0.2, "sawtooth"), i * 40);
}
function playLaugh() {
  [400, 350, 450, 300].forEach((f, i) => setTimeout(() => playTone(f, 0.25, "sine"), i * 120));
}
function playSiren() {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => playTone(800, 0.4, "sawtooth"), i * 800);
    setTimeout(() => playTone(600, 0.4, "sawtooth"), i * 800 + 400);
  }
}
function playBell() {
  playTone(880, 1.5, "sine");
  setTimeout(() => playTone(1100, 1.2, "sine"), 200);
}

/* ─── Main Component ─── */
export default function StudioMain({ radio, isLive, setIsLive, elapsed }: { radio: any; isLive: boolean; setIsLive: (v: boolean) => void; elapsed: number }) {
  /* ── Audio / Playback State ── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackElapsed, setTrackElapsed] = useState(0);
  const [autoDj, setAutoDj] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recElapsed, setRecElapsed] = useState(0);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<any>(null);
  const [plLoading, setPlLoading] = useState(true);
  const trackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  /* ── Fetch playlists ── */
  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch("/api/admin/playlists");
        const data = await res.json();
        const pls = data.playlists || [];
        setPlaylists(pls);
        if (pls.length > 0 && !activePlaylist) {
          setActivePlaylist(pls[0]);
        }
      } catch (e) { console.error("Playlist fetch error:", e); }
      finally { setPlLoading(false); }
    }
    fetchPlaylists();
  }, []);

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

  const activePlaylistItems = activePlaylist?.items || [];
  const currentTrack = activePlaylistItems[currentTrackIndex] || null;
  const currentDuration = currentTrack?.duration || 0;

  // Build library from all playlist items
  const allItems = playlists.flatMap((pl) =>
    (pl.items || []).map((it: any) => ({
      id: it.id,
      title: it.title,
      artist: pl.title,
      duration: it.duration,
      category: it.type?.toLowerCase() === "audio" ? "music" : it.type?.toLowerCase() === "video" ? "preaching" : "music",
    }))
  );
  const activeLibItems = allItems.filter((i) =>
    (libTab === "music" ? ["music", "jingles", "podcasts"] : [libTab]).includes(i.category) &&
    (search === "" || i.title.toLowerCase().includes(search.toLowerCase()))
  );

  /* ── Track progression timer ── */
  useEffect(() => {
    if (isPlaying) {
      trackTimerRef.current = setInterval(() => {
        setTrackElapsed((prev) => {
          const items = activePlaylist?.items || [];
          const current = items[currentTrackIndex];
          const dur = current?.duration || 300;
          if (prev + 1 >= dur) {
            if (autoDj) {
              setCurrentTrackIndex((idx) => (idx + 1) % Math.max(1, items.length));
              return 0;
            } else {
              setIsPlaying(false);
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (trackTimerRef.current) clearInterval(trackTimerRef.current);
    }
    return () => { if (trackTimerRef.current) clearInterval(trackTimerRef.current); };
  }, [isPlaying, currentTrackIndex, autoDj, activePlaylist]);

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

  /* ── Live toggle ── */
  async function toggleLive() {
    if (!radio?.id) return;
    try {
      const next = !isLive;
      await fetch(`/api/radio/${radio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: next, title: radio.title, description: radio.description }),
      });
      setIsLive(next);
      if (next && !isPlaying) { setIsPlaying(true); setTrackElapsed(0); }
    } catch (e) { console.error("Toggle live error:", e); }
  }

  /* ── Playlist controls ── */
  function playTrack(index: number) {
    setCurrentTrackIndex(index);
    setTrackElapsed(0);
    setIsPlaying(true);
  }

  function moveTrack(index: number, dir: -1 | 1) {
    if (!activePlaylist) return;
    const items = [...activePlaylistItems];
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    [items[index], items[newIdx]] = [items[newIdx], items[index]];
    setActivePlaylist({ ...activePlaylist, items });
  }

  function removeTrack(index: number) {
    if (!activePlaylist) return;
    const items = activePlaylistItems.filter((_: any, i: number) => i !== index);
    setActivePlaylist({ ...activePlaylist, items });
    if (index === currentTrackIndex) { setTrackElapsed(0); setIsPlaying(false); }
    else if (index < currentTrackIndex) setCurrentTrackIndex((i) => Math.max(0, i - 1));
  }

  function addToPlaylist(item: any) {
    if (!activePlaylist) return;
    const newItem = { ...item, id: `${item.id}_${Date.now()}` };
    setActivePlaylist({ ...activePlaylist, items: [...activePlaylistItems, newItem] });
  }

  function addToQueue(item: any) {
    addToPlaylist(item);
  }

  return (
    <main className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* ── Top Row: Diffusion + Statut ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Diffusion en direct */}
          <div className="xl:col-span-2 bg-[#16161f] rounded-xl border border-[#252535] p-4">
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
                  className={`flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded transition font-medium ${isLive ? "bg-red-600/20 text-red-400 border border-red-600/30" : "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"}`}
                >
                  <Radio size={10} /> {isLive ? "OFF AIR" : "ON AIR"}
                </button>
                <button
                  onClick={() => setAutoDj(!autoDj)}
                  className={`flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded transition ${autoDj ? "bg-violet-600/30 text-violet-300 border border-violet-600/30" : "text-gray-400 bg-[#1e1e2d] hover:bg-[#252535]"}`}
                >
                  <MonitorUp size={10} /> AutoDJ {autoDj ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>

          {/* Statut diffusion */}
          <div className="bg-[#16161f] rounded-xl border border-[#252535] p-4">
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
                <span className="text-xs text-gray-400">Audio</span>
                <span className="text-xs text-gray-300">128 kbps <Signal size={10} className="inline text-emerald-400" /></span>
              </div>
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
        <div className="bg-[#16161f] rounded-xl border border-[#252535] p-4">
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
          <div className="bg-[#16161f] rounded-xl border border-[#252535] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Playlist en cours</h3>
                <p className="text-[10px] text-gray-600 mt-0.5">{activePlaylistItems.length} titres · {fmtDuration(activePlaylistItems.reduce((a: number, b: any) => a + (b.duration || 0), 0))}</p>
              </div>
              <button className="flex items-center gap-1 text-[10px] text-white bg-violet-600 hover:bg-violet-500 px-2.5 py-1.5 rounded-lg transition">
                <Plus size={12} /> Ajouter
              </button>
            </div>
            {plLoading ? (
              <div className="text-center text-gray-600 text-xs py-4">Chargement...</div>
            ) : (
              <>
                <div className="space-y-1">
                  {activePlaylistItems.map((track: any, idx: number) =>(
                    <div key={track.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${idx === 0 ? "bg-violet-600/10 border border-violet-600/30" : "hover:bg-[#1e1e2d]"}`}>
                      <span className="text-[10px] text-gray-500 w-4 text-center">{idx + 1}</span>
                      {idx === 0 ? (
                        <div className="flex gap-[2px] h-3 items-end">
                          {[40, 60, 30, 70, 50].map((h, i) => (
                            <div key={i} className="w-[2px] bg-emerald-400 rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">♪</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`truncate ${idx === 0 ? "text-white font-medium" : "text-gray-300"}`}>{track.title}</div>
                        <div className="text-[10px] text-gray-500 truncate">{activePlaylist?.title || "-"}</div>
                      </div>
                      <span className="text-[10px] text-gray-500 shrink-0">{fmtDuration(track.duration)}</span>
                      {idx === 0 && <span className="text-[9px] bg-emerald-600/20 text-emerald-400 px-1.5 py-0.5 rounded font-medium shrink-0">EN COURS</span>}
                      <button className="text-gray-500 hover:text-white shrink-0">⋮</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => playTrack(0)} className="flex-1 text-[10px] bg-[#1e1e2d] hover:bg-[#252535] text-emerald-400 py-1.5 rounded transition flex items-center justify-center gap-1">
                    <Play size={10} /> Lire maintenant
                  </button>
                  <button className="flex-1 text-[10px] bg-[#1e1e2d] hover:bg-[#252535] text-gray-400 py-1.5 rounded transition">+ Ajouter à la suite</button>
                  <button onClick={() => moveTrack(currentTrackIndex, -1)} className="px-2 text-[10px] bg-[#1e1e2d] hover:bg-[#252535] text-gray-400 py-1.5 rounded transition">Monter</button>
                  <button onClick={() => moveTrack(currentTrackIndex, 1)} className="px-2 text-[10px] bg-[#1e1e2d] hover:bg-[#252535] text-gray-400 py-1.5 rounded transition">Descendre</button>
                  <button onClick={() => removeTrack(currentTrackIndex)} className="px-2 text-[10px] bg-[#1e1e2d] hover:bg-red-900/30 text-red-400 py-1.5 rounded transition">Retirer</button>
                </div>
              </>
            )}
          </div>

          {/* Bibliothèque */}
          <div className="bg-[#16161f] rounded-xl border border-[#252535] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bibliothèque</h3>
            </div>
            <div className="flex gap-1 mb-3">
              {["music", "preaching", "jingles", "podcasts", "shows"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLibTab(tab)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition ${libTab === tab ? "bg-violet-600/20 text-violet-300" : "text-gray-500 hover:text-gray-300"}`}
                >
                  {tab === "music" ? "Musiques" : tab === "preaching" ? "Prédications" : tab === "jingles" ? "Jingles" : tab === "podcasts" ? "Podcasts" : "Émissions"}
                </button>
              ))}
            </div>
            <div className="relative mb-3">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-[#1e1e2d] border border-[#252535] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-600/50"
              />
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {activeLibItems.length === 0 && <div className="text-center text-gray-600 text-xs py-4">Aucun résultat</div>}
              {activeLibItems.slice(0, 20).map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#1e1e2d] transition text-xs">
                  <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-gray-500">
                    <Music size={10} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-300 truncate">{item.title}</div>
                    <div className="text-[10px] text-gray-500">{item.artist}</div>
                  </div>
                  <span className="text-[10px] text-gray-500">{fmtDuration(item.duration)}</span>
                  <button onClick={() => addToPlaylist(item)} className="text-gray-500 hover:text-emerald-400 transition">+</button>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 mt-2 py-1">Voir toute la bibliothèque</button>
          </div>
        </div>

        {/* ── Bottom Row: Intervenants + Effets + Rec + Raccourcis ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Intervenants */}
          <div className="bg-[#16161f] rounded-xl border border-[#252535] p-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Intervenants en ligne</h3>
            <div className="flex items-center gap-3">
              {[
                { name: "Pasteur Daniel", role: "Animateur", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face", mic: true },
                { name: "Frère Joseph", role: "Invité", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face", mic: true },
                { name: "Sœur Grace", role: "Invitée", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face", mic: false },
              ].map((guest) => (
                <div key={guest.name} className="flex flex-col items-center gap-1 relative">
                  <div className="relative">
                    <img src={guest.img} alt={guest.name} className="w-9 h-9 rounded-full object-cover border-2 border-[#252535]" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#16161f] ${guest.mic ? "bg-emerald-500" : "bg-red-500"}`}>
                      <Mic size={6} className="text-white absolute inset-0 m-auto" />
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-300 font-medium">{guest.name}</span>
                  <span className="text-[9px] text-gray-500">{guest.role}</span>
                </div>
              ))}
              <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition">
                <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <Plus size={14} />
                </div>
                <span className="text-[10px]">Inviter</span>
              </button>
            </div>
          </div>

          {/* Effets & Outils */}
          <div className="bg-[#16161f] rounded-xl border border-[#252535] p-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Effets & Outils</h3>
            <div className="flex gap-2">
              {[
                { label: "Jingle", icon: Music, action: playJingle },
                { label: "Applaudissements", icon: Volume2, action: playApplause },
                { label: "Rires", icon: Volume2, action: playLaugh },
                { label: "Sirène", icon: Volume2, action: playSiren },
                { label: "Cloche", icon: Bell, action: playBell },
                { label: "Publicité", icon: MonitorUp, action: () => playTone(440, 0.5, "square") },
              ].map((fx) => (
                <button key={fx.label} onClick={fx.action} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#1e1e2d] hover:bg-[#252535] transition border border-transparent hover:border-[#353545]">
                  <fx.icon size={14} className="text-gray-400" />
                  <span className="text-[9px] text-gray-500">{fx.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enregistrement + Raccourcis */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#16161f] rounded-xl border border-[#252535] p-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Enregistrement</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className="flex items-center gap-1.5"
                >
                  <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-600"}`} />
                  <span className={`text-xs font-bold ${isRecording ? "text-red-400" : "text-gray-500"}`}>REC</span>
                </button>
                <span className="text-sm font-mono text-gray-300">{fmtDuration(recElapsed)}</span>
                <span className="text-[10px] text-gray-500">{isRecording ? "Enregistrement en cours" : "En pause"}</span>
                {isRecording && (
                  <button onClick={() => { setIsRecording(false); setRecElapsed(0); }} className="ml-auto text-[10px] text-red-400 hover:text-red-300">
                    <StopCircle size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="bg-[#16161f] rounded-xl border border-[#252535] p-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Raccourcis</h3>
              <div className="space-y-1 text-[10px] text-gray-400">
                <div className="flex justify-between"><span>Démarrer live</span><span className="font-mono text-gray-500 bg-[#1e1e2d] px-1 rounded">CTRL + L</span></div>
                <div className="flex justify-between"><span>Stop live</span><span className="font-mono text-gray-500 bg-[#1e1e2d] px-1 rounded">CTRL + K</span></div>
                <div className="flex justify-between"><span>Jingle</span><span className="font-mono text-gray-500 bg-[#1e1e2d] px-1 rounded">CTRL + J</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
