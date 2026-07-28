"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
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
  onCameraEnabledChange?: (enabled: boolean) => void;
  onMicEnabledChange?: (enabled: boolean) => void;
  onDevicesAvailable?: (devices: { cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[] }) => void;
  initialCameraEnabled?: boolean;
  initialMicEnabled?: boolean;
}

export interface StudioLiveKitRoomRef {
  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  disconnect: () => Promise<void>;
  room: Room | null;
  localParticipant: LocalParticipant | null;
  switchCamera: (deviceId: string) => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
}

const StudioLiveKitRoom = forwardRef<StudioLiveKitRoomRef, StudioLiveKitRoomProps>(({
  token,
  serverUrl,
  roomName,
  onConnected,
  onDisconnected,
  onLocalStreamChange,
  onParticipantJoined,
  onParticipantLeft,
  onCameraEnabledChange,
  onMicEnabledChange,
  onDevicesAvailable,
  initialCameraEnabled = true,
  initialMicEnabled = true,
}, ref) => {
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
      onMicEnabledChange?.(!isMuted);
    } catch (error) {
      console.error("Microphone error:", error);
    }
  }, [isMuted, onMicEnabledChange]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.localParticipant.setCameraEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
      onCameraEnabledChange?.(!isVideoEnabled);
    } catch (error) {
      console.error("Camera error:", error);
    }
  }, [isVideoEnabled, onCameraEnabledChange]);

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

  const switchCamera = useCallback(async (deviceId: string) => {
    const room = roomRef.current;
    if (!room) {
      console.error("No room available for camera switch. Room state:", {
        isConnected,
        roomExists: !!room
      });
      return;
    }

    try {
      console.log("Switching camera to device:", deviceId);
      
      // Enable camera with specific device
      await room.localParticipant.setCameraEnabled(true, {
        deviceId: { exact: deviceId }
      });
      
      console.log("Camera switched successfully");
    } catch (error) {
      console.error("Camera switch error:", error);
    }
  }, [isConnected]);

  const switchMicrophone = useCallback(async (deviceId: string) => {
    const room = roomRef.current;
    if (!room) {
      console.error("No room available for microphone switch");
      return;
    }

    try {
      console.log("Switching microphone to device:", deviceId);
      
      // Enable microphone with specific device
      await room.localParticipant.setMicrophoneEnabled(true, {
        deviceId: { exact: deviceId }
      });
      
      console.log("Microphone switched successfully");
    } catch (error) {
      console.error("Microphone switch error:", error);
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
    let tempStream: MediaStream | null = null;

    async function start() {
      try {
        // Request permission first to get full device list
        try {
          tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          
          // Stop the temporary stream
          tempStream.getTracks().forEach(track => track.stop());
          tempStream = null;
        } catch (permError) {
          console.warn("Permission denied or no devices:", permError);
          // Continue with device enumeration anyway (may return empty or unlabeled devices)
        }
        
        // Get available devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        const microphones = devices.filter(device => device.kind === 'audioinput');
        
        console.log("Detected devices:", { cameras: cameras.length, microphones: microphones.length });
        
        if (mounted && onDevicesAvailable) {
          onDevicesAvailable({ cameras, microphones });
        }

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
  useImperativeHandle(ref, () => ({
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    disconnect,
    switchCamera,
    switchMicrophone,
    room: roomRef.current,
    localParticipant: roomRef.current?.localParticipant || null,
  }), [toggleMute, toggleCamera, startScreenShare, stopScreenShare, disconnect, switchCamera, switchMicrophone]);

  return null; // This component manages the connection but doesn't render anything
});

StudioLiveKitRoom.displayName = "StudioLiveKitRoom";

export default StudioLiveKitRoom;
