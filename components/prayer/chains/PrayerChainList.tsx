"use client";

import { PrayerChainCard } from "./PrayerChainCard";
import { PrayerChainWithLinks } from "@/types/prayer";

interface PrayerChainListProps {
  chains: PrayerChainWithLinks[];
  loading?: boolean;
  onJoin?: (chainId: string) => void;
  onView?: (chainId: string) => void;
}

export function PrayerChainList({ chains, loading, onJoin, onView }: PrayerChainListProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-32 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (chains.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Aucune chaîne de prière trouvée</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chains.map((chain) => (
        <PrayerChainCard
          key={chain.id}
          chain={chain}
          onJoin={onJoin}
          onView={onView}
        />
      ))}
    </div>
  );
}
