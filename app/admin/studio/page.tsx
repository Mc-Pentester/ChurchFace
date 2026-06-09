"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudioHeader from "@/components/radio/studio/StudioHeader";
import StudioSidebar from "@/components/radio/studio/StudioSidebar";
import StudioMain from "@/components/radio/studio/StudioMain";
import StudioRightPanel from "@/components/radio/studio/StudioRightPanel";
import StudioSchedulePanel from "@/components/radio/studio/StudioSchedulePanel";
import StudioPlaylistsPanel from "@/components/radio/studio/StudioPlaylistsPanel";

export default function StudioPage() {
  const { status } = useSession();
  const router = useRouter();
  const [radio, setRadio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("live");
  const [isLive, setIsLive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshRadio = useCallback(async () => {
    if (!radio?.id) return;
    try {
      const res = await fetch(`/api/radio/${radio.id}`, { cache: "no-store" });
      const data = await res.json();
      if (data.radio) {
        setRadio(data.radio);
        setIsLive(Boolean(data.radio.isLive));
      }
    } catch (e) {
      console.error(e);
    }
  }, [radio?.id]);

  useEffect(() => {
    if (status === "loading") return;

    async function init() {
      try {
        const accessRes = await fetch("/api/studio/me", { cache: "no-store" });
        if (!accessRes.ok) {
          router.replace("/");
          return;
        }

        const res = await fetch("/api/studio/radio", { cache: "no-store" });
        const data = await res.json();
        if (data.radio) {
          setRadio(data.radio);
          setIsLive(Boolean(data.radio.isLive));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [status, router]);

  useEffect(() => {
    if (!radio?.id) return;
    const iv = setInterval(refreshRadio, 8000);
    return () => clearInterval(iv);
  }, [radio?.id, refreshRadio]);

  useEffect(() => {
    if (isLive && radio?.startedAt) {
      const start = new Date(radio.startedAt).getTime();
      const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive, radio?.startedAt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      <StudioHeader radio={radio} isLive={isLive} elapsed={elapsed} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <StudioSidebar activeView={activeView} setActiveView={setActiveView} />
        {activeView === "schedule" ? (
          <div className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-bold mb-4">Programmation</h2>
              <StudioSchedulePanel radioId={radio?.id} />
            </div>
          </div>
        ) : activeView === "playlists" ? (
          <div className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto p-4">
            <StudioPlaylistsPanel radio={radio} onRadioUpdate={setRadio} />
          </div>
        ) : (
          <StudioMain
            radio={radio}
            isLive={isLive}
            setIsLive={setIsLive}
            onRadioUpdate={setRadio}
          />
        )}
        <StudioRightPanel radioId={radio?.id} radio={radio} onStatsUpdate={setRadio} />
      </div>
    </div>
  );
}
