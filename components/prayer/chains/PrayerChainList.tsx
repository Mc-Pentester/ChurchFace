"use client";

import { useState, useEffect } from "react";
import { PrayerChainWithLinks } from "@/types/prayer";
import { PrayerChainCard } from "./PrayerChainCard";
import { usePrayerParticipants } from "@/hooks/usePrayers";

interface PrayerChainListProps {
  chains: PrayerChainWithLinks[];
  onJoin?: (chainId: string) => void;
  onView?: (chainId: string) => void;
  loading?: boolean;
}

export function PrayerChainList({ chains, onJoin, onView, loading = false }: PrayerChainListProps) {
  const { fetchParticipants } = usePrayerParticipants();
  const [memberChainIds, setMemberChainIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Vérifier quelles chaînes l'utilisateur a rejointes
    chains.forEach(async (chain) => {
      try {
        const participants = await fetchParticipants(chain.id);
        // TODO: Vérifier si l'utilisateur actuel est dans la liste des participants
        // Pour l'instant, on utilise une logique simplifiée
      } catch (error) {
        console.error("Erreur récupération participants:", error);
      }
    });
  }, [chains, fetchParticipants]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (chains.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune chaîne de prière disponible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {chains.map((chain) => (
        <PrayerChainCard
          key={chain.id}
          chain={chain}
          onJoin={onJoin}
          onView={onView}
          isMember={memberChainIds.has(chain.id)}
        />
      ))}
    </div>
  );
}
