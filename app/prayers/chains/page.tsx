"use client";

import { useState, useEffect } from "react";
import { PrayerChainWithLinks } from "@/types/prayer";
import { PrayerChainList } from "@/components/prayer/chains/PrayerChainList";
import { usePrayerParticipants } from "@/hooks/usePrayers";
import { Plus, Filter } from "lucide-react";

export default function PrayerChainsPage() {
  const [chains, setChains] = useState<PrayerChainWithLinks[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");
  const { joinChain } = usePrayerParticipants();

  useEffect(() => {
    fetchChains();
  }, [filter]);

  const fetchChains = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prayers/chain");
      const data = await res.json();
      
      let filteredChains = data;
      if (filter === "PUBLIC") {
        filteredChains = data.filter((chain: PrayerChainWithLinks) => chain.visibility === "PUBLIC");
      } else if (filter === "PRIVATE") {
        filteredChains = data.filter((chain: PrayerChainWithLinks) => chain.visibility === "PRIVATE");
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
      await fetchChains(); // Recharger pour mettre à jour l'état
    } catch (error) {
      console.error("Erreur rejoindre chaîne:", error);
    }
  };

  const handleView = (chainId: string) => {
    // Navigation vers la page de détail de la chaîne
    window.location.href = `/prayers/chains/${chainId}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chaînes de prière</h1>
          <p className="text-gray-600 mt-1">Rejoignez des chaînes d'intercession collaborative</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Créer une chaîne
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
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
            <button
              onClick={() => setFilter("PUBLIC")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "PUBLIC"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Publiques
            </button>
            <button
              onClick={() => setFilter("PRIVATE")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "PRIVATE"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Privées
            </button>
          </div>
        </div>
      </div>

      {/* Chains List */}
      <PrayerChainList
        chains={chains}
        onJoin={handleJoin}
        onView={handleView}
        loading={loading}
      />
    </div>
  );
}
