"use client";

import { useState, useEffect } from "react";
import { PrayerChainWithLinks } from "@/types/prayer";
import { PrayerChainCard } from "@/components/prayer/chains/PrayerChainCard";
import { CreatePrayerChainModal } from "@/components/prayer/modals/CreatePrayerChainModal";
import { usePrayerParticipants } from "@/hooks/usePrayers";
import { Plus, Filter } from "lucide-react";
import { useRevalidateOnMount } from "@/hooks/useRevalidateOnMount";

export default function PrayerChainsPage() {
  // Revalider les données quand le composant est monté (navigation arrière)
  useRevalidateOnMount();

  const [chains, setChains] = useState<PrayerChainWithLinks[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { joinChain } = usePrayerParticipants();

  useEffect(() => {
    fetchChains();
  }, [filter]);

  // Écouter l'événement de revalidation (navigation arrière)
  useEffect(() => {
    const handleRevalidate = () => {
      fetchChains();
    };

    window.addEventListener('revalidate-data', handleRevalidate);

    return () => {
      window.removeEventListener('revalidate-data', handleRevalidate);
    };
  }, [filter]);

  const fetchChains = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prayers/chain");
      const data = await res.json();

      let filteredChains = data.chains || [];
      if (filter === "PUBLIC") {
        filteredChains = filteredChains.filter((chain: PrayerChainWithLinks) => chain.visibility === "PUBLIC");
      } else if (filter === "PRIVATE") {
        filteredChains = filteredChains.filter((chain: PrayerChainWithLinks) => chain.visibility === "PRIVATE");
      }

      setChains(filteredChains);
    } catch (error) {
      console.error("Erreur récupération chaînes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (chainId: string) => {
    try {
      await joinChain(chainId);
      await fetchChains();
    } catch (error) {
      console.error("Erreur rejoindre chaîne:", error);
    }
  };

  const handleView = (chainId: string) => {
    window.location.href = `/prayers/chains/${chainId}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chaînes de prière</h1>
          <p className="text-gray-600 mt-1">Rejoignez des chaînes d'intercession collaborative</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          Créer une chaîne
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
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
              onClick={() => setFilter("PUBLIC")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "PUBLIC"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Publiques
            </button>
            <button
              onClick={() => setFilter("PRIVATE")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "PRIVATE"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Privées
            </button>
          </div>
        </div>
      </div>

      {/* Chains List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      ) : chains.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune chaîne de prière trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chains.map((chain) => (
            <PrayerChainCard
              key={chain.id}
              chain={chain}
              onJoin={handleJoin}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePrayerChainModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            try {
              const res = await fetch("/api/prayers/chain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              if (res.ok) {
                await fetchChains();
              }
            } catch (error) {
              console.error("Erreur création chaîne:", error);
            }
          }}
        />
      )}
    </div>
  );
}
