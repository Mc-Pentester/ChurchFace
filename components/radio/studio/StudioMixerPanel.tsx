"use client";

import { useState, useEffect, useRef } from "react";

interface Channel {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  peak: number;
}

export default function StudioMixerPanel() {
  const [channels, setChannels] = useState<Channel[]>([
    { id: "mic1", name: "MIC 1", volume: 80, pan: 0, muted: false, solo: false, peak: 0 },
    { id: "mic2", name: "MIC 2", volume: 60, pan: 0, muted: false, solo: false, peak: 0 },
    { id: "music", name: "MUSIC", volume: 70, pan: 0, muted: false, solo: false, peak: 0 },
    { id: "jingle", name: "JINGLE", volume: 50, pan: 0, muted: false, solo: false, peak: 0 },
  ]);
  const [masterVolume, setMasterVolume] = useState(85);

  useEffect(() => {
    const interval = setInterval(() => {
      setChannels((prev) =>
        prev.map((ch) => ({
          ...ch,
          peak: ch.muted ? 0 : Math.max(0, Math.min(100, ch.volume + (Math.random() * 20 - 10))),
        }))
      );
    }, 200);
    return () => clearInterval(interval);
  }, []);

  function updateChannel(id: string, updates: Partial<Channel>) {
    setChannels((prev) => prev.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch)));
  }

  return (
    <div className="space-y-3">
      {/* CHANNELS */}
      <div className="grid grid-cols-4 gap-2">
        {channels.map((ch) => (
          <div key={ch.id} className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50 flex flex-col items-center">
            {/* VU METER */}
            <div className="w-3 h-20 bg-gray-900 rounded-full relative mb-2 overflow-hidden">
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-100 ${ch.peak > 80 ? "bg-red-500" : ch.peak > 50 ? "bg-yellow-400" : "bg-emerald-500"}`}
                style={{ height: `${ch.peak}%` }}
              />
            </div>

            {/* LABEL */}
            <span className="text-[10px] font-bold text-gray-400 mb-1">{ch.name}</span>

            {/* SLIDER */}
            <input
              type="range"
              min="0"
              max="100"
              value={ch.volume}
              onChange={(e) => updateChannel(ch.id, { volume: parseInt(e.target.value) })}
              className="w-full h-1 mb-2 accent-emerald-500"
            />

            {/* BUTTONS */}
            <div className="flex gap-1">
              <button
                onClick={() => updateChannel(ch.id, { muted: !ch.muted })}
                className={`text-[10px] px-1.5 py-0.5 rounded transition ${ch.muted ? "bg-red-600 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}
              >
                M
              </button>
              <button
                onClick={() => updateChannel(ch.id, { solo: !ch.solo })}
                className={`text-[10px] px-1.5 py-0.5 rounded transition ${ch.solo ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}
              >
                S
              </button>
            </div>

            {/* PAN */}
            <div className="flex items-center gap-1 mt-1 w-full">
              <span className="text-[8px] text-gray-600">L</span>
              <input
                type="range"
                min="-50"
                max="50"
                value={ch.pan}
                onChange={(e) => updateChannel(ch.id, { pan: parseInt(e.target.value) })}
                className="flex-1 h-0.5 accent-emerald-500"
              />
              <span className="text-[8px] text-gray-600">R</span>
            </div>
          </div>
        ))}
      </div>

      {/* MASTER */}
      <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-300">MASTER</span>
          <span className="text-xs font-mono text-emerald-400">{masterVolume}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full">
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseInt(e.target.value))}
              className="w-full h-2 accent-emerald-500"
            />
          </div>
          <div className="w-4 h-12 bg-gray-800 rounded-full relative overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-full transition-all"
              style={{ height: `${masterVolume}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
