"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudioPro from "@/components/live/studio/StudioPro";
import { BroadcastContextService } from "@/lib/broadcast/BroadcastContextService";

export default function StudioBroadcastPage({ params }: { params: Promise<{ broadcastId: string }> }) {
  const [broadcastId, setBroadcastId] = useState<string>("");
  const [broadcastData, setBroadcastData] = useState<any>(null);
  const [livekitToken, setLivekitToken] = useState<string>("");
  const [livekitUrl, setLivekitUrl] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    params.then(({ broadcastId: resolvedId }) => {
      setBroadcastId(resolvedId);
      loadStudioData(resolvedId);
    });
  }, [params]);

  const loadStudioData = async (id: string) => {
    try {
      // Résoudre le contexte via BroadcastContextService
      const contextRes = await fetch("/api/studio/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broadcastId: id,
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
      } else {
        router.push("/studio");
      }
    } catch (error) {
      console.error("Error loading studio data:", error);
      router.push("/studio");
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

  return (
    <StudioPro
      broadcastId={broadcastId}
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
