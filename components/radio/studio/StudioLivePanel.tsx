"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface StudioLivePanelProps {
  radio: any;
  onUpdate: (r: any) => void;
}

export default function StudioLivePanel({ radio, onUpdate }: StudioLivePanelProps) {
  const { data: session } = useSession();
  const [isLive, setIsLive] = useState(radio?.isLive || false);
  const [isAutoDJ, setIsAutoDJ] = useState(radio?.isAutoDJ || false);
  const [micActive, setMicActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showGoLiveConfirm, setShowGoLiveConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setIsLive(radio?.isLive || false);
    setIsAutoDJ(radio?.isAutoDJ || false);
  }, [radio]);

  useEffect(() => {
    if (isLive && !timerRef.current) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else if (!isLive && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLive]);

  function formatTime(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  async function toggleLive() {
    if (!isLive) {
      setShowGoLiveConfirm(true);
      return;
    }
    await updateRadio({ isLive: false, isAutoDJ: false, endedAt: new Date() });
    setIsLive(false);
    setMicActive(false);
  }

  async function confirmGoLive() {
    setShowGoLiveConfirm(false);
    await updateRadio({ isLive: true, isAutoDJ: false, startedAt: new Date() });
    setIsLive(true);
  }

  async function toggleAutoDJ() {
    const next = !isAutoDJ;
    await updateRadio({ isAutoDJ: next, isLive: next });
    setIsAutoDJ(next);
    setIsLive(next);
  }

  async function updateRadio(data: any) {
    if (!radio?.id) return;
    const res = await fetch(`/api/radio/${radio.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.radio) onUpdate(json.radio);
  }

  return (
    <div className="space-y-4">
      {/* STATUS */}
      <div className={`rounded-xl p-4 text-center transition ${isLive ? "bg-red-950/40" : "bg-gray-800/40"}`}>
        <div className={`text-4xl font-black mb-1 ${isLive ? "text-red-400" : "text-gray-500"}`}>
          {isLive ? "🔴 ON AIR" : "⚫ OFF AIR"}
        </div>
        <div className="text-2xl font-mono text-emerald-400">
          {formatTime(elapsed)}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {radio?.title || "ChurchFace Radio"}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-2 gap-2">
        {!isLive ? (
          <button
            onClick={() => setShowGoLiveConfirm(true)}
            className="col-span-2 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition flex items-center justify-center gap-2"
          >
            ▶ Démarrer le Direct
          </button>
        ) : (
          <>
            <button
              onClick={toggleLive}
              className="py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition flex items-center justify-center gap-2"
            >
              ⏹ Stop
            </button>
            <button
              onClick={() => setMicActive(!micActive)}
              className={`py-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${micActive ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            >
              🎤 Micro {micActive ? "ON" : "OFF"}
            </button>
          </>
        )}
        <button
          onClick={toggleAutoDJ}
          className={`col-span-2 py-2 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${isAutoDJ ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
        >
          🤖 AutoDJ {isAutoDJ ? "Actif" : "Inactif"}
        </button>
      </div>

      {/* SOURCES TABLE */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs">
              <th className="text-left px-3 py-2">Source</th>
              <th className="text-center px-2 py-2">ON</th>
              <th className="text-left px-2 py-2">Volume</th>
              <th className="text-center px-2 py-2">Mute</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Micro principal", key: "mic1", on: micActive, vol: 80 },
              { name: "Invité 1", key: "guest1", on: false, vol: 60 },
              { name: "Invité 2", key: "guest2", on: false, vol: 50 },
              { name: "Musique", key: "music", on: isAutoDJ, vol: 70 },
            ].map((src) => (
              <tr key={src.key} className="">
                <td className="px-3 py-2 text-gray-300 text-xs">{src.name}</td>
                <td className="px-2 py-2 text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto ${src.on ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-gray-600"}`} />
                </td>
                <td className="px-2 py-2">
                  <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${src.vol}%` }} />
                  </div>
                </td>
                <td className="px-2 py-2 text-center">
                  <button className="text-gray-500 hover:text-red-400 text-xs">🔇</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GO LIVE CONFIRM */}
      {showGoLiveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-400 mb-2">🔴 Go Live ?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Vous allez démarrer la diffusion en direct. Les auditeurs seront notifiés.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGoLiveConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmGoLive}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition"
              >
                ▶ Diffuser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
