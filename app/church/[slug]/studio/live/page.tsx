"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudioHeader from "@/components/radio/studio/StudioHeader";
import LiveSidebar from "@/components/live/studio/LiveSidebar";
import ChurchStudioLive from "@/components/radio/studio/ChurchStudioLive";
import StudioRightPanel from "@/components/radio/studio/StudioRightPanel";
import StudioSchedulePanel from "@/components/radio/studio/StudioSchedulePanel";
import StudioPlaylistsPanel from "@/components/radio/studio/StudioPlaylistsPanel";

export default function ChurchStudioLivePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const { status } = useSession();
  const router = useRouter();
  const [churchLive, setChurchLive] = useState<any>(null);
  const [liveBroadcast, setLiveBroadcast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("live");
  const [isLive, setIsLive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then(({ slug: resolvedSlug }) => setSlug(resolvedSlug));
  }, [params]);

  const refreshLive = useCallback(async () => {
    if (!churchLive?.id || !slug) return;
    try {
      const res = await fetch(`/api/church/${slug}/studio/live`, { cache: "no-store" });
      const data = await res.json();
      if (data.liveBroadcast) {
        setLiveBroadcast(data.liveBroadcast);
        setIsLive(data.liveBroadcast.status === "LIVE");
      }
    } catch (e) {
      console.error(e);
    }
  }, [churchLive?.id, slug]);

  useEffect(() => {
    if (status === "loading" || !slug) return;

    async function init() {
      try {
        const res = await fetch(`/api/church/${slug}/studio/live`, { cache: "no-store" });
        if (!res.ok) {
          router.replace(`/church/${slug}`);
          return;
        }

        const data = await res.json();
        if (data.churchLive) {
          setChurchLive(data.churchLive);
        }
        if (data.liveBroadcast) {
          setLiveBroadcast(data.liveBroadcast);
          setIsLive(data.liveBroadcast.status === "LIVE");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [status, router, slug]);

  useEffect(() => {
    if (!churchLive?.id) return;
    const iv = setInterval(refreshLive, 8000);
    return () => clearInterval(iv);
  }, [churchLive?.id, refreshLive]);

  useEffect(() => {
    if (isLive && liveBroadcast?.startedAt) {
      const start = new Date(liveBroadcast.startedAt).getTime();
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
  }, [isLive, liveBroadcast?.startedAt]);

  const handleLiveUpdate = useCallback((updatedLive: any) => {
    setChurchLive(updatedLive);
    setIsLive(updatedLive?.status === "LIVE");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Utiliser churchLive comme source principale
  const activeLive = churchLive;

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      <StudioHeader radio={activeLive} isLive={isLive} elapsed={elapsed} studioType="live" churchSlug={slug} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LiveSidebar activeView={activeView} setActiveView={setActiveView} />
        {activeView === "schedule" ? (
          <div className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-bold mb-4">Programmation</h2>
              <StudioSchedulePanel radioId={activeLive?.id} />
            </div>
          </div>
        ) : activeView === "playlists" ? (
          <div className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto p-4">
            <StudioPlaylistsPanel radio={activeLive} onRadioUpdate={handleLiveUpdate} />
          </div>
        ) : (
          <ChurchStudioLive
            live={churchLive}
            isLive={isLive}
            setIsLive={setIsLive}
            onLiveUpdate={handleLiveUpdate}
            churchSlug={slug}
          />
        )}
        <StudioRightPanel radioId={activeLive?.id} radio={activeLive} onStatsUpdate={handleLiveUpdate} />
      </div>
    </div>
  );
}
