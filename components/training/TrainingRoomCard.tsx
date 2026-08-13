"use client";

import { useState } from "react";
import { TrainingRoom } from "@/types/training";
import { Video, Mic, MessageSquare, Users, Lock, Globe, Share2, Check, Calendar, Clock } from "lucide-react";
import { ShareModal } from "@/components/prayer/modals/ShareModal";

interface TrainingRoomCardProps {
  room: TrainingRoom;
  onJoin?: (roomId: string) => void;
  onView?: (roomId: string) => void;
  onShare?: (roomId: string) => void;
}

const ROOM_TYPE_ICONS = {
  TEXT: MessageSquare,
  AUDIO: Mic,
  VIDEO: Video,
};

const ROOM_TYPE_LABELS = {
  TEXT: "Texte",
  AUDIO: "Audio",
  VIDEO: "Vidéo",
};

export function TrainingRoomCard({ room, onJoin, onView, onShare }: TrainingRoomCardProps) {
  const Icon = ROOM_TYPE_ICONS[room.roomType as keyof typeof ROOM_TYPE_ICONS] || Video;
  const typeLabel = ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS] || "Vidéo";
  const isActive = room.isActive;
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-lg">{room.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {isActive ? "Actif" : "Terminé"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <Icon className="w-4 h-4" />
                <span>{typeLabel}</span>
                {room.isPublic ? (
                  <Globe className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>{room.isPublic ? "Public" : "Privé"}</span>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Partager"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Description */}
        {room.description && (
          <div className="p-4 border-b border-gray-100">
            <p className="text-gray-600 text-sm line-clamp-2">{room.description}</p>
          </div>
        )}

        {/* Schedule */}
        {(room.scheduledStart || room.scheduledEnd) && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="space-y-2 text-sm">
              {room.scheduledStart && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Début: {formatDate(room.scheduledStart)}</span>
                </div>
              )}
              {room.scheduledEnd && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Fin: {formatDate(room.scheduledEnd)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{room._count?.participants || 0} participant(s)</span>
              {room.maxParticipants && (
                <span className="text-gray-400">/ {room.maxParticipants}</span>
              )}
            </div>
            {isActive && (
              <button
                onClick={() => onJoin?.(room.id)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                Rejoindre
              </button>
            )}
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={`${window.location.origin}/training/rooms/${room.id}`}
        title={room.title}
      />
    </>
  );
}
