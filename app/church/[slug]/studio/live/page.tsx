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
      // Résoudre le contexte via BroadcastContextService
      const contextRes = await fetch("/api/studio/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug,
          userId: session?.user?.id,
          userRole: (session?.user as any)?.role,
          userName: session?.user?.name,
        }),
      });

      if (contextRes.ok) {
        const context = await contextRes.json();
        setBroadcastData(context);

        // Générer le token LiveKit
        const tokenRes = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: context.livekitConfig.roomName,
            participantName: context.ownerName,
            isPublisher: context.permissions.canPublish,
          }),
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          setLivekitToken(tokenData.token);
          setLivekitUrl(tokenData.url);
          setRoomName(context.livekitConfig.roomName);
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

  // Vérifier les permissions via le BroadcastContext
  if (!broadcastData?.permissions?.canPublish) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-white text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-gray-400">Vous n'avez pas les permissions nécessaires pour accéder au studio live.</p>
        </div>
      </div>
    );
  }

  return (
    <StudioPro
      broadcastId={broadcastData?.broadcastId}
      ownerId={broadcastData?.ownerId}
      ownerType={broadcastData?.ownerType}
      ownerName={broadcastData?.ownerName}
      broadcastName={broadcastData?.broadcastName}
      livekitToken={livekitToken}
      livekitUrl={livekitUrl}
      roomName={roomName}
      userId={session?.user?.id || undefined}
      userName={session?.user?.name || undefined}
    />
  );
}
