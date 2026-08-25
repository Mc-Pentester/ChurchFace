"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CreatePrayerChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    visibility: "PUBLIC" | "PRIVATE" | "CHURCH_MEMBERS";
    imageUrl?: string;
    prayerCampaignId?: string; // @deprecated: kept for backward compatibility
    campaignIds?: string[]; // New: multiple campaigns
  }) => void;
  availableCampaigns?: Array<{ id: string; title: string }>;
}

export function CreatePrayerChainModal({
  isOpen,
  onClose,
  onSubmit,
  availableCampaigns = [],
}: CreatePrayerChainModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE" | "CHURCH_MEMBERS">("PUBLIC");
  const [imageUrl, setImageUrl] = useState("");
  const [prayerCampaignId, setPrayerCampaignId] = useState(""); // @deprecated: kept for backward compatibility
  const [campaignIds, setCampaignIds] = useState<string[]>([]); // New: multiple campaigns
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = { title, description, visibility };
      if (imageUrl) data.imageUrl = imageUrl;
      // Support both old (single) and new (multiple) campaign selection
      if (prayerCampaignId) data.prayerCampaignId = prayerCampaignId; // @deprecated
      if (campaignIds.length > 0) data.campaignIds = campaignIds; // New
      await onSubmit(data);
      onClose();
      // Reset form
      setTitle("");
      setDescription("");
      setVisibility("PUBLIC");
      setImageUrl("");
      setPrayerCampaignId("");
      setCampaignIds([]);
    } catch (error) {
      console.error("Erreur création chaîne:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignToggle = (campaignId: string) => {
    setCampaignIds((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Créer une chaîne de prière</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Chaîne de prière quotidienne"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez l'objet de cette chaîne de prière..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilité *
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Privé</option>
              <option value="CHURCH_MEMBERS">Membres de l'église</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campagnes de prière mobilisées (optionnel)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {availableCampaigns.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune campagne disponible</p>
              ) : (
                availableCampaigns.map((campaign) => (
                  <label key={campaign.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaignIds.includes(campaign.id)}
                      onChange={() => handleCampaignToggle(campaign.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{campaign.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de l'image
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Création..." : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
