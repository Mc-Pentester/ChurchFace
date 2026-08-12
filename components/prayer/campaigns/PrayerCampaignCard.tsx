"use client";

import { PrayerCampaign } from "@/types/prayer";
import { Calendar, Users, Flame, Church, Globe } from "lucide-react";

interface PrayerCampaignCardProps {
  campaign: PrayerCampaign;
  onJoin?: (campaignId: string) => void;
  onView?: (campaignId: string) => void;
}

const CAMPAIGN_ICONS = {
  FAST: Flame,
  PRAYER: Users,
  VIGIL: Calendar,
  NATIONAL: Globe,
  GLOBAL: Globe,
};

const CAMPAIGN_LABELS = {
  FAST: "Jeûne",
  PRAYER: "Prière",
  VIGIL: "Veillée",
  NATIONAL: "National",
  GLOBAL: "Global",
};

export function PrayerCampaignCard({ campaign, onJoin, onView }: PrayerCampaignCardProps) {
  const Icon = CAMPAIGN_ICONS[campaign.type];
  const label = CAMPAIGN_LABELS[campaign.type];
  const daysRemaining = Math.ceil(
    (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with image */}
      {campaign.imageUrl && (
        <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {label}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg">{campaign.title}</h3>
        {campaign.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{campaign.description}</p>
        )}

        {/* Stats */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                {new Date(campaign.endDate).toLocaleDateString()}
              </span>
            </div>
            {daysRemaining > 0 && (
              <span className="text-blue-600 font-medium">{daysRemaining} jours restants</span>
            )}
          </div>

          {campaign.church && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Church className="w-4 h-4" />
              <span>{campaign.church.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{campaign._count?.chains || 0} chaîne{campaign._count?.chains !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onView?.(campaign.id)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Voir les chaînes
          </button>
        </div>
      </div>
    </div>
  );
}
