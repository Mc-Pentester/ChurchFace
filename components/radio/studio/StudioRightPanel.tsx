"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Pin, Trash2, UserX, ChevronDown, Headphones, TrendingUp, MessageCircle, Clock } from "lucide-react";
import { socket } from "@/lib/socket";

interface ChatMsg { id: string; name: string; content: string; createdAt: string; isPinned?: boolean; }

const DEMO_MSGS: ChatMsg[] = [
  { id: "1", name: "Marie", content: "Amen 🙏", createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: "2", name: "Jean-Baptiste", content: "Très belle émission ! Que Dieu vous bénisse.", createdAt: new Date(Date.now() - 240000).toISOString() },
  { id: "3", name: "Pauline", content: "Prière pour moi s'il vous plaît", createdAt: new Date(Date.now() - 180000).toISOString() },
  { id: "4", name: "Samuel", content: "Gloire à Dieu ! Alléluia 🙌", createdAt: new Date(Date.now() - 120000).toISOString() },
  { id: "5", name: "Sophie", content: "Je vous écoute depuis la Martinique 🇲🇶", createdAt: new Date(Date.now() - 60000).toISOString() },
  { id: "6", name: "David", content: "Soyez bénis pasteur", createdAt: new Date(Date.now() - 30000).toISOString() },
];

const COUNTRIES = [
  { name: "Côte d'Ivoire", pct: 38, color: "bg-violet-500" },
  { name: "France", pct: 22, color: "bg-blue-500" },
  { name: "Cameroun", pct: 12, color: "bg-emerald-500" },
  { name: "USA", pct: 8, color: "bg-orange-500" },
  { name: "Autres", pct: 20, color: "bg-gray-600" },
];

export default function StudioRightPanel({ radioId, radio }: { radioId?: string; radio?: any }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    if (!radioId) return;
    try {
      const res = await fetch(`/api/radio/${radioId}/chat`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) { console.error("Chat fetch error:", e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!radioId) return;
    fetchMessages();
    socket.emit("radio:join", radioId);
    socket.on("radio:chat", (msg: ChatMsg) => setMessages((prev) => [...prev, msg]));
    return () => { socket.off("radio:chat"); socket.emit("radio:leave", radioId); };
  }, [radioId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !radioId) return;
    try {
      const res = await fetch(`/api/radio/${radioId}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInput("");
      }
    } catch (e) { console.error("Chat send error:", e); }
  }

  async function deleteMessage(msgId: string) {
    if (!radioId) return;
    try {
      await fetch(`/api/radio/${radioId}/chat/${msgId}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (e) { console.error("Chat delete error:", e); }
  }

  async function pinMessage(msgId: string) {
    if (!radioId) return;
    try {
      const res = await fetch(`/api/radio/${radioId}/chat/${msgId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: true }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, isPinned: true } : m));
      }
    } catch (e) { console.error("Chat pin error:", e); }
  }

  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <aside className="w-80 bg-[#12121a] border-l border-[#252535] flex flex-col h-full shrink-0 overflow-hidden">
      {/* ── Chat Auditeurs ── */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-[#252535]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#252535]">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Chat Auditeurs</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-emerald-400 font-medium">En direct</span>
            <span className="text-[10px] text-gray-500 ml-1">{messages.length}</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`group relative p-2 rounded-lg text-xs ${msg.isPinned ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-[#1a1a25]"}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-5 h-5 rounded-full bg-violet-600/30 flex items-center justify-center text-[9px] text-violet-300 font-bold">{msg.name[0]}</div>
                <span className="font-semibold text-gray-300">{msg.name}</span>
                <span className="text-[9px] text-gray-600">{fmtTime(msg.createdAt)}</span>
                {msg.isPinned && <Pin size={10} className="text-yellow-500 ml-auto" />}
              </div>
              <div className="text-gray-400 leading-relaxed pl-6">{msg.content}</div>
              <div className="hidden group-hover:flex absolute top-1 right-1 gap-1">
                <button onClick={() => pinMessage(msg.id)} className="p-1 rounded bg-[#252535] text-yellow-400 hover:bg-[#353545] transition"><Pin size={10} /></button>
                <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded bg-[#252535] text-red-400 hover:bg-red-900/30 transition"><Trash2 size={10} /></button>
                <button className="p-1 rounded bg-[#252535] text-orange-400 hover:bg-orange-900/30 transition"><UserX size={10} /></button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={send} className="p-3 flex gap-2 border-t border-[#252535]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Envoyer un message..."
            className="flex-1 bg-[#1a1a25] border border-[#252535] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-600/50"
          />
          <button type="submit" className="px-3 py-2 bg-violet-600 rounded-lg text-white hover:bg-violet-500 transition">
            <Send size={14} />
          </button>
        </form>

        {/* Modération */}
        <div className="px-3 pb-2">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Modération Chat</h4>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 py-1 rounded transition hover:bg-emerald-500/20">
              <Pin size={10} /> Mettre en avant
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 py-1 rounded transition hover:bg-red-500/20">
              <Trash2 size={10} /> Supprimer
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/30 py-1 rounded transition hover:bg-orange-500/20">
              <UserX size={10} /> Bannir
            </button>
          </div>
        </div>
      </div>

      {/* ── Statistiques Live ── */}
      <div className="shrink-0 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statistiques Live</h3>
          <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition">
            Aujourd'hui <ChevronDown size={10} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1a1a25] rounded-lg p-2.5 border border-[#252535]">
            <div className="flex items-center gap-1 mb-1">
              <Headphones size={10} className="text-violet-400" />
              <span className="text-[9px] text-gray-500">Auditeurs</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-lg font-bold text-white">{radio?.listenerCount || 0}</span>
              <span className="text-[10px] text-emerald-400 mb-0.5">+12%</span>
            </div>
          </div>
          <div className="bg-[#1a1a25] rounded-lg p-2.5 border border-[#252535]">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={10} className="text-blue-400" />
              <span className="text-[9px] text-gray-500">Pic d'audience</span>
            </div>
            <div className="text-lg font-bold text-white">{radio?.peakListeners || 0}</div>
          </div>
          <div className="bg-[#1a1a25] rounded-lg p-2.5 border border-[#252535]">
            <div className="flex items-center gap-1 mb-1">
              <Clock size={10} className="text-orange-400" />
              <span className="text-[9px] text-gray-500">Durée du live</span>
            </div>
            <div className="text-lg font-bold text-white">{radio?.startedAt ? new Date(Date.now() - new Date(radio.startedAt).getTime()).toISOString().substr(11,8) : "00:00:00"}</div>
          </div>
          <div className="bg-[#1a1a25] rounded-lg p-2.5 border border-[#252535]">
            <div className="flex items-center gap-1 mb-1">
              <MessageCircle size={10} className="text-emerald-400" />
              <span className="text-[9px] text-gray-500">Interactions</span>
            </div>
            <div className="text-lg font-bold text-white">{messages.length}</div>
          </div>
        </div>

        {/* Top pays */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Top pays</h4>
          <div className="space-y-1.5">
            {COUNTRIES.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${c.color}`} />
                <span className="text-[10px] text-gray-400 w-24 truncate">{c.name}</span>
                <div className="flex-1 h-1.5 bg-[#1a1a25] rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
                <span className="text-[10px] text-gray-300 font-medium w-6 text-right">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini donut chart */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#252535" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="38, 100" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="22, 100" strokeDashoffset="-38" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="12, 100" strokeDashoffset="-60" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="8, 100" strokeDashoffset="-72" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4b5563" strokeWidth="3" strokeDasharray="20, 100" strokeDashoffset="-80" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-white">12</span>
              <span className="text-[7px] text-gray-500">Pays</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
