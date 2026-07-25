"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Video, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { socket } from "@/lib/socket";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "audio" | "video";
  recipientName: string;
  recipientImage?: string | null;
  recipientId?: string;
  currentUserId?: string;
  isIncoming?: boolean;
  incomingCallData?: any;
}

export default function CallModal({ 
  isOpen, 
  onClose, 
  callType, 
  recipientName, 
  recipientImage,
  recipientId,
  currentUserId,
  isIncoming = false,
  incomingCallData
}: CallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callIdRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    if (isIncoming) {
      // Utiliser le callId fourni par l'appelant pour garantir la cohérence
      callIdRef.current = incomingCallData?.callId ?? `${currentUserId}-${recipientId}-${Date.now()}`;
      // L'appel entrant a déjà été accepté par l'utilisateur via IncomingCallModal
      // On démarre directement la réponse WebRTC
      acceptIncomingCall();
    } else {
      // Appel sortant : générer un callId unique
      callIdRef.current = `${currentUserId}-${recipientId}-${Date.now()}`;
      if (recipientId) {
        startOutgoingCall();
      }
    }

    return () => {
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Nettoyer l'interval du chronomètre
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setCallDuration(0);
    setIsConnected(false);
    setIsRinging(false);
  };

  const playRingingSound = () => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(console.error);
    }
  };

  const stopRingingSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const startOutgoingCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:ice", {
            callId: callIdRef.current,
            candidate: event.candidate,
            recipientId,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", {
        callId: callIdRef.current,
        offer,
        recipientId,
        callerId: currentUserId,
        callerName: undefined, // fourni par le serveur via la session
        callType,
      });

      // Handlers nommés pour pouvoir les retirer proprement
      const handleAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        await pc.setRemoteDescription(answer);
        setIsConnected(true);
        setIsRinging(false);
        stopRingingSound();
        startCallDuration();
      };

      const handleIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        try {
          await pc.addIceCandidate(candidate);
        } catch (e) {
          console.error("Erreur ICE (sortant):", e);
        }
      };

      const handleEnd = () => {
        socket.off("call:answer", handleAnswer);
        socket.off("call:ice", handleIce);
        socket.off("call:end", handleEnd);
        cleanup();
        onClose();
      };

      socket.on("call:answer", handleAnswer);
      socket.on("call:ice", handleIce);
      socket.on("call:end", handleEnd);

      setIsRinging(true);
      playRingingSound();
    } catch (error) {
      console.error("Erreur démarrage appel sortant:", error);
      cleanup();
      onClose();
    }
  };

  const acceptIncomingCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:ice", {
            callId: callIdRef.current,
            candidate: event.candidate,
            recipientId: incomingCallData?.callerId,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = incomingCallData?.offer;
      if (offer) {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("call:answer", {
          callId: callIdRef.current,
          answer,
          recipientId: incomingCallData?.callerId,
        });
      }

      // Handlers nommés pour pouvoir les retirer proprement
      const handleIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        try {
          await pc.addIceCandidate(candidate);
        } catch (e) {
          console.error("Erreur ICE (entrant):", e);
        }
      };

      const handleEnd = () => {
        socket.off("call:ice", handleIce);
        socket.off("call:end", handleEnd);
        cleanup();
        onClose();
      };

      socket.on("call:ice", handleIce);
      socket.on("call:end", handleEnd);

      setIsConnected(true);
      setIsRinging(false);
      stopRingingSound();
      startCallDuration();
    } catch (error) {
      console.error("Erreur acceptation appel entrant:", error);
      cleanup();
      onClose();
    }
  };

  const startCallDuration = () => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    // Pour un appel entrant, le destinataire à notifier est l'appelant
    const targetId = isIncoming ? incomingCallData?.callerId : recipientId;
    socket.emit("call:end", {
      callId: callIdRef.current,
      recipientId: targetId,
    });
    cleanup();
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <>
      <audio ref={audioRef} src="/sounds/call.mp3" />
      <div className={`fixed inset-0 bg-black/90 z-50 flex items-center justify-center ${isFullscreen ? "" : "p-4"}`}>
        <div className={`bg-gray-900 rounded-2xl overflow-hidden ${isFullscreen ? "w-full h-full" : "w-full max-w-4xl"}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                {recipientImage ? (
                  <img src={recipientImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-600 font-bold text-xl">
                    {recipientName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">{recipientName}</h3>
                <p className="text-white/80 text-sm">
                  {isRinging ? "Sonnerie..." : isConnected ? formatDuration(callDuration) : "Appel en cours..."}
                </p>
              </div>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/20 transition text-white"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>

          {/* Video Area */}
          {callType === "video" && (
            <div className="relative bg-gray-800 aspect-video">
              {/* Remote Video */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isConnected ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      {recipientImage ? (
                        <img src={recipientImage} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-gray-400 font-bold text-3xl">
                          {recipientName[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-white">{isRinging ? "Sonnerie..." : "Appel en cours..."}</p>
                  </div>
                )}
              </div>

              {/* Local Video */}
              {!isVideoOff && localStreamRef.current && (
                <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Audio Call */}
          {callType === "audio" && (
            <div className="bg-gray-800 p-12 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-purple-500 flex items-center justify-center mb-6">
                {recipientImage ? (
                  <img src={recipientImage} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-white font-bold text-5xl">
                    {recipientName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="text-white text-2xl font-semibold mb-2">{recipientName}</h3>
              <p className="text-gray-400">
                {isRinging ? "Sonnerie..." : isConnected ? formatDuration(callDuration) : "Appel en cours..."}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gray-900 p-6 flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition ${
                isMuted ? "bg-red-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition ${
                  isVideoOff ? "bg-red-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
