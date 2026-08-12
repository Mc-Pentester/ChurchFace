"use client";

import { PrayerCampaign } from "@/types/prayer";
import { PrayerCampaignCard } from "./PrayerCampaignCard";

interface PrayerCampaignListProps {
  campaigns: PrayerCampaign[];
  onJoin?: (campaignId: string) => void;
  onView?: (campaignId: string) => void;
  loading?: boolean;
}

export function PrayerCampaignList({ campaigns, onJoin, onView, loading = false }: PrayerCampaignListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune campagne de prière disponible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {campaigns.map((campaign) => (
        <PrayerCampaignCard
          key={campaign.id}
          campaign={campaign}
          onJoin={onJoin}
          onView={onView}
        />
      ))}
    </div>
  );
}
