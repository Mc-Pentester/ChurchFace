"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Room, RoomEvent, Track, LocalParticipant, RemoteParticipant } from "livekit-client";

interface StudioLiveKitRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onLocalStreamChange?: (stream: MediaStream | null) => void;
  onParticipantJoined?: (participant: RemoteParticipant) => void;
  onParticipantLeft?: (participant: RemoteParticipant) => void;
  initialCameraEnabled?: boolean;
  initialMicEnabled?: boolean;
}

export default function StudioLiveKitRoom({
  token,
  serverUrl,
  roomName,
  onConnected,
  onDisconnected,
  onLocalStreamChange,
  onParticipantJoined,
  onParticipantLeft,
  initialCameraEnabled = true,
  initialMicEnabled = true,
}: StudioLiveKitRoomProps) {
  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(!initialMicEnabled);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialCameraEnabled);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.localParticipant.setMicrophoneEnabled(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Microphone error:", error);
    }
  }, [isMuted]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.localParticipant.setCameraEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error("Camera error:", error);
    }
  }, [isVideoEnabled]);

  const startScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.localParticipant.setScreenShareEnabled(true);
    } catch (error) {
      console.error("Screen share error:", error);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.localParticipant.setScreenShareEnabled(false);
    } catch (error) {
      console.error("Screen share error:", error);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const room = roomRef.current;
    if (room) {
      await room.disconnect();
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        roomRef.current = room;

        room.on(RoomEvent.Connected, () => {
          if (!mounted) return;
          console.log("LiveKit connected:", roomName);
          setIsConnected(true);
          onConnected?.();
        });

        room.on(RoomEvent.Disconnected, () => {
          if (!mounted) return;
          setIsConnected(false);
          onDisconnected?.();
        });

        room.on(RoomEvent.ParticipantConnected, (participant) => {
          if (!mounted) return;
          setParticipants((prev) => [...prev, participant]);
          onParticipantJoined?.(participant);
        });

        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
          if (!mounted) return;
          setParticipants((prev) => prev.filter((p) => p !== participant));
          onParticipantLeft?.(participant);
        });

        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (!mounted) return;
          if (track.kind === Track.Kind.Video) {
            const element = track.attach();
            // Handle remote participant video
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (!mounted) return;
          track.detach();
        });

        await room.connect(serverUrl, token);

        // Enable camera and microphone based on initial state
        await room.localParticipant.setCameraEnabled(initialCameraEnabled);
        await room.localParticipant.setMicrophoneEnabled(initialMicEnabled);

        setIsVideoEnabled(initialCameraEnabled);
        setIsMuted(!initialMicEnabled);

        // Get local stream for preview
        const tracks: MediaStreamTrack[] = [];
        
        // Get video track
        const videoPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (videoPublication?.track?.mediaStreamTrack) {
          tracks.push(videoPublication.track.mediaStreamTrack);
        }
        
        // Get audio track
        const audioPublication = room.localParticipant.getTrackPublication(Track.Source.Microphone);
        if (audioPublication?.track?.mediaStreamTrack) {
          tracks.push(audioPublication.track.mediaStreamTrack);
        }
        
        if (tracks.length > 0) {
          const mediaStream = new MediaStream(tracks);
          setLocalStream(mediaStream);
          onLocalStreamChange?.(mediaStream);
        }

      } catch (error) {
        console.error("LiveKit connection error:", error);
      }
    }

    start();

    return () => {
      mounted = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [
    token,
    serverUrl,
    roomName,
    onConnected,
    onDisconnected,
    onLocalStreamChange,
    onParticipantJoined,
    onParticipantLeft,
    initialCameraEnabled,
    initialMicEnabled,
  ]);

  // Expose control functions via ref for parent components
  useEffect(() => {
    if (roomRef.current) {
      (roomRef.current as any).toggleMute = toggleMute;
      (roomRef.current as any).toggleCamera = toggleCamera;
      (roomRef.current as any).startScreenShare = startScreenShare;
      (roomRef.current as any).stopScreenShare = stopScreenShare;
      (roomRef.current as any).disconnect = disconnect;
    }
  }, [toggleMute, toggleCamera, startScreenShare, stopScreenShare, disconnect]);

  return null; // This component manages the connection but doesn't render anything
}

export type StudioLiveKitRoomRef = {
  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  disconnect: () => Promise<void>;
  room: Room | null;
  localParticipant: LocalParticipant | null;
};
