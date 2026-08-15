"use client";

import { useState, useEffect } from "react";
import { PrayerChainWithLinks } from "@/types/prayer";
import { usePrayerParticipants } from "@/hooks/usePrayers";
import { Users, Calendar, Lock, Globe, Settings } from "lucide-react";

interface PrayerChainCardProps {
  chain: PrayerChainWithLinks;
  onJoin?: (chainId: string) => void;
  onView?: (chainId: string) => void;
  onSettings?: (chainId: string) => void;
  isMember?: boolean;
}

export function PrayerChainCard({ chain, onJoin, onView, onSettings, isMember = false }: PrayerChainCardProps) {
  const { fetchParticipants } = usePrayerParticipants();
  const [participantCount, setParticipantCount] = useState(chain._count?.links || 0);

  useEffect(() => {
    if (chain.id) {
      fetchParticipants(chain.id).then((data) => {
        setParticipantCount(data.length);
      });
    }
  }, [chain.id, fetchParticipants]);

  const visibilityIcon = chain.visibility === "PRIVATE" ? Lock : Globe;
  const visibilityLabel = chain.visibility === "PRIVATE" ? "Privé" : "Public";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{chain.title}</h3>
            {chain.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{chain.description}</p>
            )}
          </div>
          {chain.imageUrl && (
            <img
              src={chain.imageUrl}
              alt={chain.title}
              className="w-16 h-16 rounded-lg object-cover ml-3"
            />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{participantCount} participant{participantCount !== 1 ? "s" : ""}</span>
          </div>
          {chain.scheduledStart && (
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(chain.scheduledStart).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          {chain.visibility === "PRIVATE" ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          <span className="text-xs">{visibilityLabel}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-2">
        {isMember ? (
          <button
            onClick={() => onView?.(chain.id)}
            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Voir la chaîne
          </button>
        ) : (
          <button
            onClick={() => onJoin?.(chain.id)}
            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Rejoindre
          </button>
        )}
        <button
          onClick={() => onView?.(chain.id)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Détails
        </button>
        {onSettings && (
          <button
            onClick={() => onSettings(chain.id)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            title="Paramètres"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
