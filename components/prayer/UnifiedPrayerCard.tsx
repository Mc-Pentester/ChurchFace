"use client";

import React from 'react';
import { UnifiedPrayer, PrayerType } from '@/types/prayer';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  Flame, 
  Video, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

interface UnifiedPrayerCardProps {
  prayer: UnifiedPrayer;
  onPray?: (id: string) => void;
  onJoin?: (id: string) => void;
  onView?: (id: string) => void;
  onSettings?: (id: string) => void;
  className?: string;
}

const TYPE_CONFIG: Record<PrayerType, { icon: React.ReactNode; label: string; color: string }> = {
  INDIVIDUAL: { icon: <Heart className="w-4 h-4" />, label: "Demande individuelle", color: "bg-blue-500" },
  COLLABORATIVE_CHAIN: { icon: <Users className="w-4 h-4" />, label: "Chaîne collaborative", color: "bg-purple-500" },
  COLLABORATIVE_CAMPAIGN: { icon: <Flame className="w-4 h-4" />, label: "Campagne collaborative", color: "bg-orange-500" },
  LIVE_ROOM: { icon: <Video className="w-4 h-4" />, label: "Salle live", color: "bg-green-500" },
};

export default function UnifiedPrayerCard({ prayer, onPray, onJoin, onView, onSettings, className }: UnifiedPrayerCardProps) {
  const config = TYPE_CONFIG[prayer.type];
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryEmoji = (category: string | null) => {
    const categoryMap: Record<string, string> = {
      'SANTE': '💊',
      'FAMILLE': '👨‍👩‍👧‍👦',
      'TRAVAIL': '💼',
      'ETUDES': '📚',
      'MINISTERE': '⛪',
      'FINANCES': '💰',
      'MARIAGE': '💍',
      'EVANGELISATION': '📢',
    };
    return category ? (categoryMap[category] || '🙏') : null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 ${className}`}>
      {/* Header avec type et badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${config.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
            {config.icon}
            {config.label}
          </span>
          {prayer.isUrgent && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Urgent
            </span>
          )}
          {prayer.isAnswered && (
            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-green-600">
              <CheckCircle className="w-3 h-3" />
              Exaucé
            </span>
          )}
        </div>
        {prayer.imageUrl && (
          <img 
            src={prayer.imageUrl} 
            alt="" 
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}
      </div>
      
      {/* Titre et contenu */}
      <h3 className="font-semibold text-lg mb-2">{prayer.title}</h3>
      
      {prayer.type === 'INDIVIDUAL' && prayer.content && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{prayer.content}</p>
      )}
      
      {prayer.description && prayer.type !== 'INDIVIDUAL' && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{prayer.description}</p>
      )}

      {/* Informations spécifiques par type */}
      <div className="space-y-2 mb-3">
        {prayer.type === 'INDIVIDUAL' && prayer.category && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{getCategoryEmoji(prayer.category)}</span>
            <span>{prayer.category}</span>
          </div>
        )}

        {prayer.type === 'COLLABORATIVE_CAMPAIGN' && prayer.campaignType && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Flame className="w-4 h-4" />
            <span>{prayer.campaignType}</span>
          </div>
        )}

        {prayer.type === 'LIVE_ROOM' && prayer.roomType && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Video className="w-4 h-4" />
            <span>{prayer.roomType}</span>
          </div>
        )}

        {/* Dates pour campagnes et salles */}
        {(prayer.type === 'COLLABORATIVE_CAMPAIGN' || prayer.type === 'LIVE_ROOM') && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {formatDate(prayer.startDate || prayer.scheduledStart)}
            {prayer.endDate && ` - ${formatDate(prayer.endDate)}`}
          </div>
        )}

        {prayer.type === 'LIVE_ROOM' && prayer.scheduledStart && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {formatDateTime(prayer.scheduledStart)}
          </div>
        )}

        {/* Informations sur l'église */}
        {prayer.prayerChurch && (
          <div className="text-sm text-gray-600">
            📍 {prayer.prayerChurch.name}
          </div>
        )}
      </div>

      {/* Footer avec créateur et actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {prayer.prayerCreator.image ? (
              <img src={prayer.prayerCreator.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs">{prayer.prayerCreator.name?.[0] || 'U'}</span>
            )}
          </div>
          <span className="text-sm text-gray-600">
            {prayer.prayerCreator.name || 'Anonyme'}
          </span>
        </div>

        <div className="flex gap-2">
          {prayer.type === 'INDIVIDUAL' && onPray && (
            <button 
              onClick={() => onPray(prayer.id)}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <Heart className="w-4 h-4" />
              Prier
            </button>
          )}

          {prayer.type === 'COLLABORATIVE_CHAIN' && onJoin && (
            <button 
              onClick={() => onJoin(prayer.id)}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              Rejoindre
            </button>
          )}

          {prayer.type === 'LIVE_ROOM' && (
            <button 
              onClick={() => onView && onView(prayer.id)}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              Rejoindre
            </button>
          )}

          {onView && prayer.type !== 'LIVE_ROOM' && (
            <button 
              onClick={() => onView(prayer.id)}
              className="text-sm px-3 py-1 hover:bg-gray-50"
            >
              Voir
            </button>
          )}

          {onSettings && (prayer.type === 'COLLABORATIVE_CHAIN' || prayer.type === 'COLLABORATIVE_CAMPAIGN') && (
            <button 
              onClick={() => onSettings(prayer.id)}
              className="text-sm px-2 py-1 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
