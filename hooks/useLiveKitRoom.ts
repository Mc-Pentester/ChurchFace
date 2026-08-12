"use client";

import { useState, useEffect, useRef } from "react";
import { Room, RoomEvent, Track } from "livekit-client";

interface UseLiveKitRoomProps {
  token: string;
  url: string;
  roomName: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

export function useLiveKitRoom({
  token,
  url,
  roomName,
  onConnected,
  onDisconnected,
  onError,
}: UseLiveKitRoomProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Map<string, any>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    let mounted = true;

    async function connectToRoom() {
      try {
        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: { width: 1280, height: 720 },
          },
        });

        roomRef.current = newRoom;

        // Event listeners
        newRoom.on(RoomEvent.Connected, () => {
          if (mounted) {
            setIsConnected(true);
            setRoom(newRoom);
            onConnected?.();
          }
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          if (mounted) {
            setIsConnected(false);
            setRoom(null);
            setParticipants(new Map());
            onDisconnected?.();
          }
        });

        newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
          if (mounted) {
            setParticipants((prev) => new Map(prev).set(participant.identity, participant));
          }
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
          if (mounted) {
            setParticipants((prev) => {
              const next = new Map(prev);
              next.delete(participant.identity);
              return next;
            });
          }
        });

        newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (mounted) {
            setParticipants((prev) => {
              const next = new Map(prev);
              const existing = next.get(participant.identity);
              if (existing) {
                next.set(participant.identity, { ...existing, track });
              }
              return next;
            });
          }
        });

        newRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
          if (mounted) {
            track.detach();
          }
        });

        await newRoom.connect(url, token);
      } catch (error) {
        if (mounted) {
          console.error("Erreur connexion LiveKit:", error);
          onError?.(error as Error);
        }
      }
    }

    if (token && url) {
      connectToRoom();
    }

    return () => {
      mounted = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [token, url, onConnected, onDisconnected, onError]);

  const toggleMicrophone = async () => {
    if (!room) return;

    try {
      if (isMuted) {
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
      } else {
        await room.localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      }
    } catch (error) {
      console.error("Erreur toggle microphone:", error);
    }
  };

  const toggleCamera = async () => {
    if (!room) return;

    try {
      if (isCameraEnabled) {
        await room.localParticipant.setCameraEnabled(false);
        setIsCameraEnabled(false);
      } else {
        await room.localParticipant.setCameraEnabled(true);
        setIsCameraEnabled(true);
      }
    } catch (error) {
      console.error("Erreur toggle camera:", error);
    }
  };

  const toggleScreenShare = async () => {
    if (!room) return;

    try {
      if (isScreenSharing) {
        await room.localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
      } else {
        await room.localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error("Erreur toggle screen share:", error);
    }
  };

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
    }
  };

  return {
    room,
    isConnected,
    participants,
    isMuted,
    isCameraEnabled,
    isScreenSharing,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    leaveRoom,
  };
}
