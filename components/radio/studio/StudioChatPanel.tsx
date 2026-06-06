"use client";

import { useState, useEffect, useRef } from "react";
import { socket } from "@/lib/socket";

interface StudioChatPanelProps {
  radioId?: string;
}

export default function StudioChatPanel({ radioId }: StudioChatPanelProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!radioId) return;
    fetchMessages();
    socket.emit("radio:join", radioId);
    socket.on("radio:chat", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("radio:chat");
      socket.emit("radio:leave", radioId);
    };
  }, [radioId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    if (!radioId) return;
    const res = await fetch(`/api/radio/${radioId}/chat`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !radioId) return;
    const res = await fetch(`/api/radio/${radioId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    const data = await res.json();
    if (data.message) {
      setMessages((prev) => [...prev, data.message]);
      setInput("");
    }
  }

  async function deleteMessage(msgId: string) {
    if (!radioId) return;
    await fetch(`/api/radio/${radioId}/chat/${msgId}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  }

  async function pinMessage(msgId: string) {
    if (!radioId) return;
    await fetch(`/api/radio/${radioId}/chat/${msgId}/pin`, { method: "POST" });
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, isPinned: true } : m));
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-8">Aucun message encore</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`group relative p-2 rounded-lg text-xs ${msg.isPinned ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-gray-800/40"}`}>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-semibold text-emerald-400">{msg.user?.name || msg.name || "Anonyme"}</span>
              <span className="text-gray-600 text-[10px]">{new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
              {msg.isPinned && <span className="text-yellow-400 text-[10px]">📌</span>}
            </div>
            <div className="text-gray-300 leading-relaxed">{msg.content}</div>
            <div className="hidden group-hover:flex absolute top-1 right-1 gap-1">
              <button onClick={() => pinMessage(msg.id)} className="text-[10px] px-1 rounded bg-gray-700 text-yellow-400 hover:bg-gray-600">📌</button>
              <button onClick={() => deleteMessage(msg.id)} className="text-[10px] px-1 rounded bg-gray-700 text-red-400 hover:bg-gray-600">🗑</button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Modérer le chat..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        <button type="submit" className="px-3 py-2 bg-emerald-600 rounded-lg text-white text-sm hover:bg-emerald-700 transition">
          📤
        </button>
      </form>
    </div>
  );
}
