"use client";

import { useState, useEffect } from "react";
import { X, Flame, ChevronDown } from "lucide-react";
import { PRAYER_CATEGORIES } from "@/types/prayer";
import type { PrayerContextType } from "@/types/prayer";

interface Props {
  onSubmit: (data: { title: string; content: string; category: string; isUrgent: boolean; contextType?: PrayerContextType; contextId?: string | null; prayerChainId?: string; prayerCampaignId?: string; prayerRoomId?: string | null }) => void;
  onClose: () => void;
  prayerChainId?: string;
  prayerCampaignId?: string;
  initialContext?: {
    type: PrayerContextType;
    id?: string;
  };
}

const CONTEXT_OPTIONS: { value: PrayerContextType; label: string }[] = [
  { value: "PERSONAL", label: "Ma demande personnelle" },
  { value: "CAMPAIGN", label: "Campagne de prière" },
  { value: "CHAIN", label: "Chaîne de prière" },
  { value: "ROOM", label: "Salle de prière" },
];

export default function PrayerForm({ onSubmit, onClose, prayerChainId, prayerCampaignId, initialContext }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("SANTE");
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Context state
  const [contextType, setContextType] = useState<PrayerContextType>("PERSONAL");
  const [contextId, setContextId] = useState<string | null>(null);
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load campaigns, chains, rooms for dropdowns
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [chains, setChains] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingContexts, setLoadingContexts] = useState(false);

  // Set initial context if provided
  useEffect(() => {
    if (initialContext) {
      setContextType(initialContext.type);
      setContextId(initialContext.id || null);
    }
  }, [initialContext]);

  // Fetch context options when context type changes
  useEffect(() => {
    const fetchContextOptions = async () => {
      if (contextType === "PERSONAL") {
        setCampaigns([]);
        setChains([]);
        setRooms([]);
        setContextId(null);
        return;
      }

      setLoadingContexts(true);
      try {
        if (contextType === "CAMPAIGN") {
          const res = await fetch("/api/prayers/campaigns");
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        } else if (contextType === "CHAIN") {
          const res = await fetch("/api/prayers/chain");
          const data = await res.json();
          setChains(data.chains || []);
        } else if (contextType === "ROOM") {
          const res = await fetch("/api/prayers/rooms");
          const data = await res.json();
          setRooms(data.rooms || []);
        }
      } catch (err) {
        console.error("Error fetching context options:", err);
      } finally {
        setLoadingContexts(false);
      }
    };

    fetchContextOptions();
  }, [contextType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return;

    // Validate context selection
    if (contextType === "CAMPAIGN" && !contextId) {
      setError("Veuillez sélectionner une campagne.");
      return;
    }
    if (contextType === "CHAIN" && !contextId) {
      setError("Veuillez sélectionner une chaîne.");
      return;
    }
    if (contextType === "ROOM" && !contextId) {
      setError("Veuillez sélectionner une salle.");
      return;
    }

    setLoading(true);

    // Map contextType to existing fields
    const submissionData: any = {
      title: title.trim(),
      content: content.trim(),
      category,
      isUrgent
    };

    if (contextType === "CAMPAIGN" && contextId) {
      submissionData.prayerCampaignId = contextId;
    } else if (contextType === "CHAIN" && contextId) {
      submissionData.prayerChainId = contextId;
    } else if (contextType === "ROOM" && contextId) {
      submissionData.prayerRoomId = contextId;
    }

    // Pass legacy props if provided for backward compatibility
    if (prayerChainId) submissionData.prayerChainId = prayerChainId;
    if (prayerCampaignId) submissionData.prayerCampaignId = prayerCampaignId;

    await onSubmit(submissionData);
    setLoading(false);
    setTitle("");
    setContent("");
    setIsUrgent(false);
    setContextType("PERSONAL");
    setContextId(null);
    setError(null);
  };

  const selectedContextLabel = CONTEXT_OPTIONS.find(c => c.value === contextType)?.label;

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
          {/* Context Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contexte</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowContextDropdown(!showContextDropdown)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <span className="text-sm text-gray-700">{selectedContextLabel}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showContextDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {CONTEXT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setContextType(option.value);
                        setContextId(null);
                        setShowContextDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition ${
                        contextType === option.value ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Context Selection */}
          {contextType === "CAMPAIGN" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campagne</label>
              {loadingContexts ? (
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Chargement...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Aucune campagne disponible
                </div>
              ) : (
                <select
                  value={contextId || ""}
                  onChange={(e) => setContextId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">Sélectionner une campagne</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {contextType === "CHAIN" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chaîne</label>
              {loadingContexts ? (
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Chargement...
                </div>
              ) : chains.length === 0 ? (
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Aucune chaîne disponible
                </div>
              ) : (
                <select
                  value={contextId || ""}
                  onChange={(e) => setContextId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">Sélectionner une chaîne</option>
                  {chains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {contextType === "ROOM" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
              {loadingContexts ? (
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Chargement...
                </div>
              ) : rooms.length === 0 ? (
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Aucune salle disponible
                </div>
              ) : (
                <select
                  value={contextId || ""}
                  onChange={(e) => setContextId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">Sélectionner une salle</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

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
