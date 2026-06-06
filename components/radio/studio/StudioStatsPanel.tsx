"use client";

import { useState, useEffect } from "react";

interface StudioStatsPanelProps {
  radio?: any;
}

export default function StudioStatsPanel({ radio }: StudioStatsPanelProps) {
  const [stats, setStats] = useState({
    listeners: radio?.listenerCount || 0,
    peak: radio?.peakListeners || 0,
    duration: radio?.totalDuration || 0,
    countries: 12,
    chatRate: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((s) => ({
        ...s,
        listeners: Math.floor(Math.random() * 200) + 300,
        chatRate: Math.floor(Math.random() * 15) + 2,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function formatDuration(minutes: number) {
    const h = Math.floor(minutes / 60).toString().padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}h${m}m`;
  }

  return (
    <div className="space-y-3">
      {/* BIG NUMBERS */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-emerald-400">{stats.listeners}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Auditeurs</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-2xl font-bold text-yellow-400">{stats.peak}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Pic</div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">⏱ Durée totale</span>
          <span className="font-mono text-emerald-400">{formatDuration(stats.duration)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">🌍 Pays</span>
          <span className="font-mono text-emerald-400">{stats.countries}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">💬 Chat/min</span>
          <span className="font-mono text-emerald-400">{stats.chatRate}</span>
        </div>
      </div>

      {/* MINI CHART */}
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Audience (5 min)</div>
        <div className="flex items-end gap-0.5 h-16">
          {[40, 55, 45, 70, 60, 80, 75, 90, 65, 85, 95, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-emerald-500/40 rounded-t-sm hover:bg-emerald-500/70 transition"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
