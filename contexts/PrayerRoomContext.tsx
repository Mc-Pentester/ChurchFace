"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { socket } from "@/lib/socket";

interface RoomParticipant {
  id: string;
  userId: string;
  name: string | null;
  image: string | null;
  hasHandRaised: boolean;
  isMuted: boolean;
}

interface PrayerRoomState {
  roomId: string | null;
  isConnected: boolean;
  participants: RoomParticipant[];
  localStream: MediaStream | null;
  isMuted: boolean;
  hasHandRaised: boolean;
}

interface PrayerRoomContextType extends PrayerRoomState {
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  toggleMute: () => void;
  toggleHand: () => void;
}

const PrayerRoomContext = createContext<PrayerRoomContextType | null>(null);

export function PrayerRoomProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PrayerRoomState>({
    roomId: null,
    isConnected: false,
    participants: [],
    localStream: null,
    isMuted: true,
    hasHandRaised: false,
  });

  useEffect(() => {
    socket.on("prayer-room:participants", (participants: RoomParticipant[]) => {
      setState((prev) => ({ ...prev, participants }));
    });

    socket.on("prayer-room:user-joined", (participant: RoomParticipant) => {
      setState((prev) => ({
        ...prev,
        participants: [...prev.participants, participant],
      }));
    });

    socket.on("prayer-room:user-left", ({ userId }: { userId: string }) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.userId !== userId),
      }));
    });

    socket.on("prayer-room:hand-raised", ({ userId, raised }: { userId: string; raised: boolean }) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.userId === userId ? { ...p, hasHandRaised: raised } : p
        ),
      }));
    });

    return () => {
      socket.off("prayer-room:participants");
      socket.off("prayer-room:user-joined");
      socket.off("prayer-room:user-left");
      socket.off("prayer-room:hand-raised");
    };
  }, []);

  const joinRoom = useCallback(async (roomId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setState((prev) => ({ ...prev, localStream: stream, isMuted: true, roomId }));
      stream.getAudioTracks().forEach((track) => (track.enabled = false));
      socket.emit("prayer-room:join", { roomId });
    } catch (err) {
      console.error("Microphone access denied:", err);
      socket.emit("prayer-room:join", { roomId });
    }
  }, []);

  const leaveRoom = useCallback(() => {
    state.localStream?.getTracks().forEach((track) => track.stop());
    socket.emit("prayer-room:leave", { roomId: state.roomId });
    setState({
      roomId: null,
      isConnected: false,
      participants: [],
      localStream: null,
      isMuted: true,
      hasHandRaised: false,
    });
  }, [state.localStream, state.roomId]);

  const toggleMute = useCallback(() => {
    const newMuted = !state.isMuted;
    state.localStream?.getAudioTracks().forEach((track) => (track.enabled = !newMuted));
    setState((prev) => ({ ...prev, isMuted: newMuted }));
    socket.emit("prayer-room:mute", { roomId: state.roomId, muted: newMuted });
  }, [state.isMuted, state.localStream, state.roomId]);

  const toggleHand = useCallback(() => {
    const newRaised = !state.hasHandRaised;
    setState((prev) => ({ ...prev, hasHandRaised: newRaised }));
    socket.emit("prayer-room:raise-hand", { roomId: state.roomId, raised: newRaised });
  }, [state.hasHandRaised, state.roomId]);

  return (
    <PrayerRoomContext.Provider value={{ ...state, joinRoom, leaveRoom, toggleMute, toggleHand }}>
      {children}
    </PrayerRoomContext.Provider>
  );
}

export function usePrayerRoom() {
  const ctx = useContext(PrayerRoomContext);
  if (!ctx) throw new Error("usePrayerRoom must be used within PrayerRoomProvider");
  return ctx;
}
