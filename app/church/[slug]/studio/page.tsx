"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudioHeader from "@/components/radio/studio/StudioHeader";
import StudioSidebar from "@/components/radio/studio/StudioSidebar";
import ChurchStudioMain from "@/components/radio/studio/ChurchStudioMain";
import StudioRightPanel from "@/components/radio/studio/StudioRightPanel";
import StudioSchedulePanel from "@/components/radio/studio/StudioSchedulePanel";
import StudioPlaylistsPanel from "@/components/radio/studio/StudioPlaylistsPanel";

export default function ChurchStudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const { status } = useSession();
  const router = useRouter();
  const [churchRadio, setChurchRadio] = useState<any>(null);
  const [radio, setRadio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("live");
  const [isLive, setIsLive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then(({ slug: resolvedSlug }) => setSlug(resolvedSlug));
  }, [params]);

  const refreshRadio = useCallback(async () => {
    if (!churchRadio?.id || !slug) return;
    try {
      const res = await fetch(`/api/church/${slug}/studio/radio`, { cache: "no-store" });
      const data = await res.json();
      if (data.radio) {
        setRadio(data.radio);
        setIsLive(Boolean(data.radio.isLive));
      }
    } catch (e) {
      console.error(e);
    }
  }, [churchRadio?.id, slug]);

  useEffect(() => {
    if (status === "loading" || !slug) return;

    async function init() {
      try {
        const res = await fetch(`/api/church/${slug}/studio/radio`, { cache: "no-store" });
        if (!res.ok) {
          router.replace(`/church/${slug}`);
          return;
        }

        const data = await res.json();
        if (data.churchRadio) {
          setChurchRadio(data.churchRadio);
        }
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
  }, [status, router, slug]);

  useEffect(() => {
    if (!churchRadio?.id) return;
    const iv = setInterval(refreshRadio, 8000);
    return () => clearInterval(iv);
  }, [churchRadio?.id, refreshRadio]);

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

  const handleRadioUpdate = useCallback((updatedRadio: any) => {
    setRadio(updatedRadio);
    setIsLive(Boolean(updatedRadio?.isLive));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Utiliser radio si disponible, sinon churchRadio
  const activeRadio = radio || churchRadio;

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      <StudioHeader radio={activeRadio} isLive={isLive} elapsed={elapsed} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <StudioSidebar activeView={activeView} setActiveView={setActiveView} />
        {activeView === "schedule" ? (
          <div className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-bold mb-4">Programmation</h2>
              <StudioSchedulePanel radioId={activeRadio?.id} />
            </div>
          </div>
        ) : activeView === "playlists" ? (
          <div className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto p-4">
            <StudioPlaylistsPanel radio={activeRadio} onRadioUpdate={handleRadioUpdate} />
          </div>
        ) : (
          <ChurchStudioMain
            radio={activeRadio}
            isLive={isLive}
            setIsLive={setIsLive}
            onRadioUpdate={handleRadioUpdate}
            churchSlug={slug}
          />
        )}
        <StudioRightPanel radioId={activeRadio?.id} radio={activeRadio} onStatsUpdate={handleRadioUpdate} />
      </div>
    </div>
  );
}
