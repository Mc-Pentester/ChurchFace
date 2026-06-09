"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { socket } from "@/lib/socket";
import { createPeerConnection, RadioAudioMixer } from "@/lib/radio/webrtc";

export type BroadcastStatus = "idle" | "connecting" | "live" | "error";

interface UseRadioBroadcastOptions {
  radioId?: string;
  isLive: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  micVolume: number;
  micMuted: boolean;
  musicVolume: number;
  musicMuted: boolean;
}

export function useRadioBroadcast({
  radioId,
  isLive,
  audioRef,
  micVolume,
  micMuted,
  musicVolume,
  musicMuted,
}: UseRadioBroadcastOptions) {
  const [status, setStatus] = useState<BroadcastStatus>("idle");
  const [peerCount, setPeerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mixerRef = useRef<RadioAudioMixer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const activeRef = useRef(false);

  useEffect(() => {
    mixerRef.current?.setMicLevel(micVolume, micMuted);
  }, [micVolume, micMuted]);

  useEffect(() => {
    mixerRef.current?.setMusicLevel(musicVolume, musicMuted);
  }, [musicVolume, musicMuted]);

  const closePeer = (listenerId: string) => {
    const pc = peersRef.current.get(listenerId);
    if (pc) {
      pc.close();
      peersRef.current.delete(listenerId);
      setPeerCount(peersRef.current.size);
    }
  };

  const closeAllPeers = () => {
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    setPeerCount(0);
  };

  const connectListener = async (listenerId: string) => {
    if (!radioId || !streamRef.current || peersRef.current.has(listenerId)) return;

    try {
      const pc = createPeerConnection();
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current!);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("radio:ice-candidate", {
            radioId,
            candidate: event.candidate,
            target: listenerId,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          closePeer(listenerId);
        }
      };

      peersRef.current.set(listenerId, pc);
      setPeerCount(peersRef.current.size);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("radio:offer", { radioId, offer, target: listenerId });
    } catch (err) {
      console.error("Connect listener error:", err);
    }
  };

  useEffect(() => {
    if (!radioId || !isLive) {
      activeRef.current = false;
      closeAllPeers();
      mixerRef.current?.suspend();
      if (radioId) {
        socket.emit("radio:broadcast-leave", radioId);
        socket.emit("studio:leave", radioId);
      }
      setStatus("idle");
      return;
    }

    let cancelled = false;
    activeRef.current = true;

    const onListenerJoined = (listenerId: string) => {
      if (!activeRef.current) return;
      connectListener(listenerId);
    };

    const onAnswer = async (payload: {
      answer: RTCSessionDescriptionInit;
      senderId: string;
    }) => {
      const pc = peersRef.current.get(payload.senderId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      } catch (err) {
        console.error("Set remote answer error:", err);
      }
    };

    const onIceCandidate = async (payload: {
      candidate: RTCIceCandidateInit;
      senderId: string;
    }) => {
      const pc = peersRef.current.get(payload.senderId);
      if (!pc || !payload.candidate) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (err) {
        console.error("Add ICE candidate error:", err);
      }
    };

    socket.on("radio:listener-joined", onListenerJoined);
    socket.on("radio:answer", onAnswer);
    socket.on("radio:ice-candidate", onIceCandidate);

    async function startBroadcast() {
      setStatus("connecting");
      setError(null);

      try {
        if (!mixerRef.current) {
          const mixer = new RadioAudioMixer();
          const stream = await mixer.start(audioRef.current);
          if (cancelled) {
            mixer.stop();
            return;
          }
          mixerRef.current = mixer;
          streamRef.current = stream;
        } else {
          streamRef.current = await mixerRef.current.start(audioRef.current);
        }

        mixerRef.current.setMicLevel(micVolume, micMuted);
        mixerRef.current.setMusicLevel(musicVolume, musicMuted);

        socket.emit("studio:join", radioId);
        socket.emit("radio:broadcast-join", radioId);
        setStatus("live");
      } catch (err) {
        console.error("Broadcast start error:", err);
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Impossible d'accéder au micro"
        );
      }
    }

    startBroadcast();

    return () => {
      cancelled = true;
      activeRef.current = false;
      socket.off("radio:listener-joined", onListenerJoined);
      socket.off("radio:answer", onAnswer);
      socket.off("radio:ice-candidate", onIceCandidate);
      closeAllPeers();
      if (radioId) {
        socket.emit("radio:broadcast-leave", radioId);
        socket.emit("studio:leave", radioId);
      }
    };
  }, [radioId, isLive]);

  useEffect(() => {
    return () => {
      closeAllPeers();
      mixerRef.current?.stop();
      mixerRef.current = null;
      streamRef.current = null;
    };
  }, []);

  return { status, peerCount, error };
}
