"use client";

import { useEffect, useRef } from "react";
import { useLiveKitRoom } from "@/hooks/useLiveKitRoom";
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff } from "lucide-react";

interface PrayerRoomVideoProps {
  roomId: string;
  roomName: string;
  userName: string;
  token: string;
  url: string;
  onLeave?: () => void;
}

export function PrayerRoomVideo({
  roomId,
  roomName,
  userName,
  token,
  url,
  onLeave,
}: PrayerRoomVideoProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const {
    isConnected,
    participants,
    isMuted,
    isCameraEnabled,
    isScreenSharing,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    leaveRoom,
  } = useLiveKitRoom({
    token,
    url,
    roomName,
    onConnected: () => console.log("Connecté à la salle LiveKit"),
    onDisconnected: () => {
      console.log("Déconnecté de la salle LiveKit");
      onLeave?.();
    },
    onError: (error) => console.error("Erreur LiveKit:", error),
  });

  // Attach local video track
  useEffect(() => {
    if (isCameraEnabled && localVideoRef.current) {
      // Le track local sera attaché automatiquement par LiveKit
    }
  }, [isCameraEnabled]);

  // Attach remote video tracks
  useEffect(() => {
    participants.forEach((participant, identity) => {
      const videoElement = remoteVideoRefs.current.get(identity);
      if (videoElement && participant.track) {
        participant.track.attach(videoElement);
      }
    });
  }, [participants]);

  const handleLeave = () => {
    leaveRoom();
    onLeave?.();
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Connexion à la salle de prière...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-auto">
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {userName} (Vous)
          </div>
        </div>

        {/* Remote Videos */}
        {Array.from(participants.entries()).map(([identity, participant]) => (
          <div
            key={identity}
            className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
          >
            <video
              ref={(el) => {
                if (el) remoteVideoRefs.current.set(identity, el);
              }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {participant.name || identity}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMicrophone}
          className={`p-4 rounded-full transition-colors ${
            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-500"
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-colors ${
            !isCameraEnabled ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-500"
          }`}
        >
          {isCameraEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full transition-colors ${
            isScreenSharing ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-600 hover:bg-gray-500"
          }`}
        >
          {isScreenSharing ? <Monitor className="w-6 h-6 text-white" /> : <MonitorOff className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={handleLeave}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
