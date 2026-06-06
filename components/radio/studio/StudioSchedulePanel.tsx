"use client";

import { useState, useEffect } from "react";

interface StudioSchedulePanelProps {
  radioId?: string;
}

export default function StudioSchedulePanel({ radioId }: StudioSchedulePanelProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", hostName: "", startTime: "", duration: 60 });

  useEffect(() => {
    if (!radioId) return;
    fetchSchedules();
  }, [radioId]);

  async function fetchSchedules() {
    if (!radioId) return;
    const res = await fetch(`/api/radio/${radioId}/schedules`);
    const data = await res.json();
    setSchedules(data.schedules || []);
  }

  async function createSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!radioId || !form.title || !form.startTime) return;
    const res = await fetch(`/api/radio/${radioId}/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        startTime: new Date(form.startTime).toISOString(),
      }),
    });
    const data = await res.json();
    if (data.schedule) {
      setSchedules((prev) => [...prev, data.schedule]);
      setShowForm(false);
      setForm({ title: "", description: "", hostName: "", startTime: "", duration: 60 });
    }
  }

  async function deleteSchedule(id: string) {
    if (!radioId) return;
    await fetch(`/api/radio/${radioId}/schedules/${id}`, { method: "DELETE" });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  function isUpcoming(startTime: string) {
    return new Date(startTime) > new Date();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Émissions programmées</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          + Nouvelle
        </button>
      </div>

      {showForm && (
        <form onSubmit={createSchedule} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 space-y-2">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nom de l'émission"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            value={form.hostName}
            onChange={(e) => setForm({ ...form, hostName: e.target.value })}
            placeholder="Animateur"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })}
              placeholder="Min"
              className="w-20 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-1.5 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition">Annuler</button>
            <button type="submit" className="flex-1 py-1.5 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition">Créer</button>
          </div>
        </form>
      )}

      <div className="space-y-1 max-h-48 overflow-auto">
        {schedules.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">Aucune émission programmée</div>
        )}
        {schedules.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm border transition ${isUpcoming(s.startTime) ? "bg-gray-800/40 border-gray-700/30" : "bg-gray-800/20 border-gray-800/30 opacity-60"}`}
          >
            <div className={`w-2 h-2 rounded-full ${isUpcoming(s.startTime) ? "bg-emerald-500" : "bg-gray-600"}`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-300 truncate">{s.title}</div>
              <div className="text-[10px] text-gray-500">
                {s.hostName && <span className="text-gray-400">{s.hostName} · </span>}
                {new Date(s.startTime).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                {s.duration && <span> · {s.duration}min</span>}
              </div>
            </div>
            <button onClick={() => deleteSchedule(s.id)} className="text-gray-500 hover:text-red-400 text-xs">🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}
