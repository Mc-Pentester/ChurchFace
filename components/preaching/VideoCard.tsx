"use client";

import { Play, Heart, Share2, MessageCircle, Clock, Eye } from "lucide-react";
import Link from "next/link";
import type { Preaching } from "@/types/preaching";

type Props = {
  preaching: Preaching;
};

export default function VideoCard({ preaching }: Props) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
    return new Date(date).toLocaleDateString("fr-FR");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/preachings/${preaching.id}`}>
        <div className="relative aspect-video bg-gradient-to-br from-emerald-500 to-purple-600 group cursor-pointer">
          {preaching.thumbnail ? (
            <img
              src={preaching.thumbnail}
              alt={preaching.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play size={48} className="text-white opacity-80" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(preaching.duration)}
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Play size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/preachings/${preaching.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer">
            {preaching.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          {preaching.author?.image && (
            <img
              src={preaching.author.image || "/default-avatar.png"}
              alt={preaching.author.name || ""}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span className="text-sm text-gray-600">
            {preaching.author?.name}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{formatViews(preaching.views)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatDate(preaching.publishedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-purple-600 text-white py-2 px-4 rounded-xl hover:opacity-90 transition-opacity text-sm font-medium">
            <Play size={16} />
            Regarder
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Heart size={20} className={preaching.isLiked ? "text-red-500 fill-current" : "text-gray-400"} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Share2 size={20} className="text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
            <MessageCircle size={20} className="text-gray-400" />
            {preaching._count?.comments && preaching._count.comments > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {preaching._count.comments}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
