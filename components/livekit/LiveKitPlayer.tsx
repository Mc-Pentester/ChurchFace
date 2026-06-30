"use client";

import { useState, useEffect, useRef } from "react";
import { Room, RoomEvent, Track } from "livekit-client";

interface LiveKitPlayerProps {
  token: string;
  serverUrl: string;
  roomName: string;
}

export default function LiveKitPlayer({ token, serverUrl, roomName }: LiveKitPlayerProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
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
          console.log("Connected to LiveKit room as viewer");
          setIsConnected(true);
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          console.log("Disconnected from LiveKit room");
          setIsConnected(false);
          setHasVideo(false);
        });

        newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          console.log("Track subscribed:", track.kind);
          if (track.kind === Track.Kind.Video) {
            setHasVideo(true);
            const videoElement = track.attach();
            if (videoRef.current) {
              videoRef.current.srcObject = videoElement as unknown as MediaStream;
            }
          }
        });

        newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (track.kind === Track.Kind.Video) {
            setHasVideo(false);
          }
        });

        await newRoom.connect(serverUrl, token);
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
  }, [token, serverUrl]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {!isConnected ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white text-sm">Chargement du stream...</p>
          </div>
        </div>
      ) : !hasVideo ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-sm">En attente du stream...</p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={false}
            controls={false}
            className="w-full h-full object-cover"
          />
          
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
