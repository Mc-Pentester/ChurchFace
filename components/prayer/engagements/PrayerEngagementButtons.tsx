"use client";

import { useState } from "react";
import { usePrayerEngagements } from "@/hooks/usePrayers";
import { Heart, BookOpen, MessageCircle, Repeat } from "lucide-react";

interface PrayerEngagementButtonsProps {
  prayerRequestId: string;
  currentEngagements?: string[]; // Types d'engagements déjà effectués par l'utilisateur
}

const ENGAGEMENT_TYPES = [
  {
    type: "PRAYED" as const,
    label: "J'ai prié",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    type: "CONTINUING" as const,
    label: "Continue de prier",
    icon: Repeat,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    type: "SHARED_VERSE" as const,
    label: "Partager un verset",
    icon: BookOpen,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    type: "ENCOURAGED" as const,
    label: "Encouragé",
    icon: MessageCircle,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
];

export function PrayerEngagementButtons({
  prayerRequestId,
  currentEngagements = [],
}: PrayerEngagementButtonsProps) {
  const { addEngagement } = usePrayerEngagements();
  const [loading, setLoading] = useState<string | null>(null);

  const handleEngagement = async (type: "PRAYED" | "CONTINUING" | "SHARED_VERSE" | "ENCOURAGED") => {
    setLoading(type);
    try {
      await addEngagement({ prayerRequestId, type });
    } catch (error) {
      console.error("Erreur ajout engagement:", error);
    } finally {
      setLoading(null);
    }
  };

  const isEngaged = (type: string) => currentEngagements.includes(type);

  return (
    <div className="flex flex-wrap gap-2">
      {ENGAGEMENT_TYPES.map((engagement) => {
        const Icon = engagement.icon;
        const engaged = isEngaged(engagement.type);
        const isLoading = loading === engagement.type;

        return (
          <button
            key={engagement.type}
            onClick={() => handleEngagement(engagement.type)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              engaged
                ? `${engagement.bgColor} ${engagement.color} border-${engagement.color.split("-")[1]}-200`
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{engagement.label}</span>
            {engaged && <span className="text-xs">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
