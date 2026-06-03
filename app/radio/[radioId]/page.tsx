"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { Radio as RadioIcon, Users, MessageSquare, X, Headphones } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  content: string;
  createdAt: string;
}

export default function RadioListenPage() {
  const params = useParams();
  const radioId = params.radioId as string;
  const { data: session } = useSession();

  const [radioInfo, setRadioInfo] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [listenerCount, setListenerCount] = useState(0);
  const [status, setStatus] = useState("Chargement...");
  const [audioPlaying, setAudioPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "Anonyme";
  const userId = (session?.user as any)?.id || "";

  // Fetch radio info
  useEffect(() => {
    if (!radioId) return;
    fetch(`/api/radio/${radioId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.radio) {
          setRadioInfo(data.radio);
          setIsLive(data.radio.isLive);
          setIsBroadcaster(data.radio.user?.id === userId);
        }
      })
      .catch(console.error);
  }, [radioId, userId]);

  // Chat scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Socket listeners
  useEffect(() => {
    if (!radioId) return;

    socket.emit("radio:join", radioId);

    const onChat = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    const onListenerJoined = () => setListenerCount((c) => c + 1);
    const onListenerLeft = () => setListenerCount((c) => Math.max(0, c - 1));

    const onOffer = async (payload: { offer: RTCSessionDescriptionInit; senderId: string }) => {
      if (isBroadcaster) return;
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

    socket.on("radio:chat", onChat);
    socket.on("radio:listener-joined", onListenerJoined);
    socket.on("radio:listener-left", onListenerLeft);
    socket.on("radio:offer", onOffer);
    socket.on("radio:answer", onAnswer);
    socket.on("radio:ice-candidate", onIceCandidate);

    return () => {
      socket.emit("radio:leave", radioId);
      socket.off("radio:chat", onChat);
      socket.off("radio:listener-joined", onListenerJoined);
      socket.off("radio:listener-left", onListenerLeft);
      socket.off("radio:offer", onOffer);
      socket.off("radio:answer", onAnswer);
      socket.off("radio:ice-candidate", onIceCandidate);
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [radioId, isBroadcaster]);

  // Broadcaster: start audio stream
  useEffect(() => {
    if (!isBroadcaster || !isLive || !radioId) return;

    const startBroadcast = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("radio:ice-candidate", {
              radioId,
              candidate: event.candidate,
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("radio:offer", { radioId, offer });
        setStatus("🎙️ En direct");
        setAudioPlaying(true);
      } catch (err) {
        console.error("Radio broadcast error:", err);
        setStatus("Erreur accès micro");
      }
    };

    startBroadcast();

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [isBroadcaster, isLive, radioId]);

  // Listener: receive audio stream
  const handleReceiveOffer = async (offer: RTCSessionDescriptionInit, senderId: string) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (audioRef.current && event.streams[0]) {
          audioRef.current.srcObject = event.streams[0];
          audioRef.current.play().catch(() => {});
          setAudioPlaying(true);
          setStatus("🔊 Connecté");
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
      setStatus("🔊 Connexion...");
    } catch (err) {
      console.error("Radio listener error:", err);
      setStatus("Erreur connexion");
    }
  };

  const sendChat = () => {
    if (!chatText.trim() || !radioId) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      user: userName,
      content: chatText,
      createdAt: new Date().toISOString(),
    };
    socket.emit("radio:chat", { radioId, msg });
    setChatMessages((prev) => [...prev, msg]);
    setChatText("");
  };

  const endRadio = async () => {
    if (!isBroadcaster) return;
    try {
      await fetch(`/api/radio/${radioId}`, { method: "PATCH" });
      setIsLive(false);
      setStatus("Radio terminée");
      setAudioPlaying(false);
    } catch (err) {
      console.error("End radio error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {isLive ? (
              <RadioIcon className="text-emerald-500 animate-pulse" size={20} />
            ) : (
              <RadioIcon className="text-gray-400" size={20} />
            )}
            {radioInfo?.title || "Radio"}
          </h1>
          <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
            <span>{radioInfo?.user?.name}</span>
            <span className="flex items-center gap-1">
              <Users size={14} />
              {listenerCount}
            </span>
            <span>{status}</span>
          </div>
        </div>
        {isBroadcaster && isLive && (
          <button
            onClick={endRadio}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            Arrêter la radio
          </button>
        )}
      </div>

      {/* Audio Player + Chat */}
      <div className="flex gap-4">
        {/* Audio Player */}
        <div className="flex-1 bg-gradient-to-br from-emerald-900 to-gray-900 rounded-2xl overflow-hidden relative p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Headphones size={64} className={isLive ? "text-emerald-400" : "text-gray-500"} />
          <div className="mt-4 text-white text-lg font-semibold">
            {radioInfo?.title || "Radio"}
          </div>
          <div className="text-emerald-300 text-sm mt-1">
            {isLive ? (isBroadcaster ? "Tu es en direct 🎙️" : "🔊 En écoute") : "Radio terminée"}
          </div>

          {isLive && !isBroadcaster && (
            <audio ref={audioRef} autoPlay className="mt-4 w-full max-w-md" controls />
          )}

          {!isLive && !isBroadcaster && (
            <div className="mt-4 text-gray-400 text-sm">Cette émission est terminée.</div>
          )}

          {isBroadcaster && isLive && (
            <div className="mt-4 flex items-center gap-2 text-emerald-300 text-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Micro actif — diffusion en cours
            </div>
          )}
        </div>

        {/* Chat */}
        {chatOpen && (
          <div className="w-80 bg-white rounded-2xl border flex flex-col h-[400px]">
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
                className="flex-1 p-2 bg-gray-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500 transition"
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
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition"
        >
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  );
}
