"use client";

import { useCallback, useEffect, useState } from "react";
import { PrayerCampaign } from "@/types/prayer";
import { PrayerCampaignCard } from "@/components/prayer/campaigns/PrayerCampaignCard";
import { CreatePrayerCampaignModal } from "@/components/prayer/modals/CreatePrayerCampaignModal";
import { Plus, Filter, Flame } from "lucide-react";
import { useRevalidateOnMount } from "@/hooks/useRevalidateOnMount";

type CampaignFilter = "ALL" | "ACTIVE" | "ENDED";

export default function PrayerCampaignsPage() {
  useRevalidateOnMount();

  const [campaigns, setCampaigns] = useState<PrayerCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CampaignFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (filter === "ACTIVE") {
        params.set("isActive", "true");
      } else if (filter === "ENDED") {
        params.set("isActive", "false");
      }

      if (typeFilter !== "ALL") {
        params.set("type", typeFilter);
      }

      const query = params.toString();
      const response = await fetch(
        query
          ? `/api/prayers/campaigns?${query}`
          : "/api/prayers/campaigns"
      );

      if (!response.ok) {
        throw new Error("Impossible de récupérer les campagnes");
      }

      const data = await response.json();

      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Erreur récupération campagnes:",
        error
      );
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    const handleRevalidate = () => {
      fetchCampaigns();
    };

    window.addEventListener(
      "revalidate-data",
      handleRevalidate
    );

    return () => {
      window.removeEventListener(
        "revalidate-data",
        handleRevalidate
      );
    };
  }, [fetchCampaigns]);

  const handleView = (campaignId: string) => {
    window.location.href = `/prayers/campaigns/${campaignId}`;
  };

  const handleCreateCampaign = async (
    data: Record<string, unknown>
  ) => {
    try {
      const response = await fetch(
        "/api/prayers/campaigns",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.error ||
            "Erreur lors de la création de la campagne"
        );
      }

      setShowCreateModal(false);
      await fetchCampaigns();
    } catch (error) {
      console.error(
        "Erreur création campagne:",
        error
      );

      throw error;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            <Flame className="h-7 w-7 text-orange-500 sm:h-8 sm:w-8" />
            Campagnes de prière
          </h1>

          <p className="mt-1 text-gray-600">
            Participez à des campagnes d&apos;intercession
            organisées.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          Créer une campagne
        </button>
      </div>

      {/* FILTRES */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <Filter className="h-5 w-5 shrink-0 text-gray-500" />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  filter === "ALL"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Toutes
              </button>

              <button
                type="button"
                onClick={() => setFilter("ACTIVE")}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  filter === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Actives
              </button>

              <button
                type="button"
                onClick={() => setFilter("ENDED")}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  filter === "ENDED"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Terminées
              </button>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 sm:w-auto"
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

      {/* CONTENU */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
          <Flame className="mx-auto mb-3 h-10 w-10 text-gray-300" />

          <p className="text-gray-600">
            Aucune campagne trouvée.
          </p>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
          >
            Créer la première campagne
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <PrayerCampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* MODAL DE CRÉATION */}
      {showCreateModal && (
        <CreatePrayerCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCampaign}
        />
      )}
    </div>
  );
}