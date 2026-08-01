"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ThumbsUp, ThumbsDown, Share, Bookmark, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface PreachingPlayerProps {
  preaching: any;
  onLike: () => void;
  onDislike: () => void;
  onBookmark: () => void;
}

export default function PreachingPlayer({ preaching, onLike, onDislike, onBookmark }: PreachingPlayerProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(preaching.isLiked || false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(preaching.isBookmarked || false);
  const [likeCount, setLikeCount] = useState(preaching.likeCount || 0);
  const [viewCount, setViewCount] = useState(preaching.viewCount || 0);

  useEffect(() => {
    // Increment view count when component mounts
    if (session?.user?.id && preaching.id) {
      fetch(`/api/preachings/${preaching.id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      }).catch(console.error);
      setViewCount((prev: number) => prev + 1);
    }
  }, [session, preaching.id]);

  const handleLike = async () => {
    if (!session?.user?.id) return;
    
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev: number) => prev - 1);
    } else {
      setIsLiked(true);
      setIsDisliked(false);
      setLikeCount((prev: number) => prev + 1);
    }
    
    try {
      await fetch(`/api/preachings/${preaching.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      onLike();
    } catch (error) {
      console.error("Error liking preaching:", error);
    }
  };

  const handleDislike = async () => {
    if (!session?.user?.id) return;
    
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      setIsLiked(false);
      setLikeCount((prev: number) => prev - 1);
    }
    
    try {
      await fetch(`/api/preachings/${preaching.id}/dislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      onDislike();
    } catch (error) {
      console.error("Error disliking preaching:", error);
    }
  };

  const handleBookmark = async () => {
    if (!session?.user?.id) return;
    
    setIsBookmarked((prev: boolean) => !prev);
    
    try {
      await fetch(`/api/preachings/${preaching.id}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      onBookmark();
    } catch (error) {
      console.error("Error bookmarking preaching:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: preaching.title,
          text: preaching.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
        <video
          src={preaching.videoUrl}
          poster={preaching.thumbnail || preaching.banner}
          controls
          className="w-full h-full"
          controlsList="nodownload"
        />
      </div>

      {/* Title and Actions */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{preaching.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {viewCount.toLocaleString()} vues
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {preaching.publishedAt
                ? formatDistanceToNow(new Date(preaching.publishedAt), { addSuffix: true, locale: fr })
                : "Date inconnue"}
            </span>
            {preaching.duration && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDuration(preaching.duration)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isLiked ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ThumbsUp size={18} />
            <span>{likeCount.toLocaleString()}</span>
          </button>
          
          <button
            onClick={handleDislike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isDisliked ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ThumbsDown size={18} />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            <Share size={18} />
            <span>Partager</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isBookmarked ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
            <span>{isBookmarked ? "Sauvegardé" : "Sauvegarder"}</span>
          </button>
        </div>

        {/* Author and Category */}
        <div className="flex items-center gap-3">
          {preaching.author?.image && (
            <img
              src={preaching.author.image}
              alt={preaching.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-gray-900">{preaching.author?.name || "Anonyme"}</p>
            {preaching.category && (
              <p className="text-sm text-gray-500">{preaching.category.name}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {preaching.description && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{preaching.description}</p>
          </div>
        )}

        {/* Verses */}
        {preaching.verses && preaching.verses.length > 0 && (
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Verset(s) biblique(s)</h3>
            <div className="space-y-2">
              {preaching.verses.map((verse: any) => (
                <div key={verse.id} className="text-sm text-gray-700">
                  <span className="font-semibold">{verse.book} {verse.chapter}:{verse.verse}</span>
                  {verse.text && <p className="mt-1 italic">{verse.text}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Series */}
        {preaching.series && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Série</h3>
            <p className="text-sm text-gray-700">{preaching.series.title}</p>
            {preaching.series.description && (
              <p className="text-sm text-gray-600 mt-1">{preaching.series.description}</p>
            )}
          </div>
        )}

        {/* Tags */}
        {preaching.tags && preaching.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {preaching.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
