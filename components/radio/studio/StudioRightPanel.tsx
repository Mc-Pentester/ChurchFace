"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Clock,
  Headphones,
  MessageCircle,
  Pin,
  Send,
  Trash2,
  TrendingUp,
  UserX,
} from "lucide-react";
import { socket } from "@/lib/socket";

interface ChatMsg {
  id: string;
  name?: string | null;
  userId?: string | null;
  content: string;
  createdAt: string;
  isPinned?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  pinnedAt?: string | null;
  updatedAt?: string;
}

interface StudioRightPanelProps {
  radioId?: string;
  radio?: any;
  onStatsUpdate?: React.Dispatch<React.SetStateAction<any>>;
}

export default function StudioRightPanel({
  radioId,
  radio,
  onStatsUpdate,
}: StudioRightPanelProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    if (!radioId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/radio/${radioId}/chat`);

      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }

      const data = await res.json();

      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (error) {
      console.error("Chat fetch error:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!radioId) {
      return;
    }

    fetchMessages();

    socket.emit("studio:join", radioId);

    const handleChatMessage = (msg: ChatMsg) => {
      if (!msg?.id) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((message) => message.id === msg.id)) {
          return prev;
        }

        return [...prev, msg];
      });
    };

    const handleRadioStats = (stats: {
      listenerCount: number;
      peakListeners: number;
    }) => {
      onStatsUpdate?.((prev: any) =>
        prev
          ? {
              ...prev,
              ...stats,
            }
          : prev,
      );
    };

    socket.on("radio:chat", handleChatMessage);
    socket.on("radio:stats", handleRadioStats);

    return () => {
      socket.off("radio:chat", handleChatMessage);
      socket.off("radio:stats", handleRadioStats);
      socket.emit("studio:leave", radioId);
    };
  }, [radioId, onStatsUpdate]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const content = input.trim();

    if (!content || !radioId) {
      return;
    }

    try {
      const res = await fetch(`/api/radio/${radioId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.message) {
        setMessages((prev) => {
          if (prev.some((message) => message.id === data.message.id)) {
            return prev;
          }

          return [...prev, data.message];
        });

        setInput("");
      }
    } catch (error) {
      console.error("Chat send error:", error);
    }
  }

  async function deleteMessage(msgId: string) {
    if (!radioId || !msgId) {
      return;
    }

    try {
      const res = await fetch(`/api/radio/${radioId}/chat/${msgId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }

      setMessages((prev) =>
        prev.filter((message) => message.id !== msgId),
      );
    } catch (error) {
      console.error("Chat delete error:", error);
    }
  }

  async function pinMessage(msgId: string) {
    if (!radioId || !msgId) {
      return;
    }

    try {
      const res = await fetch(`/api/radio/${radioId}/chat/${msgId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinned: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.message) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === msgId
              ? {
                  ...message,
                  isPinned: true,
                }
              : message,
          ),
        );
      }
    } catch (error) {
      console.error("Chat pin error:", error);
    }
  }

  function getDisplayName(name?: string | null) {
    const displayName = name?.trim();

    return displayName || "Auditeur";
  }

  function getInitial(name?: string | null) {
    return getDisplayName(name).charAt(0).toUpperCase();
  }

  function fmtTime(dateString: string) {
    const parsedDate = new Date(dateString);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--:--";
    }

    return parsedDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDuration(startedAt?: string | null) {
    if (!startedAt || !radio?.isLive) {
      return "00:00:00";
    }

    const startTime = new Date(startedAt).getTime();

    if (Number.isNaN(startTime)) {
      return "00:00:00";
    }

    const elapsed = Math.max(0, Date.now() - startTime);

    const totalSeconds = Math.floor(elapsed / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  return (
    <aside className="w-80 bg-[#12121a] flex flex-col h-full shrink-0 overflow-hidden">
      {/* ── Chat Auditeurs ── */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-2.5">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Chat Auditeurs
          </h3>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

            <span className="text-[10px] text-emerald-400 font-medium">
              En direct
            </span>

            <span className="text-[10px] text-gray-500 ml-1">
              {messages.length}
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0"
        >
          {loading ? (
            <div className="text-center text-[10px] text-gray-600 py-4">
              Chargement du chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-[10px] text-gray-600 py-4">
              Aucun message pour le moment.
            </div>
          ) : (
            messages.map((msg) => {
              const displayName = getDisplayName(msg.name);
              const initial = getInitial(msg.name);

              return (
                <div
                  key={msg.id}
                  className={`group relative p-2 rounded-lg text-xs ${
                    msg.isPinned
                      ? "bg-yellow-500/10"
                      : "bg-[#1a1a25]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-5 h-5 rounded-full bg-violet-600/30 flex items-center justify-center text-[9px] text-violet-300 font-bold">
                      {initial}
                    </div>

                    <span className="font-semibold text-gray-300 truncate max-w-[110px]">
                      {displayName}
                    </span>

                    <span className="text-[9px] text-gray-600">
                      {fmtTime(msg.createdAt)}
                    </span>

                    {msg.isPinned && (
                      <Pin
                        size={10}
                        className="text-yellow-500 ml-auto"
                      />
                    )}
                  </div>

                  <div className="text-gray-400 leading-relaxed pl-6 break-words">
                    {msg.content}
                  </div>

                  <div className="hidden group-hover:flex absolute top-1 right-1 gap-1">
                    <button
                      type="button"
                      onClick={() => pinMessage(msg.id)}
                      className="p-1 rounded bg-[#252535] text-yellow-400 hover:bg-[#353545] transition"
                      title="Épingler"
                    >
                      <Pin size={10} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1 rounded bg-[#252535] text-red-400 hover:bg-red-900/30 transition"
                      title="Supprimer"
                    >
                      <Trash2 size={10} />
                    </button>

                    <button
                      type="button"
                      className="p-1 rounded bg-[#252535] text-orange-400 hover:bg-orange-900/30 transition"
                      title="Bannir"
                    >
                      <UserX size={10} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={send} className="p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Envoyer un message..."
            className="flex-1 bg-[#1a1a25] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
          />

          <button
            type="submit"
            className="px-3 py-2 bg-violet-600 rounded-lg text-white hover:bg-violet-500 transition"
          >
            <Send size={14} />
          </button>
        </form>

        {/* Modération */}
        <div className="px-3 pb-2">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Modération Chat
          </h4>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 py-1 rounded transition hover:bg-emerald-500/20"
            >
              <Pin size={10} />
              Mettre en avant
            </button>

            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1 text-[10px] text-red-400 bg-red-500/10 py-1 rounded transition hover:bg-red-500/20"
            >
              <Trash2 size={10} />
              Supprimer
            </button>

            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 py-1 rounded transition hover:bg-orange-500/20"
            >
              <UserX size={10} />
              Bannir
            </button>
          </div>
        </div>
      </div>

      {/* ── Statistiques Live ── */}
      <div className="shrink-0 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Statistiques Live
          </h3>

          <button
            type="button"
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition"
          >
            Aujourd'hui
            <ChevronDown size={10} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1a1a25] rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <Headphones
                size={10}
                className="text-violet-400"
              />

              <span className="text-[9px] text-gray-500">
                Auditeurs
              </span>
            </div>

            <div className="flex items-end gap-1">
              <span className="text-lg font-bold text-white">
                {radio?.listenerCount || 0}
              </span>
            </div>
          </div>

          <div className="bg-[#1a1a25] rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp
                size={10}
                className="text-blue-400"
              />

              <span className="text-[9px] text-gray-500">
                Pic d&apos;audience
              </span>
            </div>

            <div className="text-lg font-bold text-white">
              {radio?.peakListeners || 0}
            </div>
          </div>

          <div className="bg-[#1a1a25] rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <Clock
                size={10}
                className="text-orange-400"
              />

              <span className="text-[9px] text-gray-500">
                Durée du live
              </span>
            </div>

            <div className="text-lg font-bold text-white">
              {formatDuration(radio?.startedAt)}
            </div>
          </div>

          <div className="bg-[#1a1a25] rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <MessageCircle
                size={10}
                className="text-emerald-400"
              />

              <span className="text-[9px] text-gray-500">
                Interactions
              </span>
            </div>

            <div className="text-lg font-bold text-white">
              {messages.length}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-600 text-center">
          Les statistiques géographiques seront disponibles prochainement.
        </p>
      </div>
    </aside>
  );
}