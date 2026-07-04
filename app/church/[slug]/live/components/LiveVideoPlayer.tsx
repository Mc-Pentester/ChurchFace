"use client";

import { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import LiveKitPlayer from "@/components/livekit/LiveKitPlayer";

interface LiveVideoPlayerProps {
  churchLive: any;
  isLive: boolean;
}

export default function LiveVideoPlayer({ churchLive, isLive }: LiveVideoPlayerProps) {
  const [livekitToken, setLivekitToken] = useState<string | null>(null);

  useEffect(() => {
    async function generateToken() {
      if (churchLive?.streamMode === "WEBRTC" && churchLive?.id) {
        try {
          const response = await fetch("/api/livekit/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomName: `church-${churchLive.id}`,
              participantName: `viewer-${churchLive.id}`,
              isPublisher: false,
            }),
          });

          const data = await response.json();
          if (data.token) {
            setLivekitToken(data.token);
          }
        } catch (error) {
          console.error("Error generating LiveKit token:", error);
        }
      }
    }

    generateToken();
  }, [churchLive?.streamMode, churchLive?.id]);

  return (
    <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center relative">
      {churchLive?.streamMode === "WEBRTC" && livekitToken ? (
        <LiveKitPlayer
          token={livekitToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ""}
          roomName={`church-${churchLive?.id}`}
        />
      ) : churchLive?.streamMode === "WEBRTC" && !livekitToken ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-white text-sm">Chargement du lecteur WebRTC...</p>
        </div>
      ) : churchLive?.playUrl ? (
        <iframe
          src={churchLive.playUrl}
          className="w-full h-full rounded-lg"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      ) : (
        <div className="text-center">
          <button className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition mx-auto mb-4">
            {isLive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <p className="text-sm opacity-80">
            {isLive ? "Diffusion en cours" : churchLive?.status === "OFFLINE" ? "Diffusion terminée" : "En attente de diffusion"}
          </p>
        </div>
      )}
    </div>
  );
}
