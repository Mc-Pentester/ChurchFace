/**
 * Composant d'interface pendant un live mobile
 * ChurchFace V1 - Live Mobile Instantané
 * Interface optimisée pour mobile et utilisation à une main
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  FlipHorizontal, 
  X, 
  PhoneOff,
  MessageCircle,
  Heart,
  Users,
  Clock,
  Wifi,
  Signal,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useMobileLive } from "@/hooks/useMobileLive";
import { MobileLiveSession, MobileLiveCamera } from "@/lib/mobilelive/MobileLiveTypes";
import { Room, RoomEvent, Track } from "livekit-client";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";

interface MobileLiveInterfaceProps {
  sessionId: string;
  session: MobileLiveSession;
  onEnd: () => void;
}

export default function MobileLiveInterface({
  sessionId,
  session,
  onEnd,
}: MobileLiveInterfaceProps) {
  const { stopLive, updateStats, isLoading } = useMobileLive();
  const { data: sessionData } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const roomRef = useRef<Room | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [currentCamera, setCurrentCamera] = useState<MobileLiveCamera>("front");
  const [duration, setDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(session.viewerCount);
  const [networkQuality, setNetworkQuality] = useState<"EXCELLENT" | "GOOD" | "POOR" | "DISCONNECTED">("GOOD");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; userId: string; userName: string; userAvatar?: string; message: string; timestamp: Date }>>([]);
  const [newComment, setNewComment] = useState("");
  const [reactions, setReactions] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Connecter à LiveKit
  useEffect(() => {
    const connectToLiveKit = async () => {
      try {
        // Obtenir le token LiveKit
        const tokenResponse = await fetch(`/api/mobilelive/session/${sessionId}/livekit-token`, {
          method: "POST",
        });

        if (!tokenResponse.ok) {
          console.error("Failed to get LiveKit token");
          setIsConnecting(false);
          return;
        }

        const { url, token, roomName } = await tokenResponse.json();

        // Créer et connecter la room LiveKit
        const room = new Room();
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Video && videoRef.current) {
            const videoElement = videoRef.current;
            track.attach(videoElement);
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log("Disconnected from LiveKit");
          setIsConnecting(false);
        });

        await room.connect(url, token);
        setIsConnecting(false);

        // Publier le stream local
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentCamera === "front" ? "user" : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: microphoneEnabled,
        });

        streamRef.current = localStream;

        // Configurer l'analyseur audio pour le niveau
        if (microphoneEnabled && localStream.getAudioTracks().length > 0) {
          const audioContext = new AudioContext();
          audioContextRef.current = audioContext;
          const analyser = audioContext.createAnalyser();
          analyserRef.current = analyser;
          const source = audioContext.createMediaStreamSource(localStream);
          source.connect(analyser);
          analyser.fftSize = 256;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average);
            requestAnimationFrame(updateAudioLevel);
          };
          updateAudioLevel();
        }

        await room.localParticipant.publishTrack(localStream.getVideoTracks()[0]);
        await room.localParticipant.publishTrack(localStream.getAudioTracks()[0]);

      } catch (error) {
        console.error("Error connecting to LiveKit:", error);
        setIsConnecting(false);
      }
    };

    connectToLiveKit();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId, currentCamera, microphoneEnabled]);

  // Connecter au chat Socket.io
  useEffect(() => {
    if (!sessionData?.user) return;

    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setIsChatConnected(true);
      socket.emit("stream:join", sessionId);
    };

    const handleDisconnect = () => {
      setIsChatConnected(false);
    };

    const handleChatMessage = (message: any) => {
      setComments((prev) => [...prev, {
        id: message.id,
        userId: message.userId,
        userName: message.userName,
        userAvatar: message.userAvatar,
        message: message.message,
        timestamp: new Date(message.timestamp),
      }]);
    };

    const handleViewerCount = (count: number) => {
      setViewerCount(count);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat:message", handleChatMessage);
    socket.on("stream:viewerCount", handleViewerCount);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat:message", handleChatMessage);
      socket.off("stream:viewerCount", handleViewerCount);
    };
  }, [sessionId, sessionData?.user]);

  // Timer pour la durée
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Remplacer la simulation par WebSocket réel
  // Le viewer count est maintenant mis à jour via Socket.io (handleViewerCount)

  // Mettre à jour les statistiques périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      updateStats(sessionId, { viewerCount });
    }, 10000);
    return () => clearInterval(interval);
  }, [sessionId, viewerCount, updateStats]);

  // Formatage de la durée
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Basculer caméra
  const toggleCamera = () => {
    setCurrentCamera(prev => prev === "front" ? "back" : "front");
  };

  const toggleCameraEnabled = () => {
    setCameraEnabled(prev => !prev);
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled;
      }
    }
  };

  const toggleMicrophone = () => {
    setMicrophoneEnabled(prev => !prev);
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !microphoneEnabled;
      }
    }
  };

  const handleStopLive = async () => {
    if (confirm("Voulez-vous vraiment arrêter le direct ?")) {
      await stopLive(sessionId);
      onEnd();
    }
  };

  const handleSendComment = () => {
    if (newComment.trim() && sessionData?.user) {
      const message = {
        id: Date.now().toString(),
        userId: sessionData.user.id,
        userName: sessionData.user.name || "Vous",
        userAvatar: sessionData.user.image || undefined,
        message: newComment.trim(),
        timestamp: new Date(),
      };
      
      setComments(prev => [...prev, message]);
      
      // Envoyer via Socket.io
      if (socketRef.current) {
        socketRef.current.emit("chat:message", {
          broadcastId: sessionId,
          ...message,
        });
      }
      
      setNewComment("");
    }
  };

  const handleReaction = (emoji: string = "❤️") => {
    setReactions(prev => prev + 1);
    
    // Envoyer la réaction via Socket.io
    if (socketRef.current) {
      socketRef.current.emit("stream:reaction", {
        broadcastId: sessionId,
        emoji,
        userId: sessionData?.user?.id,
      });
    }
    
    // Animation temporaire
    setTimeout(() => setReactions(prev => Math.max(0, prev - 1)), 2000);
  };

  const getNetworkQualityColor = () => {
    switch (networkQuality) {
      case "EXCELLENT": return "text-green-500";
      case "GOOD": return "text-yellow-500";
      case "POOR": return "text-orange-500";
      case "DISCONNECTED": return "text-red-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Preview */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!cameraEnabled ? 'hidden' : ''}`}
        />
        
        {!cameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <CameraOff className="w-16 h-16 text-gray-600" />
          </div>
        )}

        {/* Top Stats Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* LIVE Badge */}
              <div className="bg-red-600 px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold">EN DIRECT</span>
              </div>
              
              {/* Viewer Count */}
              <div className="flex items-center gap-1 text-white">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{viewerCount}</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1 text-white">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-mono">{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Network Quality */}
            <div className={`flex items-center gap-1 ${getNetworkQualityColor()}`}>
              <Signal className="w-4 h-4" />
              <span className="text-xs font-medium">{networkQuality}</span>
            </div>

            {/* Audio Level */}
            {microphoneEnabled && (
              <div className="flex items-center gap-1">
                <Mic className="w-4 h-4 text-white" />
                <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-100"
                    style={{ width: `${Math.min(100, (audioLevel / 255) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reactions Overlay */}
        {reactions > 0 && (
          <div className="absolute top-20 right-4">
            <div className="flex items-center gap-1 bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-full">
              <Heart className="w-4 h-4 text-white fill-white" />
              <span className="text-white text-sm font-medium">{reactions}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-gradient-to-t from-black/90 to-transparent p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCameraEnabled}
              className={`p-3 rounded-full transition ${
                cameraEnabled 
                  ? "bg-white/20 backdrop-blur-sm text-white" 
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {cameraEnabled ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleCamera}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white transition hover:bg-white/30"
            >
              <FlipHorizontal className="w-6 h-6" />
            </button>

            <button
              onClick={toggleMicrophone}
              className={`p-3 rounded-full transition ${
                microphoneEnabled 
                  ? "bg-white/20 backdrop-blur-sm text-white" 
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {microphoneEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
          </div>

          {/* Center - Stop Button */}
          <button
            onClick={handleStopLive}
            disabled={isLoading}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PhoneOff className="w-6 h-6" />
            )}
          </button>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleReaction("❤️")}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white transition hover:bg-white/30"
            >
              <Heart className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-3 rounded-full transition ${
                showComments 
                  ? "bg-emerald-500 text-white" 
                  : "bg-white/20 backdrop-blur-sm text-white"
              }`}
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Comments Panel */}
        {showComments && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-h-48 overflow-y-auto">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{comment.userName}</span>
                      <span className="text-white/50 text-xs">
                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm">{comment.message}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-white/50 text-sm text-center py-4">
                  Aucun commentaire pour le moment
                </p>
              )}
            </div>

            {/* Comment Input */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendComment}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white transition"
              >
                Envoyer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
