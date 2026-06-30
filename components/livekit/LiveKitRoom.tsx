"use client";

import { useState, useEffect, useRef } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";

interface LiveKitRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export default function LiveKitRoom({
  token,
  serverUrl,
  roomName,
  onConnected,
  onDisconnected,
}: LiveKitRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    async function connectToRoom() {
      try {
        // Parse STUN/TURN servers from environment
        const stunServers = process.env.NEXT_PUBLIC_LIVEKIT_STUN_SERVERS?.split(',') || [];
        const turnServer = process.env.NEXT_PUBLIC_LIVEKIT_TURN_SERVERS;
        const turnUsername = process.env.NEXT_PUBLIC_LIVEKIT_TURN_USERNAME;
        const turnCredential = process.env.NEXT_PUBLIC_LIVEKIT_TURN_CREDENTIAL;

        const iceServers: RTCIceServer[] = stunServers.map(server => ({
          urls: server.trim(),
        }));

        if (turnServer && turnUsername && turnCredential) {
          iceServers.push({
            urls: turnServer,
            username: turnUsername,
            credential: turnCredential,
          });
        }

        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          iceServers: iceServers.length > 0 ? iceServers : undefined,
        });

        newRoom.on(RoomEvent.Connected, () => {
          console.log("Connected to LiveKit room");
          setIsConnected(true);
          onConnected?.();
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          console.log("Disconnected from LiveKit room");
          setIsConnected(false);
          onDisconnected?.();
        });

        newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Video) {
            const videoElement = track.attach();
            if (videoRef.current) {
              videoRef.current.srcObject = videoElement as unknown as MediaStream;
            }
          }
        });

        await newRoom.connect(serverUrl, token);
        await newRoom.localParticipant.enableCameraAndMicrophone();

        setRoom(newRoom);
        roomRef.current = newRoom;
      } catch (error) {
        console.error("Error connecting to LiveKit room:", error);
      }
    }

    connectToRoom();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [token, serverUrl, onConnected, onDisconnected]);

  const toggleMute = async () => {
    if (room) {
      if (isMuted) {
        await room.localParticipant.unmuteMicrophone();
        setIsMuted(false);
      } else {
        await room.localParticipant.muteMicrophone();
        setIsMuted(true);
      }
    }
  };

  const toggleVideo = async () => {
    if (room) {
      if (isVideoEnabled) {
        await room.localParticipant.disableCamera();
        setIsVideoEnabled(false);
      } else {
        await room.localParticipant.enableCamera();
        setIsVideoEnabled(true);
      }
    }
  };

  const disconnect = async () => {
    if (room) {
      await room.disconnect();
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {!isConnected ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white text-sm">Connexion au serveur...</p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-full ${
                isMuted ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {isMuted ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-white" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-full ${
                !isVideoEnabled ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {isVideoEnabled ? <Video size={16} className="text-white" /> : <VideoOff size={16} className="text-white" />}
            </button>
            <button
              onClick={disconnect}
              className="p-2 rounded-full bg-red-600 hover:bg-red-700"
            >
              <PhoneOff size={16} className="text-white" />
            </button>
          </div>

          {/* Live indicator */}
          <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
        </>
      )}
    </div>
  );
}
