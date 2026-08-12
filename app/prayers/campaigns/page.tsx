"use client";

import { useState, useEffect } from "react";
import { PrayerCampaign } from "@/types/prayer";
import { PrayerCampaignList } from "@/components/prayer/campaigns/PrayerCampaignList";
import { usePrayerCampaigns } from "@/hooks/usePrayers";
import { Plus, Filter, Flame } from "lucide-react";

export default function PrayerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<PrayerCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ACTIVE");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const { createCampaign } = usePrayerCampaigns();

  useEffect(() => {
    fetchCampaigns();
  }, [filter, typeFilter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "ACTIVE") params.isActive = true;
      if (filter === "COMPLETED") params.isActive = false;
      if (typeFilter !== "ALL") params.type = typeFilter;

      const res = await fetch(`/api/prayers/campaigns?${new URLSearchParams(params)}`);
      const data = await res.json();
      setCampaigns(data);
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            Campagnes de prière
          </h1>
          <p className="text-gray-600 mt-1">Participez aux campagnes d'intercession collective</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Créer une campagne
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "ACTIVE"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "COMPLETED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Terminées
            </button>
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toutes
            </button>
          </div>
          <div className="flex gap-2 ml-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="ALL">Tous les types</option>
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
      <PrayerCampaignList
        campaigns={campaigns}
        onView={handleView}
        loading={loading}
      />
    </div>
  );
}
