"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MessageCircle,
  Heart,
  BookOpen,
  Flame,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type { PrayerRequestWithUser } from "@/types/prayer";

interface Props {
  prayer: PrayerRequestWithUser;
  onPray: (id: string) => void;
  onOpenDetail: (prayer: PrayerRequestWithUser) => void;
  onDelete?: (id: string) => void;
  hasPrayed?: boolean;
}

export default function PrayerCard({
  prayer,
  onPray,
  onOpenDetail,
  onDelete,
  hasPrayed = false,
}: Props) {
  const { data: session } = useSession();
  const [imgError, setImgError] = useState(false);
  const isOwner = session?.user?.id === prayer.userId;

  const prayCount = prayer._count?.reactions ?? 0;
  const responseCount = prayer._count?.responses ?? 0;
  const verseCount = prayer._count?.verses ?? 0;

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
            {!imgError && prayer.user.image ? (
              <img
                src={prayer.user.image}
                alt={prayer.user.name || ""}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-emerald-700 font-semibold text-sm">
                {(prayer.user.name || "?")[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {prayer.user.name || "Anonyme"}
            </p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(prayer.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {prayer.isUrgent && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <Flame size={12} /> Urgent
            </span>
          )}
          {prayer.isAnswered && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <CheckCircle2 size={12} /> Exaucée
            </span>
          )}
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(prayer.id)}
              className="text-gray-300 hover:text-red-500 transition p-1"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3 className="font-bold text-gray-900 text-base">{prayer.title}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-3">{prayer.content}</p>
      </div>

      {/* Category */}
      <div className="mt-3">
        <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
          {prayer.category}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span className="text-lg">🙏</span> {prayCount} prient
        </span>
        <span className="flex items-center gap-1">
          <Heart size={14} className="text-rose-400" /> {responseCount} encouragements
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={14} className="text-amber-500" /> {verseCount} versets
        </span>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t pt-3">
        <button
          onClick={() => onPray(prayer.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition flex-1 justify-center ${
            hasPrayed
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          🙏 {hasPrayed ? "Je prie" : "Je prie"}
        </button>
        <button
          onClick={() => onOpenDetail(prayer)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition flex-1 justify-center"
        >
          <MessageCircle size={16} /> Répondre
        </button>
      </div>
    </div>
  );
}
