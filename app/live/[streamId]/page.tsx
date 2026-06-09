"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { Radio, Users, MessageSquare, X } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  content: string;
  createdAt: string;
}

export default function LiveWatchPage() {
  const params = useParams();
  const streamId = params.streamId as string;
  const { data: session } = useSession();

  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [status, setStatus] = useState("Chargement...");

  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "Anonyme";
  const userId = (session?.user as any)?.id || "";

  // Fetch stream info
  useEffect(() => {
    if (!streamId) return;
    fetch(`/api/streams/${streamId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stream) {
          setStreamInfo(data.stream);
          setIsLive(data.stream.isLive);
          setIsBroadcaster(data.stream.user?.id === userId);
        }
      })
      .catch(console.error);
  }, [streamId, userId]);

  // Chat scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Socket listeners for chat & signaling
  useEffect(() => {
    if (!streamId) return;

    socket.emit("stream:join", streamId);

    const onChat = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    const onViewerJoined = () => {
      setViewerCount((c) => c + 1);
    };

    const onViewerLeft = () => {
      setViewerCount((c) => Math.max(0, c - 1));
    };

    const onOffer = async (payload: { offer: RTCSessionDescriptionInit; senderId: string }) => {
      if (isBroadcaster) return; // broadcaster ne reçoit pas d'offers
      await handleReceiveOffer(payload.offer, payload.senderId);
    };

    const onAnswer = async (payload: { answer: RTCSessionDescriptionInit; senderId: string }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
    };

    const onIceCandidate = async (payload: { candidate: RTCIceCandidateInit; senderId: string }) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
    };

    socket.on("stream:chat", onChat);
    socket.on("stream:viewer-joined", onViewerJoined);
    socket.on("stream:viewer-left", onViewerLeft);
    socket.on("stream:offer", onOffer);
    socket.on("stream:answer", onAnswer);
    socket.on("stream:ice-candidate", onIceCandidate);

    return () => {
      socket.emit("stream:leave", streamId);
      socket.off("stream:chat", onChat);
      socket.off("stream:viewer-joined", onViewerJoined);
      socket.off("stream:viewer-left", onViewerLeft);
      socket.off("stream:offer", onOffer);
      socket.off("stream:answer", onAnswer);
      socket.off("stream:ice-candidate", onIceCandidate);
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [streamId, isBroadcaster]);

  // Broadcaster: start streaming
  useEffect(() => {
    if (!isBroadcaster || !isLive || !streamId) return;

    const startBroadcast = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("stream:ice-candidate", {
              streamId,
              candidate: event.candidate,
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("stream:offer", { streamId, offer });
        setStatus("🔴 En direct");
      } catch (err) {
        console.error("Broadcast error:", err);
        setStatus("Erreur accès caméra");
      }
    };

    startBroadcast();

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
      if (localVideoRef.current?.srcObject) {
        (localVideoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, [isBroadcaster, isLive, streamId]);

  // Viewer: receive stream
  const handleReceiveOffer = async (offer: RTCSessionDescriptionInit, senderId: string) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("stream:ice-candidate", {
            streamId,
            candidate: event.candidate,
            target: senderId,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("stream:answer", { streamId, answer, target: senderId });
      setStatus("📺 Connecté");
    } catch (err) {
      console.error("Viewer error:", err);
      setStatus("Erreur connexion");
    }
  };

  const sendChat = () => {
    if (!chatText.trim() || !streamId) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: userName,
      content: chatText,
      createdAt: new Date().toISOString(),
    };
    socket.emit("stream:chat", { streamId, msg });
    setChatMessages((prev) => [...prev, msg]);
    setChatText("");
  };

  const endStream = async () => {
    if (!isBroadcaster) return;
    try {
      await fetch(`/api/streams/${streamId}`, { method: "PATCH" });
      setIsLive(false);
      setStatus("Live terminé");
    } catch (err) {
      console.error("End stream error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {isLive ? (
              <Radio className="text-red-500 animate-pulse" size={20} />
            ) : (
              <Radio className="text-gray-400" size={20} />
            )}
            {streamInfo?.title || "Live"}
          </h1>
          <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
            <span>{streamInfo?.user?.name}</span>
            <span className="flex items-center gap-1">
              <Users size={14} />
              {viewerCount}
            </span>
            <span>{status}</span>
          </div>
        </div>
        {isBroadcaster && isLive && (
          <button
            onClick={endStream}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            Arrêter le live
          </button>
        )}
      </div>

      {/* Video + Chat */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Video */}
        <div className="flex-1 bg-black rounded-2xl overflow-hidden relative aspect-video">
          {isBroadcaster ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          {!isLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
              Ce live est terminé.
            </div>
          )}
        </div>

        {/* Chat */}
        {chatOpen && (
          <div className="w-full lg:w-80 bg-white rounded-2xl border flex flex-col h-[400px] lg:h-[500px]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm flex items-center gap-2">
                <MessageSquare size={16} />
                Chat
              </span>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
              {chatMessages.map((m, i) => (
                <div key={m.id || i}>
                  <span className="font-semibold text-emerald-600 text-xs">{m.user}</span>
                  <div className="text-gray-700">{m.content}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Écrire dans le chat..."
                className="flex-1 p-2 bg-gray-100 rounded-xl outline-none text-base focus:ring-2 focus:ring-emerald-500 transition"
              />
              <button
                onClick={sendChat}
                disabled={!chatText.trim()}
                className="bg-emerald-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
              >
                Envoyer
              </button>
            </div>
          </div>
        )}
      </div>

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition"
        >
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  );
}
