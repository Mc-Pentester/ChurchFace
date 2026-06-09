"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Settings, ChevronDown, Wifi } from "lucide-react";

export default function StudioHeader({ radio, isLive, elapsed }: { radio: any; isLive: boolean; elapsed: number }) {
  const listeners = radio?.listenerCount ?? 0;
  const waveformRef = useRef<HTMLDivElement>(null);

  const fmt = (n: number) => n.toString().padStart(2, "0");
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  return (
    <header className="h-14 bg-[#12121a] border-b border-[#252535] flex items-center justify-between px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-violet-400 leading-none">ChurchFace</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider leading-none mt-0.5">Radio Studio</span>
        </div>
      </div>

      {/* Center Info */}
      <div className="flex items-center gap-6">
        {/* ON AIR */}
        <div className={`px-3 py-1 rounded-md text-xs font-bold tracking-wide ${isLive ? "bg-red-600 text-white" : "bg-gray-700 text-gray-400"}`}>
          {isLive ? "ON AIR" : "OFF AIR"}
        </div>

        {/* Live dot + timer */}
        <div className="flex items-center gap-2">
          {isLive && <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>}
          <span className={`text-xs font-medium ${isLive ? "text-red-400" : "text-gray-500"}`}>EN DIRECT</span>
          <span className="text-sm font-mono text-gray-300">{`${fmt(h)}:${fmt(m)}:${fmt(s)}`}</span>
        </div>

        {/* Emission / Animateur */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-xs text-gray-300 font-medium">{radio?.title || "Émission en cours"}</span>
          <span className="text-[10px] text-gray-500">{radio?.user?.name ? `Animateur : ${radio.user.name}` : "Studio ChurchFace"}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Listeners */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Auditeurs en direct</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white leading-none">{listeners}</span>
              {isLive && <span className="text-[10px] text-emerald-400 font-medium">live</span>}
            </div>
          </div>
          <WaveformBars active={isLive} />
        </div>

        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-white transition">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
        </button>

        {/* Settings */}
        <button className="text-gray-400 hover:text-white transition">
          <Settings size={18} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white">A</div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs text-gray-300 font-medium">Admin</span>
            <span className="text-[10px] text-gray-500">Super Admin</span>
          </div>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}

function WaveformBars({ active }: { active: boolean }) {
  const [heights, setHeights] = useState<number[]>(Array.from({ length: 24 }, () => 20));
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setHeights(Array.from({ length: 24 }, () => 15 + Math.random() * 70));
    }, 120);
    return () => clearInterval(iv);
  }, [active]);

  return (
    <div className="flex items-end gap-[2px] h-5 w-16">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[2px] rounded-full ${active ? "bg-emerald-400" : "bg-gray-700"}`}
          style={{ height: `${h}%`, transition: "height 120ms ease" }}
        />
      ))}
    </div>
  );
}
