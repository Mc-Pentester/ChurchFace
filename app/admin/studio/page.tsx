"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudioLivePanel from "@/components/radio/studio/StudioLivePanel";
import StudioMediaPanel from "@/components/radio/studio/StudioMediaPanel";
import StudioChatPanel from "@/components/radio/studio/StudioChatPanel";
import StudioStatsPanel from "@/components/radio/studio/StudioStatsPanel";
import StudioMixerPanel from "@/components/radio/studio/StudioMixerPanel";
import StudioSchedulePanel from "@/components/radio/studio/StudioSchedulePanel";

export default function StudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [radio, setRadio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"media" | "live" | "chat" | "stats" | "mixer" | "schedule">("live");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !["ADMIN", "SUPER_ADMIN", "RADIO_HOST"].includes(session.user?.role || "")) {
      router.push("/");
      return;
    }
    fetchRadio();
  }, [session, status, router]);

  async function fetchRadio() {
    try {
      const res = await fetch("/api/radio");
      const data = await res.json();
      if (data.radios && data.radios.length > 0) {
        setRadio(data.radios[0]);
      } else {
        const createRes = await fetch("/api/radio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "ChurchFace Radio", description: "Radio en direct de l'église" }) });
        const created = await createRes.json();
        setRadio(created.radio);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HEADER */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-xl">🎙️</div>
          <div>
            <h1 className="text-lg font-bold">Studio Radio</h1>
            <p className="text-xs text-gray-400">ChurchFace Broadcast</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${radio?.isLive ? "bg-red-600/20 text-red-400 border border-red-600/40" : "bg-gray-700 text-gray-400"}`}>
            {radio?.isLive ? "🔴 ON AIR" : "⚫ OFF AIR"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-400">
            👥 {radio?.listenerCount || 0}
          </span>
        </div>
      </header>

      {/* TABS (mobile) */}
      <div className="lg:hidden flex overflow-x-auto border-b border-gray-800 bg-gray-900">
        {[
          { key: "live", label: "🎙️ Live", icon: "🎙️" },
          { key: "media", label: "🎵 Media", icon: "🎵" },
          { key: "chat", label: "💬 Chat", icon: "💬" },
          { key: "stats", label: "📊 Stats", icon: "📊" },
          { key: "mixer", label: "🎚 Mixer", icon: "🎚️" },
          { key: "schedule", label: "📅 Plan", icon: "📅" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab.key ? "border-emerald-500 text-emerald-400" : "border-transparent text-gray-400"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DESKTOP GRID 4 ZONES */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:grid-rows-2 gap-4 p-4 h-[calc(100vh-73px)]">
        {/* ZONE 1: MEDIA */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 text-sm font-semibold text-gray-300">
            🎵 Media & Playlist
          </div>
          <div className="flex-1 overflow-auto p-3">
            <StudioMediaPanel radioId={radio?.id} />
          </div>
        </div>

        {/* ZONE 2: LIVE */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 text-sm font-semibold text-gray-300">
            🎙️ Live Broadcast
          </div>
          <div className="flex-1 overflow-auto p-3">
            <StudioLivePanel radio={radio} onUpdate={setRadio} />
          </div>
        </div>

        {/* ZONE 3: CHAT */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 text-sm font-semibold text-gray-300">
            💬 Chat Auditeurs
          </div>
          <div className="flex-1 overflow-hidden p-3">
            <StudioChatPanel radioId={radio?.id} />
          </div>
        </div>

        {/* ZONE 4: STATS */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 text-sm font-semibold text-gray-300">
            📊 Statistiques
          </div>
          <div className="flex-1 overflow-auto p-3">
            <StudioStatsPanel radio={radio} />
          </div>
        </div>

        {/* ZONE 5: MIXER */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 text-sm font-semibold text-gray-300">
            🎚 Console de Mixage
          </div>
          <div className="flex-1 overflow-auto p-3">
            <StudioMixerPanel />
          </div>
        </div>

        {/* ZONE 6: SCHEDULE */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden flex flex-col col-span-3">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2 text-sm font-semibold text-gray-300">
            📅 Programmation
          </div>
          <div className="flex-1 overflow-auto p-3">
            <StudioSchedulePanel radioId={radio?.id} />
          </div>
        </div>
      </div>

      {/* MOBILE SINGLE PANEL */}
      <div className="lg:hidden p-4 h-[calc(100vh-130px)] overflow-auto">
        {activeTab === "live" && <StudioLivePanel radio={radio} onUpdate={setRadio} />}
        {activeTab === "media" && <StudioMediaPanel radioId={radio?.id} />}
        {activeTab === "chat" && <StudioChatPanel radioId={radio?.id} />}
        {activeTab === "stats" && <StudioStatsPanel radio={radio} />}
        {activeTab === "mixer" && <StudioMixerPanel />}
        {activeTab === "schedule" && <StudioSchedulePanel radioId={radio?.id} />}
      </div>
    </div>
  );
}
