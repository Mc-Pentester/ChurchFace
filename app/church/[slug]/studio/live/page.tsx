"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StudioPro from "@/components/live/studio/StudioPro";

export default function ChurchStudioLivePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [broadcastData, setBroadcastData] = useState<any>(null);
  const [livekitToken, setLivekitToken] = useState<string>("");
  const [livekitUrl, setLivekitUrl] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    params.then(({ slug: resolvedSlug }) => {
      setSlug(resolvedSlug);
      loadStudioData(resolvedSlug);
    });
  }, [params]);

  const loadStudioData = async (churchSlug: string) => {
    try {
      const res = await fetch(`/api/church/${churchSlug}/studio/live`);
      if (res.ok) {
        const data = await res.json();
        setBroadcastData(data);
        
        // Generate LiveKit token
        const tokenRes = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: `church_${churchSlug}_live`,
            participantName: session?.user?.name || "host",
            isPublisher: true,
          }),
        });
        
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          setLivekitToken(tokenData.token);
          setLivekitUrl(tokenData.url);
          setRoomName(`church_${churchSlug}_live`);
        } else {
          const errorData = await tokenRes.json();
          console.error("Failed to generate LiveKit token:", errorData);
        }
      }
    } catch (error) {
      console.error("Error loading studio data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check if user is admin
  const userRole = session?.user?.role;
  if (userRole !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-white text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-gray-400">Vous devez être administrateur pour accéder au studio live.</p>
        </div>
      </div>
    );
  }

  return (
    <StudioPro
      broadcastId={broadcastData?.churchLive?.id}
      churchId={broadcastData?.church?.id}
      churchSlug={slug}
      churchName={broadcastData?.church?.name}
      broadcastName={broadcastData?.churchLive?.title}
      livekitToken={livekitToken}
      livekitUrl={livekitUrl}
      roomName={roomName}
      userId={session?.user?.id || undefined}
      userName={session?.user?.name || undefined}
    />
  );
}
