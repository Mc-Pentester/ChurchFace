"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Headphones,
  X,
  Minimize2,
  Maximize2,
  Users,
  Radio as RadioIcon,
  MessageSquare,
  Send,
} from "lucide-react";
import { useRadioPlayer } from "@/contexts/RadioPlayerContext";
import { useRadioListener } from "@/hooks/useRadioListener";
import { socket } from "@/lib/socket";

interface ChatMessage {
  id: string;
  user: string;
  content: string;
}

function normalizeChatMessage(msg: Record<string, unknown>): ChatMessage {
  return {
    id: String(msg.id),
    user: String(msg.name || msg.user || "Anonyme"),
    content: String(msg.content || ""),
  };
}

export default function FloatingRadioPlayer() {
  const { radioId, isOpen, isMinimized, closeRadio, toggleMinimize } =
    useRadioPlayer();
  const { data: session } = useSession();
  const enabled = isOpen && Boolean(radioId);

  const {
    audioRef,
    radioInfo,
    isLive,
    listenerCount,
    status,
    audioPlaying,
    setAudioPlaying,
  } = useRadioListener(radioId, enabled);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");

  const userId = (session?.user as { id?: string })?.id;
  const isOwner = radioInfo?.user?.id === userId;

  useEffect(() => {
    if (!radioId || !enabled) {
      setChatMessages([]);
      setChatText("");
      setChatOpen(false);
    }
  }, [radioId, enabled]);

  useEffect(() => {
    if (!radioId || !enabled) return;
    fetch(`/api/radio/${radioId}/chat`)
      .then((res) => res.json())
      .then((data) =>
        setChatMessages((data.messages || []).map(normalizeChatMessage))
      )
      .catch(console.error);
  }, [radioId, enabled]);

  useEffect(() => {
    if (!radioId || !enabled) return;

    const onChat = (msg: Record<string, unknown>) => {
      const normalized = normalizeChatMessage(msg);
      setChatMessages((prev) =>
        prev.some((m) => m.id === normalized.id)
          ? prev
          : [...prev, normalized]
      );
    };

    socket.on("radio:chat", onChat);
    return () => {
      socket.off("radio:chat", onChat);
    };
  }, [radioId, enabled]);

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatText.trim() || !radioId) return;
    const content = chatText.trim();
    setChatText("");
    try {
      const res = await fetch(`/api/radio/${radioId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.message) {
        const normalized = normalizeChatMessage(data.message);
        setChatMessages((prev) =>
          prev.some((m) => m.id === normalized.id)
            ? prev
            : [...prev, normalized]
        );
      }
    } catch (err) {
      console.error(err);
      setChatText(content);
    }
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(console.error);
      setAudioPlaying(true);
    } else {
      audio.pause();
      setAudioPlaying(false);
    }
  }

  if (!isOpen || !radioId) return null;

  const title = radioInfo?.title || "Radio ChurchFace";

  return (
  <>
    <audio ref={audioRef} autoPlay playsInline className="hidden" />

    {isMinimized ? (
      <div className="fixed bottom-24 lg:bottom-6 right-4 z-50">
        <button
          onClick={toggleMinimize}
          className="flex items-center gap-2 bg-gray-900 text-white pl-3 pr-2 py-2 rounded-full shadow-2xl border border-emerald-500/40 hover:border-emerald-400 transition max-w-[260px]"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${isLive ? "bg-red-500 animate-pulse" : "bg-gray-500"}`}
          />
          <Headphones size={14} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium truncate">{title}</span>
          <Maximize2 size={14} className="text-gray-400 shrink-0 ml-1" />
        </button>
      </div>
    ) : (
    <div className="fixed bottom-24 lg:bottom-6 right-4 z-50 w-[min(100vw-2rem,380px)]">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950 rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isLive ? "bg-red-500/20" : "bg-white/10"}`}
          >
            <RadioIcon
              size={18}
              className={isLive ? "text-red-400 animate-pulse" : "text-gray-400"}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {title}
            </div>
            <div className="text-[10px] text-emerald-300/80 truncate">
              {radioInfo?.user?.name || "ChurchFace Radio"} · {status}
            </div>
          </div>
          <button
            onClick={toggleMinimize}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Réduire"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={closeRadio}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Player body */}
        <div className="px-4 py-4">
          {isOwner && isLive && (
            <a
              href="/admin/studio"
              className="block text-center text-[10px] text-violet-300 hover:text-violet-200 mb-3 underline"
            >
              Diffuser depuis le studio
            </a>
          )}

          <div className="flex items-center justify-center gap-1 h-10 mb-3">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isLive && audioPlaying
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-white/20"
                }`}
                style={{
                  height: isLive && audioPlaying ? `${30 + (i % 5) * 12}%` : "20%",
                  animationDelay: `${i * 40}ms`,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {listenerCount} auditeur{listenerCount !== 1 ? "s" : ""}
            </span>
            <span
              className={`font-bold uppercase text-[10px] ${isLive ? "text-red-400" : "text-gray-500"}`}
            >
              {isLive ? "ON AIR" : "OFF"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={!isLive}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Headphones size={16} />
              {audioPlaying ? "Pause" : "Écouter"}
            </button>
            <button
              onClick={() => setChatOpen((v) => !v)}
              className={`p-2.5 rounded-xl border transition ${
                chatOpen
                  ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
              title="Chat"
            >
              <MessageSquare size={16} />
            </button>
          </div>
        </div>

        {/* Chat */}
        {chatOpen && (
          <div className="border-t border-white/10 bg-black/30">
            <div className="max-h-36 overflow-y-auto px-3 py-2 space-y-1.5">
              {chatMessages.length === 0 && (
                <p className="text-[10px] text-gray-500 text-center py-2">
                  Aucun message
                </p>
              )}
              {chatMessages.slice(-30).map((m) => (
                <div key={m.id} className="text-[11px]">
                  <span className="font-semibold text-emerald-400">
                    {m.user}
                  </span>
                  <span className="text-gray-300 ml-1">{m.content}</span>
                </div>
              ))}
            </div>
            <form
              onSubmit={sendChat}
              className="flex gap-2 p-2 border-t border-white/10"
            >
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
              />
              <button
                type="submit"
                disabled={!chatText.trim()}
                className="p-2 bg-emerald-600 disabled:bg-gray-700 rounded-lg text-white transition"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
    )}
  </>
  );
}
