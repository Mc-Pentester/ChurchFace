"use client";

import { useState } from "react";
import { PrayerRoom } from "@/types/prayer";
import {
  Video,
  Mic,
  MessageSquare,
  Users,
  Lock,
  Globe,
  Share2,
  Clock,
} from "lucide-react";
import { ShareModal } from "@/components/prayer/modals/ShareModal";

interface PrayerRoomCardProps {
  room: PrayerRoom;
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

export function PrayerRoomCard({
  room,
  onJoin,
  onView,
  onShare,
}: PrayerRoomCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const Icon =
    ROOM_TYPE_ICONS[room.roomType as keyof typeof ROOM_TYPE_ICONS] ||
    MessageSquare;

  const typeLabel =
    ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS] ||
    "Texte";

  const isActive = room.isActive;

  const participantCount = room._count?.participants || 0;

  const handleShare = () => {
    setShowShareModal(true);
    onShare?.(room.id);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {room.title}
                </h3>

                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isActive ? "Actif" : "Terminé"}
                </span>
              </div>

              {room.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {room.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 text-gray-500 ml-3">
              <Icon className="w-5 h-5" />
              <span className="text-sm">{typeLabel}</span>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="px-4 py-3 bg-gray-50 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />

              <span>
                {participantCount} participant
                {participantCount !== 1 ? "s" : ""}
              </span>
            </div>

            {room.maxParticipants && (
              <span className="text-gray-500">
                {participantCount}/{room.maxParticipants}
              </span>
            )}
          </div>

          {room.scheduledStart && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />

              <span>
                {new Date(room.scheduledStart).toLocaleString()}
                {room.scheduledEnd
                  ? ` - ${new Date(room.scheduledEnd).toLocaleString()}`
                  : ""}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            {room.isPublic ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Privé</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-2 flex-col sm:flex-row">
          {isActive ? (
            <>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors w-full sm:w-auto"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>

              <button
                onClick={() => onJoin?.(room.id)}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors w-full sm:w-auto"
              >
                Rejoindre
              </button>
            </>
          ) : (
            <button
              onClick={() => onView?.(room.id)}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Voir l'historique
            </button>
          )}
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={`${window.location.origin}/prayers/rooms/${room.id}`}
        title={room.title}
      />
    </>
  );
}