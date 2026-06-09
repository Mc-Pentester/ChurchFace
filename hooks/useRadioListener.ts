"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { createPeerConnection } from "@/lib/radio/webrtc";

export function useRadioListener(radioId: string | null, enabled: boolean) {
  const [radioInfo, setRadioInfo] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [listenerCount, setListenerCount] = useState(0);
  const [status, setStatus] = useState("Chargement...");
  const [audioPlaying, setAudioPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!radioId || !enabled) return;

    fetch(`/api/radio/${radioId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.radio) {
          setRadioInfo(data.radio);
          setIsLive(Boolean(data.radio.isLive));
          setListenerCount(data.radio.listenerCount || 0);
          setStatus(data.radio.isLive ? "Connexion..." : "Hors antenne");
        }
      })
      .catch(console.error);
  }, [radioId, enabled]);

  useEffect(() => {
    if (!radioId || !enabled) return;

    socket.emit("radio:join", radioId);

    const onStats = (stats: { listenerCount: number }) => {
      setListenerCount(stats.listenerCount);
      setRadioInfo((prev: any) => (prev ? { ...prev, ...stats } : prev));
    };

    const onStatus = (payload: { isLive: boolean }) => {
      setIsLive(payload.isLive);
      if (!payload.isLive) {
        connectedRef.current = false;
        pcRef.current?.close();
        pcRef.current = null;
        setAudioPlaying(false);
        setStatus("Émission terminée");
        if (audioRef.current) audioRef.current.srcObject = null;
      } else {
        setStatus("Connexion...");
        socket.emit("radio:request-offer", radioId);
      }
    };

    const handleReceiveOffer = async (
      offer: RTCSessionDescriptionInit,
      senderId: string
    ) => {
      try {
        pcRef.current?.close();
        const pc = createPeerConnection();
        pcRef.current = pc;

        pc.ontrack = (event) => {
          if (audioRef.current && event.streams[0]) {
            audioRef.current.srcObject = event.streams[0];
            audioRef.current.play().catch(() => {});
            connectedRef.current = true;
            setAudioPlaying(true);
            setStatus("En écoute");
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("radio:ice-candidate", {
              radioId,
              candidate: event.candidate,
              target: senderId,
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("radio:answer", { radioId, answer, target: senderId });
      } catch (err) {
        console.error("Radio listener error:", err);
        setStatus("Erreur de connexion");
      }
    };

    const onOffer = async (payload: {
      offer: RTCSessionDescriptionInit;
      senderId: string;
    }) => {
      await handleReceiveOffer(payload.offer, payload.senderId);
    };

    const onAnswer = async () => {};

    const onIceCandidate = async (payload: {
      candidate: RTCIceCandidateInit;
      senderId: string;
    }) => {
      if (!pcRef.current || !payload.candidate) return;
      try {
        await pcRef.current.addIceCandidate(
          new RTCIceCandidate(payload.candidate)
        );
      } catch (err) {
        console.error(err);
      }
    };

    socket.on("radio:stats", onStats);
    socket.on("radio:status", onStatus);
    socket.on("radio:offer", onOffer);
    socket.on("radio:answer", onAnswer);
    socket.on("radio:ice-candidate", onIceCandidate);

    return () => {
      socket.emit("radio:leave", radioId);
      socket.off("radio:stats", onStats);
      socket.off("radio:status", onStatus);
      socket.off("radio:offer", onOffer);
      socket.off("radio:answer", onAnswer);
      socket.off("radio:ice-candidate", onIceCandidate);
      connectedRef.current = false;
      pcRef.current?.close();
      pcRef.current = null;
      if (audioRef.current) audioRef.current.srcObject = null;
    };
  }, [radioId, enabled]);

  useEffect(() => {
    if (!radioId || !enabled || !isLive || connectedRef.current) return;
    socket.emit("radio:request-offer", radioId);
    setStatus("Connexion au flux...");
  }, [radioId, enabled, isLive]);

  return {
    audioRef,
    radioInfo,
    isLive,
    listenerCount,
    status,
    audioPlaying,
    setAudioPlaying,
  };
}
