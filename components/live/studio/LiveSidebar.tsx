"use client";

import {
  LayoutDashboard, Video, Calendar, Library, ListMusic, Users, Mic, Bot, Globe, FileText, Shield, AlertTriangle, MessageSquare, Settings, MonitorSpeaker
} from "lucide-react";

interface Props {
  activeView: string;
  setActiveView: (v: string) => void;
}

const liveItems = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { key: "live", label: "Studio Live", icon: Video },
  { key: "schedule", label: "Programmation", icon: Calendar },
  { key: "library", label: "Bibliothèque", icon: Library },
  { key: "playlists", label: "Playlists", icon: ListMusic },
  { key: "guests", label: "Intervenants", icon: Users },
  { key: "autodj", label: "AutoDJ", icon: Bot },
  { key: "external", label: "Diffusions externes", icon: Globe },
  { key: "settings", label: "Paramètres", icon: Settings },
  { key: "logs", label: "Logs & Rapports", icon: FileText },
];

const modItems = [
  { key: "reports", label: "Signalements", icon: AlertTriangle, count: 12 },
  { key: "posts", label: "Posts", icon: FileText, count: 5 },
  { key: "comments", label: "Commentaires", icon: MessageSquare, count: 3 },
  { key: "users", label: "Utilisateurs", icon: Users, count: 1 },
  { key: "stories", label: "Stories", icon: MonitorSpeaker },
  { key: "adminlogs", label: "Logs Admin", icon: Shield },
];

export default function LiveSidebar({ activeView, setActiveView }: Props) {
  return (
    <aside className="w-56 bg-[#12121a] flex flex-col h-full shrink-0 overflow-y-auto">
      {/* Section Studio Live */}
      <div className="px-4 py-3">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Studio Live</h3>
        <nav className="space-y-0.5">
          {liveItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                  active
                    ? "bg-violet-600/15 text-violet-300"
                    : "text-gray-400 hover:bg-[#1e1e2d] hover:text-gray-200"
                }`}
              >
                <Icon size={14} className={active ? "text-violet-400" : "text-gray-500"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mx-4 h-px bg-[#252535]" />

      {/* Section Modération */}
      <div className="px-4 py-3">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Modération</h3>
        <nav className="space-y-0.5">
          {modItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                  active
                    ? "bg-violet-600/15 text-violet-300"
                    : "text-gray-400 hover:bg-[#1e1e2d] hover:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={active ? "text-violet-400" : "text-gray-500"} />
                  <span>{item.label}</span>
                </div>
                {item.count ? (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">{item.count}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom mini profile */}
      <div className="mt-auto p-3">
        <div className="flex items-center gap-2 bg-[#1a1a25] rounded-lg p-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face" alt="Host" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400">On Air Now</span>
            <span className="text-[11px] text-white font-medium leading-tight">Charles Dalle</span>
            <span className="text-[9px] text-gray-500">Live Streaming</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
