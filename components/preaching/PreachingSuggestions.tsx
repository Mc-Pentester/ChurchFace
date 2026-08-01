"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Clock, Eye, ThumbsUp, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface PreachingSuggestionsProps {
  currentPreachingId: string;
  onSelectPreaching: (preaching: any) => void;
}

export default function PreachingSuggestions({ currentPreachingId, onSelectPreaching }: PreachingSuggestionsProps) {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecommendations();
    }
  }, [session, currentPreachingId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/preachings/recommendations?limit=10");
      const data = await response.json();
      // Filter out current preaching
      const filtered = (data.preachings || []).filter((p: any) => p.id !== currentPreachingId);
      setRecommendations(filtered);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Aucune suggestion disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm">À suivre</h3>
      {recommendations.map((preaching) => (
        <div
          key={preaching.id}
          onClick={() => onSelectPreaching(preaching)}
          className="flex gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition"
        >
          <div className="relative flex-shrink-0">
            <img
              src={preaching.thumbnail || preaching.banner || "/placeholder.jpg"}
              alt={preaching.title}
              className="w-40 h-24 object-cover rounded-lg"
            />
            {preaching.duration && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                {formatDuration(preaching.duration)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-emerald-600 transition">
              {preaching.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{preaching.author?.name}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {preaching.viewCount?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {preaching.publishedAt
                  ? formatDistanceToNow(new Date(preaching.publishedAt), { addSuffix: true, locale: fr })
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {preaching.isLiked && (
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <ThumbsUp size={12} />
                </span>
              )}
              {preaching.isBookmarked && (
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <Bookmark size={12} className="fill-current" />
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
