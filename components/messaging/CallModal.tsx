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
  callId?: string;
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
  incomingCallData,
  callId: propCallId
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
  const initializationRef = useRef(false);
  const initializedCallIdRef = useRef<string | null>(null);
  const offerCreatedCallIdRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const initializationInProgressRef = useRef(false);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Refs pour stocker les handlers afin de pouvoir les retirer dans cleanup
  const handleAnswerRef = useRef<((data: any) => Promise<void>) | null>(null);
  const handleIceRef = useRef<((data: any) => Promise<void>) | null>(null);
  const handleEndRef = useRef<((data: any) => void) | null>(null);

  const cleanup = (cleanupSessionToken?: string) => {
    // Vérifier sessionToken pour éviter stale cleanup
    if (cleanupSessionToken && sessionTokenRef.current !== cleanupSessionToken) {
      console.warn("[CALL][STALE_CLEANUP_IGNORED]", {
        cleanupSessionToken,
        activeSessionToken: sessionTokenRef.current,
      });
      return;
    }

    console.log("[CALL][SESSION_CLEANUP]", {
      sessionToken: sessionTokenRef.current,
      callId: callIdRef.current,
    });

    // Retirer les listeners Socket.IO en premier
    if (handleAnswerRef.current) {
      console.log("[CALL][LISTENER_REMOVE]", {
        event: "call:answer",
        callId: callIdRef.current,
        sessionToken: sessionTokenRef.current,
      });
      socket.off("call:answer", handleAnswerRef.current);
      handleAnswerRef.current = null;
    }
    if (handleIceRef.current) {
      console.log("[CALL][LISTENER_REMOVE]", {
        event: "call:ice",
        callId: callIdRef.current,
        sessionToken: sessionTokenRef.current,
      });
      socket.off("call:ice", handleIceRef.current);
      handleIceRef.current = null;
    }
    if (handleEndRef.current) {
      console.log("[CALL][LISTENER_REMOVE]", {
        event: "call:end",
        callId: callIdRef.current,
        sessionToken: sessionTokenRef.current,
      });
      socket.off("call:end", handleEndRef.current);
      handleEndRef.current = null;
    }

    const pc = peerConnectionRef.current;
    
    // Close peer connection idempotently
    if (pc && pc.signalingState !== "closed") {
      console.log("[CALL][PC_CLOSED]", {
        callId: callIdRef.current,
        sessionToken: sessionTokenRef.current,
      });
      pc.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear remote video source
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Clear local video source
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // Stop ringing sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Clear ICE queue
    pendingIceCandidatesRef.current = [];

    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Reset state
    setCallDuration(0);
    setIsConnected(false);
    setIsRinging(false);
    
    // Nettoyer callId
    callIdRef.current = "";
    
    // Nettoyer initializedCallIdRef
    initializedCallIdRef.current = null;
    
    // Reset initialization ref pour permettre un nouvel appel
    initializationRef.current = false;
    
    // Reset initializationInProgress
    initializationInProgressRef.current = false;
    
    // Reset offerCreatedCallIdRef
    offerCreatedCallIdRef.current = null;
    
    // Nettoyer sessionToken en DERNIER
    sessionTokenRef.current = null;
  };

  // Cleanup global au démontage du composant (Fast Refresh)
  useEffect(() => {
    return () => {
      // Nettoyer toutes les ressources sans vérifier sessionToken
      // car Fast Refresh peut détruire le composant sans passer par le flux normal
      console.log("[CALL][COMPONENT_UNMOUNT_CLEANUP]");
      
      // Retirer les listeners Socket.IO
      if (handleAnswerRef.current) {
        socket.off("call:answer", handleAnswerRef.current);
        handleAnswerRef.current = null;
      }
      if (handleIceRef.current) {
        socket.off("call:ice", handleIceRef.current);
        handleIceRef.current = null;
      }
      if (handleEndRef.current) {
        socket.off("call:end", handleEndRef.current);
        handleEndRef.current = null;
      }

      // Close peer connection
      const pc = peerConnectionRef.current;
      if (pc && pc.signalingState !== "closed") {
        pc.close();
        peerConnectionRef.current = null;
      }

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }

      // Clear video sources
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      // Stop ringing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Clear interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Reset refs
      sessionTokenRef.current = null;
      callIdRef.current = "";
      initializedCallIdRef.current = null;
      initializationRef.current = false;
      initializationInProgressRef.current = false;
      offerCreatedCallIdRef.current = null;
      pendingIceCandidatesRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanup(sessionTokenRef.current || undefined);
      return;
    }

    // Protection contre double initialisation en cours
    if (initializationInProgressRef.current) {
      console.warn("[CALL][INIT_ALREADY_IN_PROGRESS]", {
        sessionToken: sessionTokenRef.current,
      });
      return;
    }

    // Protection contre double initialisation pour le même callId
    if (initializedCallIdRef.current === propCallId) {
      console.warn("[CALL][DUPLICATE_INIT_BLOCKED]", { callId: propCallId });
      return;
    }

    // Protection React StrictMode - éviter double initialisation
    if (initializationRef.current) {
      console.log("[CALL][ALREADY_INITIALIZED]", { callId: callIdRef.current });
      return;
    }

    // Générer un sessionToken unique pour cette session
    const sessionToken = crypto.randomUUID();
    sessionTokenRef.current = sessionToken;
    initializationInProgressRef.current = true;

    console.log("[CALL][SESSION_START]", {
      callId: propCallId,
      sessionToken,
      isIncoming,
    });

    if (isIncoming) {
      // Appel entrant : utiliser exclusivement le callId du serveur
      const serverCallId = incomingCallData?.callId?.trim();
      
      if (!serverCallId) {
        console.error("[CALL][INCOMING][MISSING_CALL_ID]", {
          callerId: incomingCallData?.callerId,
          currentUserId,
          recipientId,
        });
        initializationInProgressRef.current = false;
        onClose();
        return;
      }
      
      // callId immutable - ne pas écraser si déjà défini
      if (!callIdRef.current) {
        callIdRef.current = serverCallId;
      }
      initializedCallIdRef.current = serverCallId;
      initializationRef.current = true;
      
      // L'appel entrant a déjà été accepté par l'utilisateur via IncomingCallModal
      // On démarre directement la réponse WebRTC
      acceptIncomingCall(sessionToken);
    } else {
      // Appel sortant : utiliser le callId fourni par CallContext
      if (!propCallId) {
        console.error("[CALL][MISSING_CALL_ID]", { recipientId });
        initializationInProgressRef.current = false;
        onClose();
        return;
      }
      
      // callId immutable - ne pas écraser si déjà défini
      if (!callIdRef.current) {
        callIdRef.current = propCallId;
      }
      initializedCallIdRef.current = propCallId;
      initializationRef.current = true;
      
      if (recipientId) {
        startOutgoingCall(sessionToken);
      }
    }

    initializationInProgressRef.current = false;

    return () => {
      cleanup(sessionToken);
    };
  }, [isOpen, propCallId]);

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

  const startOutgoingCall = async (sessionToken: string) => {
    try {
      // Vérifier sessionToken avant toute opération
      if (sessionTokenRef.current !== sessionToken) {
        console.warn("[CALL][STALE_SESSION_IGNORED]", {
          sessionToken,
          activeSessionToken: sessionTokenRef.current,
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      
      // Vérifier sessionToken après getUserMedia
      if (sessionTokenRef.current !== sessionToken) {
        console.warn("[CALL][STALE_SESSION_IGNORED_AFTER_GETUSERMEDIA]", {
          sessionToken,
          activeSessionToken: sessionTokenRef.current,
        });
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Protection contre double PeerConnection
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
        console.warn("[CALL][DUPLICATE_PC_BLOCKED]", { callId: callIdRef.current });
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      peerConnectionRef.current = pc;

      // Add monitoring logs
      pc.oniceconnectionstatechange = () => {
        console.log("[CALL][ICE_STATE]", {
          callId: callIdRef.current,
          state: pc.iceConnectionState,
        });
      };

      pc.onconnectionstatechange = () => {
        console.log("[CALL][CONNECTION_STATE]", {
          callId: callIdRef.current,
          state: pc.connectionState,
        });
      };

      pc.onsignalingstatechange = () => {
        console.log("[CALL][SIGNALING_STATE]", {
          callId: callIdRef.current,
          state: pc.signalingState,
        });
      };

      pc.onicegatheringstatechange = () => {
        console.log("[CALL][ICE_GATHERING]", {
          callId: callIdRef.current,
          state: pc.iceGatheringState,
        });
      };

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const currentCallId = callIdRef.current;
          console.log("[CALL][ICE_SENT]", currentCallId);
          
          if (!currentCallId) {
            console.error("[CALL][ICE_NO_CALLID]", {
              callId: currentCallId,
            });
            return;
          }
          
          socket.emit("call:ice", {
            callId: currentCallId,
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

      // Stocker les handlers dans les refs pour cleanup
      handleAnswerRef.current = handleAnswer;
      handleIceRef.current = handleIce;
      handleEndRef.current = handleEnd;

      console.log("[CALL][LISTENER_ADD]", {
        event: "call:answer",
        callId: callIdRef.current,
        sessionToken,
      });
      socket.on("call:answer", handleAnswer);

      console.log("[CALL][LISTENER_ADD]", {
        event: "call:ice",
        callId: callIdRef.current,
        sessionToken,
      });
      socket.on("call:ice", handleIce);

      console.log("[CALL][LISTENER_ADD]", {
        event: "call:end",
        callId: callIdRef.current,
        sessionToken,
      });
      socket.on("call:end", handleEnd);

      // Vérifier sessionToken avant createOffer
      if (sessionTokenRef.current !== sessionToken) {
        console.warn("[CALL][STALE_SESSION_IGNORED_BEFORE_OFFER]", {
          sessionToken,
          activeSessionToken: sessionTokenRef.current,
        });
        return;
      }

      // Protection contre double offer
      if (offerCreatedCallIdRef.current === callIdRef.current) {
        console.warn("[CALL][DUPLICATE_OFFER_BLOCKED]", { callId: callIdRef.current });
        return;
      }

      const offer = await pc.createOffer();
      
      // Vérifier sessionToken après createOffer
      if (sessionTokenRef.current !== sessionToken) {
        console.warn("[CALL][STALE_SESSION_IGNORED_AFTER_OFFER]", {
          sessionToken,
          activeSessionToken: sessionTokenRef.current,
        });
        return;
      }
      
      offerCreatedCallIdRef.current = callIdRef.current;
      await pc.setLocalDescription(offer);

      console.log("[CALL][OFFER_CREATED]", {
        callId: callIdRef.current,
        sessionToken,
      });

      if (!callIdRef.current) {
        console.error("[CALL][OFFER][NO_CALL_ID]", {
          callId: callIdRef.current,
        });
        cleanup(sessionToken);
        onClose();
        return;
      }

      console.log("[CALL][OFFER][CALL_ID]", {
        callId: callIdRef.current,
      });

      socket.emit("call:offer", {
        callId: callIdRef.current,
        offer,
        recipientId,
      });

      console.log("[CALL][OFFER][SENT]", {
        callId: callIdRef.current,
        sessionToken,
      });

      setIsRinging(true);
      playRingingSound();
    } catch (error) {
      console.error("Erreur démarrage appel sortant:", error);
      cleanup(sessionToken);
      onClose();
    }
  };

  // Handlers nommés pour pouvoir les retirer proprement
  const handleAnswer = async ({ answer, callId: eventCallId }: { answer: RTCSessionDescriptionInit; callId?: string }) => {
    const sessionToken = sessionTokenRef.current;
    const currentCallId = callIdRef.current;
    const pc = peerConnectionRef.current;

    if (eventCallId && eventCallId !== currentCallId) {
      console.log("[CALL][IGNORE_FOREIGN_EVENT]", { event: "call:answer", eventCallId, currentCallId });
      return;
    }

    if (!pc) {
      console.warn("[CALL][ANSWER][NO_PC]", { callId: currentCallId });
      return;
    }

    if (pc.signalingState === "closed") {
      console.warn("[CALL][ANSWER][PC_CLOSED]", { callId: currentCallId });
      return;
    }

    console.log("[CALL][ANSWER_RECEIVED]", { callId: currentCallId, sessionToken });
    await pc.setRemoteDescription(answer);
    
    // Process queued ICE candidates
    console.log("[CALL][PROCESSING_QUEUED_ICE]", { count: pendingIceCandidatesRef.current.length });
    for (const candidate of pendingIceCandidatesRef.current) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.error("Erreur ICE (queued):", e);
      }
    }
    pendingIceCandidatesRef.current = [];
    
    setIsConnected(true);
    setIsRinging(false);
    stopRingingSound();
    startCallDuration();
  };

  const handleIce = async ({ candidate, callId: eventCallId }: { candidate: RTCIceCandidateInit; callId?: string }) => {
    const sessionToken = sessionTokenRef.current;
    const currentCallId = callIdRef.current;
    const pc = peerConnectionRef.current;

    if (eventCallId && eventCallId !== currentCallId) {
      console.log("[CALL][IGNORE_FOREIGN_EVENT]", { event: "call:ice", eventCallId, currentCallId });
      return;
    }

    if (!pc) {
      console.log("[CALL][ICE_NO_PC]", { callId: currentCallId });
      return;
    }

    if (pc.signalingState === "closed") {
      console.log("[CALL][ICE_PC_CLOSED]", { callId: currentCallId });
      return;
    }

    // Queue candidate if remoteDescription is not set
    if (!pc.remoteDescription) {
      console.log("[CALL][ICE_QUEUED]", { pendingCount: pendingIceCandidatesRef.current.length + 1 });
      pendingIceCandidatesRef.current.push(candidate);
      return;
    }

    try {
      await pc.addIceCandidate(candidate);
      console.log("[CALL][ICE_PROCESSED]", { callId: currentCallId, sessionToken });
    } catch (e) {
      console.error("Erreur ICE (sortant):", e);
    }
  };

  const handleEnd = ({ callId: eventCallId }: { callId?: string }) => {
    const sessionToken = sessionTokenRef.current;
    const currentCallId = callIdRef.current;

    if (eventCallId && eventCallId !== currentCallId) {
      console.log("[CALL][IGNORE_FOREIGN_EVENT]", { event: "call:end", eventCallId, currentCallId });
      return;
    }

    console.log("[CALL][END_RECEIVED]", { callId: currentCallId, sessionToken });
    cleanup(sessionToken || undefined);
    onClose();
  };

  const acceptIncomingCall = async (sessionToken: string) => {
    try {
      // Vérifier sessionToken avant toute opération
      if (sessionTokenRef.current !== sessionToken) {
        console.warn("[CALL][STALE_SESSION_IGNORED]", {
          sessionToken,
          activeSessionToken: sessionTokenRef.current,
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      
      // Vérifier sessionToken après getUserMedia
      if (sessionTokenRef.current !== sessionToken) {
        console.warn("[CALL][STALE_SESSION_IGNORED_AFTER_GETUSERMEDIA]", {
          sessionToken,
          activeSessionToken: sessionTokenRef.current,
        });
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Protection contre double PeerConnection
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
        console.warn("[CALL][DUPLICATE_PC_BLOCKED]", { callId: callIdRef.current });
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      peerConnectionRef.current = pc;

      // Add monitoring logs
      pc.oniceconnectionstatechange = () => {
        console.log("[CALL][ICE_STATE]", {
          callId: callIdRef.current,
          state: pc.iceConnectionState,
        });
      };

      pc.onconnectionstatechange = () => {
        console.log("[CALL][CONNECTION_STATE]", {
          callId: callIdRef.current,
          state: pc.connectionState,
        });
      };

      pc.onsignalingstatechange = () => {
        console.log("[CALL][SIGNALING_STATE]", {
          callId: callIdRef.current,
          state: pc.signalingState,
        });
      };

      pc.onicegatheringstatechange = () => {
        console.log("[CALL][ICE_GATHERING]", {
          callId: callIdRef.current,
          state: pc.iceGatheringState,
        });
      };

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
        // Vérifier sessionToken avant setRemoteDescription
        if (sessionTokenRef.current !== sessionToken) {
          console.warn("[CALL][STALE_SESSION_IGNORED_BEFORE_REMOTE_DESC]", {
            sessionToken,
            activeSessionToken: sessionTokenRef.current,
          });
          return;
        }

        await pc.setRemoteDescription(offer);
        
        // Process queued ICE candidates
        console.log("[CALL][PROCESSING_QUEUED_ICE]", { count: pendingIceCandidatesRef.current.length });
        for (const candidate of pendingIceCandidatesRef.current) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (e) {
            console.error("Erreur ICE (queued):", e);
          }
        }
        pendingIceCandidatesRef.current = [];
        
        // Vérifier sessionToken avant createAnswer
        if (sessionTokenRef.current !== sessionToken) {
          console.warn("[CALL][STALE_SESSION_IGNORED_BEFORE_ANSWER]", {
            sessionToken,
            activeSessionToken: sessionTokenRef.current,
          });
          return;
        }

        // Protection contre double answer
        if (offerCreatedCallIdRef.current === callIdRef.current) {
          console.warn("[CALL][DUPLICATE_ANSWER_BLOCKED]", { callId: callIdRef.current });
          return;
        }

        const answer = await pc.createAnswer();
        
        // Vérifier sessionToken après createAnswer
        if (sessionTokenRef.current !== sessionToken) {
          console.warn("[CALL][STALE_SESSION_IGNORED_AFTER_ANSWER]", {
            sessionToken,
            activeSessionToken: sessionTokenRef.current,
          });
          return;
        }

        offerCreatedCallIdRef.current = callIdRef.current;
        await pc.setLocalDescription(answer);

        console.log("[CALL][ANSWER_CREATED]", {
          callId: callIdRef.current,
          sessionToken,
        });

        socket.emit("call:answer", {
          callId: callIdRef.current,
          answer,
          recipientId: incomingCallData?.callerId,
        });

        console.log("[CALL][ANSWER][SENT]", {
          callId: callIdRef.current,
          sessionToken,
        });
      }

      // Stocker les handlers dans les refs pour cleanup
      handleAnswerRef.current = handleAnswer;
      handleIceRef.current = handleIce;
      handleEndRef.current = handleEnd;

      console.log("[CALL][LISTENER_ADD]", {
        event: "call:answer",
        callId: callIdRef.current,
        sessionToken,
      });
      socket.on("call:answer", handleAnswer);

      console.log("[CALL][LISTENER_ADD]", {
        event: "call:ice",
        callId: callIdRef.current,
        sessionToken,
      });
      socket.on("call:ice", handleIce);

      console.log("[CALL][LISTENER_ADD]", {
        event: "call:end",
        callId: callIdRef.current,
        sessionToken,
      });
      socket.on("call:end", handleEnd);

      setIsConnected(true);
    } catch (error) {
      console.error("Erreur démarrage appel entrant:", error);
      cleanup(sessionToken);
      onClose();
    }
  };

  const startCallDuration = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
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
    cleanup(sessionTokenRef.current || undefined);
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
                    {recipientName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">{recipientName ?? "Utilisateur"}</h3>
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
                          {recipientName?.[0]?.toUpperCase() ?? "?"}
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
                    {recipientName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              <h3 className="text-white text-2xl font-semibold mb-2">{recipientName ?? "Utilisateur"}</h3>
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
