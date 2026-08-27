"use client";

import { useState, useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Maximize2, Minimize2 } from "lucide-react";
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
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteAnswerAppliedRef = useRef(false);
  const callEndedRef = useRef(false);
  const initializedCallIdRef = useRef<string | null>(null);
  const mediaRequestRef = useRef<Promise<MediaStream> | null>(null);
  const acquisitionCounterRef = useRef(0);
  const mediaCallIdRef = useRef<string | null>(null);
  const cleanupGenerationRef = useRef(0);

  // Safe user data
  const safeRecipientName = recipientName?.trim() || "Utilisateur";
  const safeRecipientInitial = safeRecipientName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      initializedCallIdRef.current = null;
      return;
    }

    if (isIncoming && incomingCallData) {
      const incomingCallId = incomingCallData.callId;
      
      if (!incomingCallId) {
        console.error("[CALL][INCOMING_NO_CALLID]", incomingCallData);
        return;
      }

      // Check if already initialized for this callId
      if (initializedCallIdRef.current === incomingCallId) {
        console.log("[CALL][INIT_SKIP_ALREADY_INITIALIZED]", incomingCallId);
        return;
      }

      // Handle callId change
      if (initializedCallIdRef.current && initializedCallIdRef.current !== incomingCallId) {
        console.log("[CALL][SESSION_CHANGE]", {
          previous: initializedCallIdRef.current,
          current: incomingCallId
        });
        cleanup();
      }

      initializedCallIdRef.current = incomingCallId;
      callIdRef.current = incomingCallId;
      console.log("[CALL][SESSION_START]", incomingCallId, { isIncoming: true });
      acceptIncomingCall();
    } else if (!isIncoming) {
      // Outgoing call - will get callId from server
      const tempCallId = `outgoing-${Date.now()}`;
      
      if (initializedCallIdRef.current === tempCallId) {
        console.log("[CALL][INIT_SKIP_ALREADY_INITIALIZED]", tempCallId);
        return;
      }

      initializedCallIdRef.current = tempCallId;
      console.log("[CALL][SESSION_START]", tempCallId, { isIncoming: false });
      startOutgoingCall();
    }
  }, [isOpen, isIncoming, incomingCallData?.callId, recipientId, currentUserId, callType]);

  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const releaseLocalMedia = () => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    console.log("[CALL][MEDIA][RELEASE]", {
      callId: callIdRef.current,
      tracks: stream.getTracks().map(track => ({
        kind: track.kind,
        readyState: track.readyState
      }))
    });

    stream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch (error) {
        console.warn("[CALL][MEDIA][STOP_ERROR]", error);
      }
    });

    const remaining = stream
      .getTracks()
      .filter(track => track.readyState !== "ended");

    if (remaining.length > 0) {
      console.warn("[CALL][MEDIA][TRACKS_NOT_ENDED]", {
        callId: callIdRef.current,
        remaining: remaining.map(track => ({
          kind: track.kind,
          readyState: track.readyState
        }))
      });
    }

    localStreamRef.current = null;
  };

  const cleanup = () => {
    console.log("[CALL][CLEANUP][TRIGGER]", {
      callId: callIdRef.current,
      generation: cleanupGenerationRef.current,
      isOpen,
      isIncoming,
      callType,
      mediaPending: !!mediaRequestRef.current,
      stack: new Error().stack
    });

    console.log("[CALL][CLEANUP]", callIdRef.current);

    // Increment cleanup generation to invalidate stale acquisitions
    cleanupGenerationRef.current += 1;

    // Mark call as ended to prevent further event processing
    callEndedRef.current = true;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.onsignalingstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    releaseLocalMedia();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Clear ICE queue
    pendingIceCandidatesRef.current = [];

    // Reset answer flag
    remoteAnswerAppliedRef.current = false;

    // Nettoyer l'interval du chronomètre
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    console.log("[CALL][CALL_ID_CLEARED]", callIdRef.current);
    callIdRef.current = "";

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

  const acquireCallMedia = async (callId: string, callType: "audio" | "video"): Promise<MediaStream | null> => {
    const acquisitionId = ++acquisitionCounterRef.current;
    const acquisitionCallId = callId;
    const acquisitionGeneration = cleanupGenerationRef.current;

    console.log("[CALL][MEDIA][BEFORE_ACQUIRE]", {
      callId: acquisitionCallId,
      callType,
      acquisitionId,
      acquisitionGeneration,
      hasExistingStream: !!localStreamRef.current,
      existingStreamActive: localStreamRef.current ? localStreamRef.current.active : false,
      existingVideoTracks: localStreamRef.current ? localStreamRef.current.getVideoTracks().length : 0,
      existingAudioTracks: localStreamRef.current ? localStreamRef.current.getAudioTracks().length : 0,
      isMediaRequestPending: !!mediaRequestRef.current
    });

    // Enumerate devices (DEV only)
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput').length;
      const audioInputs = devices.filter(d => d.kind === 'audioinput').length;
      console.log("[CALL][MEDIA][DEVICES]", {
        callId: acquisitionCallId,
        videoInputCount: videoInputs,
        audioInputCount: audioInputs
      });
    } catch (e) {
      console.warn("[CALL][MEDIA][ENUMERATE_ERROR]", e);
    }

    // Release existing stream before requesting new one
    if (localStreamRef.current) {
      console.log("[CALL][MEDIA][RELEASE_BEFORE_ACQUIRE]", acquisitionCallId);
      releaseLocalMedia();
    }

    // Check if there's already a pending request
    const pending = mediaRequestRef.current;
    if (pending) {
      console.log("[CALL][MEDIA][ACQUIRE_PENDING]", {
        callId: acquisitionCallId,
        acquisitionId
      });
      try {
        const stream = await pending;
        
        // Verify session is still valid
        if (
          callIdRef.current !== acquisitionCallId ||
          cleanupGenerationRef.current !== acquisitionGeneration
        ) {
          console.warn("[CALL][MEDIA][STALE_ACQUISITION]", {
            acquisitionCallId,
            currentCallId: callIdRef.current,
            acquisitionGeneration,
            currentGeneration: cleanupGenerationRef.current
          });
          stream.getTracks().forEach(track => track.stop());
          return null;
        }

        console.log("[CALL][MEDIA][ACQUIRE_SUCCESS]", {
          callId: acquisitionCallId,
          acquisitionId
        });
        localStreamRef.current = stream;
        mediaCallIdRef.current = acquisitionCallId;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        return stream;
      } catch (error) {
        console.error("[CALL][MEDIA][ACQUIRE_ERROR]", {
          callId: acquisitionCallId,
          acquisitionId,
          error
        });
        return null;
      }
    }

    // New acquisition
    console.log("[CALL][MEDIA][ACQUIRE_START]", {
      callId: acquisitionCallId,
      callType,
      acquisitionId,
      acquisitionGeneration
    });

    const request = navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });

    mediaRequestRef.current = request;

    try {
      const stream = await request;

      // Verify session is still valid
      if (
        callIdRef.current !== acquisitionCallId ||
        cleanupGenerationRef.current !== acquisitionGeneration
      ) {
        console.warn("[CALL][MEDIA][STALE_ACQUISITION]", {
          acquisitionCallId,
          currentCallId: callIdRef.current,
          acquisitionGeneration,
          currentGeneration: cleanupGenerationRef.current
        });
        stream.getTracks().forEach(track => track.stop());
        return null;
      }

      console.log("[CALL][MEDIA][ACQUIRE_SUCCESS]", {
        callId: acquisitionCallId,
        acquisitionId
      });
      localStreamRef.current = stream;
      mediaCallIdRef.current = acquisitionCallId;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("[CALL][MEDIA][ACQUIRE_ERROR]", {
        callId: acquisitionCallId,
        acquisitionId,
        error
      });

      // Handle NotReadableError with single retry
      if (error instanceof Error && error.name === 'NotReadableError') {
        console.warn("[CALL][MEDIA][RETRY_NOT_READABLE]", acquisitionCallId);
        
        // Release any existing media
        releaseLocalMedia();
        
        // Wait 100ms before retry
        await new Promise(resolve => setTimeout(resolve, 100));

        // Retry once
        const retryRequest = navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        try {
          const retryStream = await retryRequest;

          // Verify session is still valid
          if (
            callIdRef.current !== acquisitionCallId ||
            cleanupGenerationRef.current !== acquisitionGeneration
          ) {
            console.warn("[CALL][MEDIA][STALE_ACQUISITION_RETRY]", {
              acquisitionCallId,
              currentCallId: callIdRef.current,
              acquisitionGeneration,
              currentGeneration: cleanupGenerationRef.current
            });
            retryStream.getTracks().forEach(track => track.stop());
            return null;
          }

          console.log("[CALL][MEDIA][ACQUIRE_SUCCESS_RETRY]", {
            callId: acquisitionCallId,
            acquisitionId
          });
          localStreamRef.current = retryStream;
          mediaCallIdRef.current = acquisitionCallId;

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = retryStream;
          }

          return retryStream;
        } catch (retryError) {
          console.error("[CALL][MEDIA][RETRY_FAILED]", {
            callId: acquisitionCallId,
            acquisitionId,
            error: retryError
          });
          return null;
        }
      }

      return null;
    } finally {
      // Only nullify if this is still the current request
      if (mediaRequestRef.current === request) {
        mediaRequestRef.current = null;
      }
    }
  };

  const startOutgoingCall = async () => {
    try {
      console.log("[CALL][OUTGOING] Starting call", { recipientId, callType });

      // 1. Créer l'appel en base de données pour obtenir un callId synchronisé
      const callResponse = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, callType }),
      });

      if (!callResponse.ok) {
        throw new Error("Failed to create call");
      }

      const callData = await callResponse.json();
      const serverCallId = callData.callId;
      
      if (callIdRef.current && callIdRef.current !== serverCallId) {
        console.error("[CALL][CALL_ID_CHANGED]", {
          old: callIdRef.current,
          new: serverCallId
        });
      }
      callIdRef.current = serverCallId;

      console.log("[CALL][CALL_ID_SET]", serverCallId, { isIncoming: false });
      console.log("[CALL][DB_CREATED]", serverCallId, { recipientId, callType });

      // Acquire media using the unified function
      const stream = await acquireCallMedia(serverCallId, callType);
      
      if (!stream) {
        console.error("[CALL][MEDIA_ACQUISITION_FAILED]", serverCallId);
        cleanup();
        onClose();
        return;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((track: MediaStreamTrack) => pc.addTrack(track, stream));

      let offer;
      try {
        offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
      } catch (error) {
        console.error("[CALL][OFFER_ERROR]", callIdRef.current, error);
        cleanup();
        onClose();
        return;
      }

      console.log("[CALL][OFFER_SENT]", callIdRef.current, { recipientId, callType });

      socket.emit("call:offer", {
        callId: callIdRef.current,
        offer,
        recipientId,
        callerId: currentUserId,
        callerName: undefined, // fourni par le serveur via la session
        callType,
      });

      // Handlers nommés pour pouvoir les retirer proprement
      const handleAnswer = async ({ answer, callId: receivedCallId }: { answer: RTCSessionDescriptionInit; callId?: string }) => {
        // Check if call has ended
        if (callEndedRef.current) {
          console.log("[CALL][ANSWER_IGNORED_CALL_ENDED]", callIdRef.current);
          return;
        }

        // Verify callId matches
        if (receivedCallId && receivedCallId !== callIdRef.current) {
          console.warn("[CALL][ANSWER_IGNORED_WRONG_CALLID]", {
            expected: callIdRef.current,
            received: receivedCallId
          });
          return;
        }

        // Check if answer already applied
        if (remoteAnswerAppliedRef.current) {
          console.warn("[CALL][ANSWER_IGNORED_DUPLICATE]", callIdRef.current);
          return;
        }

        const currentPc = peerConnectionRef.current;
        if (!currentPc || currentPc.signalingState === "closed") {
          console.error("[CALL][ANSWER_IGNORED_NO_PC]", callIdRef.current);
          return;
        }

        // Check signaling state
        if (currentPc.signalingState !== "have-local-offer") {
          console.warn("[CALL][ANSWER_IGNORED_WRONG_STATE]", callIdRef.current, currentPc.signalingState);
          return;
        }

        console.log("[CALL][ANSWER_RECEIVED]", callIdRef.current);
        try {
          await currentPc.setRemoteDescription(answer);
          remoteAnswerAppliedRef.current = true;
          await flushPendingIceCandidates();
          setIsConnected(true);
          setIsRinging(false);
          stopRingingSound();
          startCallDuration();
          console.log("[CALL][CONNECTED]", callIdRef.current);
        } catch (error) {
          console.error("[CALL][ANSWER_ERROR]", callIdRef.current, error);
        }
      };

      const handleIce = async ({ candidate, callId: receivedCallId }: { candidate: RTCIceCandidateInit; callId?: string }) => {
        if (!candidate) {
          return;
        }

        // Check if call has ended
        if (callEndedRef.current) {
          console.log("[CALL][ICE_IGNORED_CALL_ENDED]", callIdRef.current);
          return;
        }

        // Verify callId matches
        if (receivedCallId && receivedCallId !== callIdRef.current) {
          console.warn("[CALL][ICE_IGNORED_WRONG_CALLID]", {
            expected: callIdRef.current,
            received: receivedCallId
          });
          return;
        }

        const currentPc = peerConnectionRef.current;

        if (!currentPc) {
          console.log("[CALL][ICE_QUEUE] No PeerConnection yet", callIdRef.current);
          pendingIceCandidatesRef.current.push(candidate);
          return;
        }

        if (currentPc.signalingState === "closed") {
          console.log("[CALL][ICE_IGNORED_CLOSED]", callIdRef.current);
          return;
        }

        if (!currentPc.remoteDescription) {
          console.log("[CALL][ICE_QUEUE] Remote description not ready", callIdRef.current);
          pendingIceCandidatesRef.current.push(candidate);
          return;
        }

        try {
          await currentPc.addIceCandidate(candidate);
          console.log("[CALL][ICE_RECEIVED]", callIdRef.current);
        } catch (e) {
          console.error("[CALL][ICE_ERROR]", callIdRef.current, e);
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
      console.log("[CALL][INCOMING_ACCEPT]", callIdRef.current, { callerId: incomingCallData?.callerId, callType });

      // Acquire media using the unified function
      const stream = await acquireCallMedia(callIdRef.current, callType);
      
      if (!stream) {
        console.error("[CALL][MEDIA_ACQUISITION_FAILED]", callIdRef.current);
        cleanup();
        onClose();
        return;
      }

      const pc = createPeerConnection();
      stream.getTracks().forEach((track: MediaStreamTrack) => pc.addTrack(track, stream));

      const offer = incomingCallData?.offer;
      if (offer) {
        try {
          console.log("[CALL][OFFER_RECEIVED]", callIdRef.current);
          await pc.setRemoteDescription(offer);
          await flushPendingIceCandidates();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          console.log("[CALL][ANSWER_SENT]", callIdRef.current);
          socket.emit("call:answer", {
            callId: callIdRef.current,
            answer,
            recipientId: incomingCallData?.callerId,
          });

          setIsConnected(true);
          setIsRinging(false);
          stopRingingSound();
          startCallDuration();
        } catch (error) {
          console.error("[CALL][ANSWER_ERROR]", callIdRef.current, error);
          cleanup();
          onClose();
          return;
        }
      }

      // Handlers nommés pour pouvoir les retirer proprement
      const handleIce = async ({ candidate, callId: receivedCallId }: { candidate: RTCIceCandidateInit; callId?: string }) => {
        if (!candidate) {
          return;
        }

        // Check if call has ended
        if (callEndedRef.current) {
          console.log("[CALL][ICE_IGNORED_CALL_ENDED]", callIdRef.current);
          return;
        }

        // Verify callId matches
        if (receivedCallId && receivedCallId !== callIdRef.current) {
          console.warn("[CALL][ICE_IGNORED_WRONG_CALLID]", {
            expected: callIdRef.current,
            received: receivedCallId
          });
          return;
        }

        const currentPc = peerConnectionRef.current;

        if (!currentPc) {
          console.log("[CALL][ICE_QUEUE] No PeerConnection yet", callIdRef.current);
          pendingIceCandidatesRef.current.push(candidate);
          return;
        }

        if (currentPc.signalingState === "closed") {
          console.log("[CALL][ICE_IGNORED_CLOSED]", callIdRef.current);
          return;
        }

        if (!currentPc.remoteDescription) {
          console.log("[CALL][ICE_QUEUE] Remote description not ready", callIdRef.current);
          pendingIceCandidatesRef.current.push(candidate);
          return;
        }

        try {
          await currentPc.addIceCandidate(candidate);
          console.log("[CALL][ICE_RECEIVED]", callIdRef.current);
        } catch (e) {
          console.error("[CALL][ICE_ERROR]", callIdRef.current, e);
        }
      };

      const handleEnd = () => {
        console.log("[CALL][END_RECEIVED]", callIdRef.current);
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

  const flushPendingIceCandidates = async () => {
    const currentPc = peerConnectionRef.current;

    if (!currentPc) {
      return;
    }

    if (currentPc.signalingState === "closed") {
      pendingIceCandidatesRef.current = [];
      return;
    }

    if (!currentPc.remoteDescription) {
      return;
    }

    const pending = pendingIceCandidatesRef.current;
    pendingIceCandidatesRef.current = [];

    for (const candidate of pending) {
      try {
        await currentPc.addIceCandidate(candidate);
        console.log("[CALL][ICE_FLUSHED]", callIdRef.current);
      } catch (error) {
        console.error("[CALL][ICE_FLUSH_ERROR]", callIdRef.current, error);
      }
    }
  };

  const createPeerConnection = () => {
    // Check if already exists and not closed
    if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
      console.log("[CALL][PC_REUSE]", callIdRef.current);
      return peerConnectionRef.current;
    }

    console.log("[CALL][PC_CREATED]", callIdRef.current);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peerConnectionRef.current = pc;

    // Monitoring WebRTC
    pc.oniceconnectionstatechange = () => {
      console.log("[CALL][ICE_STATE]", callIdRef.current, pc.iceConnectionState);
      if (pc.iceConnectionState === "failed") {
        console.error("[CALL][ICE_FAILED]", callIdRef.current);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[CALL][CONNECTION_STATE]", callIdRef.current, pc.connectionState);
      if (pc.connectionState === "connected") {
        console.log("[CALL][CONNECTED]", callIdRef.current);
      } else if (pc.connectionState === "failed") {
        console.error("[CALL][CONNECTION_FAILED]", callIdRef.current);
      }
    };

    pc.onsignalingstatechange = () => {
      console.log("[CALL][SIGNALING_STATE]", callIdRef.current, pc.signalingState);
    };

    pc.ontrack = (event) => {
      console.log("[CALL][TRACK_RECEIVED]", callIdRef.current);
      if (remoteVideoRef.current && event.streams && event.streams.length > 0) {
        remoteVideoRef.current.srcObject = event.streams[0];
      } else {
        console.warn("[CALL][TRACK_NO_STREAM]", callIdRef.current);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[CALL][ICE_SENT]", callIdRef.current);
        const targetId = isIncoming ? incomingCallData?.callerId : recipientId;
        socket.emit("call:ice", {
          callId: callIdRef.current,
          candidate: event.candidate,
          recipientId: targetId,
        });
      }
    };

    return pc;
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
                    {safeRecipientInitial}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">{safeRecipientName}</h3>
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
                          {safeRecipientInitial}
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
                    {safeRecipientInitial}
                  </span>
                )}
              </div>
              <h3 className="text-white text-2xl font-semibold mb-2">{safeRecipientName}</h3>
              <p className="text-gray-400">
                {isRinging ? "Sonnerie..." : isConnected ? formatDuration(callDuration) : "Appel en cours..."}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gray-900 p-4 flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full ${isMuted ? "bg-red-500" : "bg-gray-700"} hover:bg-gray-600 transition text-white`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${isVideoOff ? "bg-red-500" : "bg-gray-700"} hover:bg-gray-600 transition text-white`}
              >
                {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
              </button>
            )}

            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition text-white"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
