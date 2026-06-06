"use client";

import { useState } from "react";
import { X, Heart, BookOpen, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { PrayerRequestWithUser } from "@/types/prayer";

interface Props {
  prayer: PrayerRequestWithUser | null;
  onClose: () => void;
  onPray: (id: string) => void;
  onRespond: (id: string, content: string, type: string) => void;
  onVerse: (id: string, reference: string, text?: string) => void;
  onTestimony: (id: string, content: string) => void;
  hasPrayed: boolean;
}

export default function PrayerDetailModal({
  prayer,
  onClose,
  onPray,
  onRespond,
  onVerse,
  onTestimony,
  hasPrayed,
}: Props) {
  const [activeTab, setActiveTab] = useState<"responses" | "verses" | "testimony">("responses");
  const [input, setInput] = useState("");
  const [verseRef, setVerseRef] = useState("");
  const [verseText, setVerseText] = useState("");
  const [testimonyText, setTestimonyText] = useState("");

  if (!prayer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="font-bold text-gray-800 text-sm">{prayer.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Author & date */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
              {(prayer.user.name || "?")[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">{prayer.user.name || "Anonyme"}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-700 text-sm leading-relaxed">{prayer.content}</p>

          {/* Actions bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPray(prayer.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                hasPrayed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              🙏 Je prie
            </button>
            <button
              onClick={() => setActiveTab("responses")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
            >
              <MessageCircle size={16} /> Répondre
            </button>
            <button
              onClick={() => setActiveTab("verses")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
            >
              <BookOpen size={16} /> Verset
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b">
            {[
              { key: "responses" as const, label: `Réponses (${prayer._count?.responses || 0})` },
              { key: "verses" as const, label: `Versets (${prayer._count?.verses || 0})` },
              ...(prayer.isAnswered ? [{ key: "testimony" as const, label: "Témoignage" }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 text-sm font-medium transition border-b-2 ${
                  activeTab === tab.key
                    ? "border-emerald-500 text-emerald-700"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "responses" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Votre message d'encouragement..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim()) {
                      onRespond(prayer.id, input, "COMMENT");
                      setInput("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (input.trim()) {
                      onRespond(prayer.id, input, "COMMENT");
                      setInput("");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <Send size={16} />
                </button>
              </div>
              {(prayer.responses || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Soyez le premier à répondre.</p>
              ) : (
                (prayer.responses || []).map((r) => (
                  <div key={r.id} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
                      {(r.user.name || "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{r.user.name || "Anonyme"}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{r.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "verses" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  placeholder="Référence : Jean 3:16"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <textarea
                  value={verseText}
                  onChange={(e) => setVerseText(e.target.value)}
                  placeholder="Texte du verset (optionnel)"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <button
                  onClick={() => {
                    if (verseRef.trim()) {
                      onVerse(prayer.id, verseRef, verseText);
                      setVerseRef("");
                      setVerseText("");
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition"
                >
                  Envoyer le verset
                </button>
              </div>
              {(prayer.verses || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Aucun verset partagé.</p>
              ) : (
                (prayer.verses || []).map((v) => (
                  <div key={v.id} className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="font-bold text-sm text-amber-800">{v.reference}</p>
                    {v.text && <p className="text-sm text-gray-700 mt-1 italic">"{v.text}"</p>}
                    <p className="text-xs text-amber-600 mt-2">Partagé par {v.user.name || "Anonyme"}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "testimony" && prayer.testimony && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h4 className="font-bold text-sm text-emerald-800">Témoignage d'exaucement</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{prayer.testimony.content}</p>
              {prayer.testimony.imageUrl && (
                <img
                  src={prayer.testimony.imageUrl}
                  alt="Témoignage"
                  className="mt-3 rounded-xl max-h-48 object-cover w-full"
                />
              )}
              <p className="text-xs text-emerald-600 mt-2">
                Par {prayer.testimony.user.name || "Anonyme"} le{" "}
                {formatDistanceToNow(new Date(prayer.testimony.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
          )}

          {!prayer.isAnswered && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Cette prière a-t-elle été exaucée ?</p>
              <div className="flex gap-2">
                <textarea
                  value={testimonyText}
                  onChange={(e) => setTestimonyText(e.target.value)}
                  placeholder="Partagez votre témoignage..."
                  rows={2}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <button
                  onClick={() => {
                    if (testimonyText.trim()) {
                      onTestimony(prayer.id, testimonyText);
                      setTestimonyText("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
