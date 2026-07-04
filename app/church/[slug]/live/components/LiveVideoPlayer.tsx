"use client";

import { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import LiveKitPlayer from "@/components/livekit/LiveKitPlayer";

interface LiveVideoPlayerProps {
  churchLive?: any;
  live?: any;
  isLive: boolean;
}

export default function LiveVideoPlayer({ churchLive, live, isLive }: LiveVideoPlayerProps) {
  const resolved = churchLive ?? live;
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    async function generateToken() {
      if (!resolved) return;
      if (resolved?.streamMode === "WEBRTC" && resolved?.id) {
        try {
          setTokenError(null);
          const response = await fetch("/api/livekit/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomName: `church-${resolved.id}`,
              participantName: `viewer-${resolved.id}`,
              isPublisher: false,
            }),
          });

          if (!response.ok) {
            const text = await response.text();
            setTokenError(`Erreur génération token: ${text}`);
            return;
          }

          const data = await response.json();
          if (data?.token) {
            setLivekitToken(data.token);
          } else {
            setTokenError("Token introuvable dans la réponse");
          }
        } catch (error) {
          console.error("Error generating LiveKit token:", error);
          setTokenError("Erreur réseau lors de la génération du token");
        }
      }
    }

    generateToken();
  }, [resolved?.streamMode, resolved?.id]);

  if (!resolved) {
    return (
      <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
        <p className="text-white">Aucune diffusion disponible</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center relative">
      {resolved?.streamMode === "WEBRTC" && livekitToken ? (
        <LiveKitPlayer
          token={livekitToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ""}
          roomName={`church-${resolved?.id}`}
        />
      ) : resolved?.streamMode === "WEBRTC" && !livekitToken ? (
        <div className="text-center">
          {tokenError ? (
            <p className="text-red-400 text-sm">{tokenError}</p>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white text-sm">Chargement du lecteur WebRTC...</p>
            </>
          )}
        </div>
      ) : resolved?.playUrl ? (
        <iframe
          src={resolved.playUrl}
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
            {isLive ? "Diffusion en cours" : resolved?.status === "OFFLINE" ? "Diffusion terminée" : "En attente de diffusion"}
          </p>
        </div>
      )}
    </div>
  );
}
