"use client";

import { useState, useEffect } from "react";
import { PrayerCampaign } from "@/types/prayer";
import { PrayerCampaignCard } from "@/components/prayer/campaigns/PrayerCampaignCard";
import { CreatePrayerCampaignModal } from "@/components/prayer/modals/CreatePrayerCampaignModal";
import { Plus, Filter } from "lucide-react";
import { useRevalidateOnMount } from "@/hooks/useRevalidateOnMount";

export default function PrayerCampaignsPage() {
  // Revalider les données quand le composant est monté (navigation arrière)
  useRevalidateOnMount();

  const [campaigns, setCampaigns] = useState<PrayerCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ENDED">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [filter, typeFilter]);

  // Écouter l'événement de revalidation (navigation arrière)
  useEffect(() => {
    const handleRevalidate = () => {
      fetchCampaigns();
    };

    window.addEventListener('revalidate-data', handleRevalidate);

    return () => {
      window.removeEventListener('revalidate-data', handleRevalidate);
    };
  }, [filter, typeFilter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prayers/campaigns");
      const data = await res.json();
      
      let filteredCampaigns = data || [];
      if (filter === "ACTIVE") {
        filteredCampaigns = filteredCampaigns.filter((c: PrayerCampaign) => c.isActive);
      } else if (filter === "ENDED") {
        filteredCampaigns = filteredCampaigns.filter((c: PrayerCampaign) => !c.isActive);
      }
      if (typeFilter !== "ALL") {
        filteredCampaigns = filteredCampaigns.filter((c: PrayerCampaign) => c.type === typeFilter);
      }
      
      setCampaigns(filteredCampaigns);
    } catch (error) {
      console.error("Erreur récupération campagnes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (campaignId: string) => {
    window.location.href = `/prayers/campaigns/${campaignId}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Campagnes de prière</h1>
          <p className="text-gray-600 mt-1">Participez à des campagnes d'intercession organisées</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          Créer une campagne
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "ALL"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter("ACTIVE")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Actives
              </button>
              <button
                onClick={() => setFilter("ENDED")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "ENDED"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Terminées
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white w-full"
            >
              <option value="ALL">Tous types</option>
              <option value="FAST">Jeûne</option>
              <option value="PRAYER">Prière</option>
              <option value="VIGIL">Veillée</option>
              <option value="NATIONAL">National</option>
              <option value="GLOBAL">Global</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune campagne trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <PrayerCampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePrayerCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            try {
              const res = await fetch("/api/prayers/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              if (res.ok) {
                await fetchCampaigns();
              }
            } catch (error) {
              console.error("Erreur création campagne:", error);
            }
          }}
        />
      )}
    </div>
  );
}
