"use client";

import { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import LiveKitPlayer from "@/components/livekit/LiveKitPlayer";

interface LiveVideoPlayerProps {
  broadcast?: any;
  isLive: boolean;
}

export default function LiveVideoPlayer({
  broadcast,
  isLive
}: LiveVideoPlayerProps) {
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Log debug info
    setDebugInfo({
      streamMode: broadcast?.streamMode,
      hasId: !!broadcast?.id,
      hasPlayUrl: !!broadcast?.playbackUrl,
      playUrl: broadcast?.playbackUrl,
      status: broadcast?.status,
      hasLivekitRoom: !!broadcast?.livekitRoom,
    });

    async function generateToken() {
      if (!broadcast) return;
      // Use WEBRTC if streamMode is WEBRTC or undefined (default to WEBRTC)
      const shouldUseWebRTC = !broadcast?.streamMode || broadcast?.streamMode === "WEBRTC";
      
      if (shouldUseWebRTC && broadcast?.id) {
        // Use the same room name as the Studio: studio-${broadcastId}
        const roomName = broadcast?.livekitRoom || `studio-${broadcast.id}`;
        console.log("Generating LiveKit token for room:", roomName);
        try {
          setTokenError(null);
          const response = await fetch("/api/livekit/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              roomName: roomName,
              participantName: `viewer-${broadcast.id}`,
              isPublisher: false,
            }),
          });
          console.log("Token response status:", response.status);
          
          if (!response.ok) {
            const text = await response.text();
            console.error("Token generation failed:", text);
            setTokenError(`Erreur génération token: ${text}`);
            return;
          }

          const data = await response.json();
          console.log("Token response data:", data);
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
  }, [broadcast?.streamMode, broadcast?.id, broadcast?.livekitRoom]);

  if (!broadcast) {
    return (
      <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
        <p className="text-white">Aucune diffusion disponible</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center relative">
      {/* Debug info */}
      {debugInfo && (
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded z-50">
          <div>streamMode: {debugInfo.streamMode || 'undefined'}</div>
          <div>hasId: {debugInfo.hasId}</div>
          <div>hasPlayUrl: {debugInfo.hasPlayUrl}</div>
          <div>status: {debugInfo.status}</div>
          <div>livekitToken: {livekitToken ? 'YES' : 'NO'}</div>
        </div>
      )}

      {((!broadcast?.streamMode || broadcast?.streamMode === "WEBRTC") && livekitToken) ? (
        <LiveKitPlayer
          token={livekitToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ""}
          roomName={broadcast?.livekitRoom || `studio-${broadcast?.id}`}
        />
      ) : ((!broadcast?.streamMode || broadcast?.streamMode === "WEBRTC") && !livekitToken) ? (
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
      ) : broadcast?.playbackUrl ? (
        <iframe
          src={broadcast.playbackUrl}
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
            {isLive ? "Diffusion en cours" : broadcast?.status === "OFFLINE" ? "Diffusion terminée" : "En attente de diffusion"}
          </p>
          <p className="text-xs opacity-50 mt-2">
            streamMode: {broadcast?.streamMode || 'N/A'} | playUrl: {broadcast?.playbackUrl ? 'YES' : 'NO'}
          </p>
        </div>
      )}
    </div>
  );
}
