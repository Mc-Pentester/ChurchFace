"use client";

import { useState } from "react";
import { X, Flame } from "lucide-react";
import { PRAYER_CATEGORIES } from "@/types/prayer";

interface Props {
  onSubmit: (data: { title: string; content: string; category: string; isUrgent: boolean }) => void;
  onClose: () => void;
}

export default function PrayerForm({ onSubmit, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("SANTE");
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await onSubmit({ title: title.trim(), content: content.trim(), category, isUrgent });
    setLoading(false);
    setTitle("");
    setContent("");
    setIsUrgent(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-bold text-gray-800">Nouvelle demande de prière</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Prière pour ma guérison"
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Partagez votre besoin en détail..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRAYER_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                    category === cat.key
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700 flex items-center gap-1">
              <Flame size={14} className="text-red-500" /> Marquer comme urgente
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? "Publication..." : "Publier ma demande"}
          </button>
        </form>
      </div>
    </div>
  );
}
