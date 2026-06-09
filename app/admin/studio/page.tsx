"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudioHeader from "@/components/radio/studio/StudioHeader";
import StudioSidebar from "@/components/radio/studio/StudioSidebar";
import StudioMain from "@/components/radio/studio/StudioMain";
import StudioRightPanel from "@/components/radio/studio/StudioRightPanel";
import StudioSchedulePanel from "@/components/radio/studio/StudioSchedulePanel";

export default function StudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [radio, setRadio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("live");
  const [isLive, setIsLive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !["ADMIN", "SUPER_ADMIN", "RADIO_HOST"].includes(session.user?.role || "")) {
      router.push("/");
      return;
    }
    fetchRadio();
  }, [session, status, router]);

  useEffect(() => {
    if (isLive && !timerRef.current) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (!isLive && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLive]);

  async function fetchRadio() {
    try {
      const res = await fetch("/api/radio");
      const data = await res.json();
      if (data.radios?.length > 0) {
        setRadio(data.radios[0]);
        setIsLive(data.radios[0].isLive || false);
      } else {
        const createRes = await fetch("/api/radio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "ChurchFace Radio", description: "Radio en direct de l'église" }),
        });
        const created = await createRes.json();
        setRadio(created.radio);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

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
        ) : (
          <StudioMain radio={radio} isLive={isLive} setIsLive={setIsLive} elapsed={elapsed} />
        )}
        <StudioRightPanel radioId={radio?.id} radio={radio} />
      </div>
    </div>
  );
}
