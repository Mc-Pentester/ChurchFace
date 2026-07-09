"use client";

import Image from "next/image";
import { CheckBadgeIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import LiveVideoPlayer from "../live/components/LiveVideoPlayer";

interface ChurchHeroProps {
  church: any;
}

export default function ChurchHero({ church }: ChurchHeroProps) {
  const [isFollowing, setIsFollowing] = useState(church.isFollowing || false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isProcessingFollow, setIsProcessingFollow] = useState(false);
  const activeLive = church.lives?.[0];
  const isLive = activeLive?.status === "LIVE";

  const handleFollow = async () => {
    if (isProcessingFollow) return;
    setIsProcessingFollow(true);

    try {
      const res = await fetch(`/api/church/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ churchId: church.id }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Follow error:", errText);
        setIsProcessingFollow(false);
        return;
      }

      const data = await res.json();
      setIsFollowing(!!data.following);
    } catch (error) {
      console.error("Error following church:", error);
    } finally {
      setIsProcessingFollow(false);
    }
  };

  return (
    <div className="relative">
      {/* Cover Image */}
      <div 
        className="h-64 sm:h-80 bg-gradient-to-r from-emerald-600 to-emerald-800 relative cursor-pointer"
        onClick={() => church.coverImage && setShowCoverModal(true)}
      >
        {church.coverImage && (
          <Image
            src={church.coverImage}
            alt={`${church.name} cover`}
            fill
            className="object-cover hover:opacity-90 transition"
            priority
          />
        )}
      </div>

      {/* Cover Modal */}
      {showCoverModal && church.coverImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCoverModal(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCoverModal(false);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          <img
            src={church.coverImage}
            alt={`${church.name} cover`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16">
        {/* Live Hero Section - Affiché si live actif ou récent */}
        {activeLive && (
          <div className="mb-6 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-80 sm:h-96 bg-black">
              {/* Live Video Player */}
              <LiveVideoPlayer
                live={activeLive}
                churchSlug={church.slug}
                isLive={isLive}
              />
              
              {/* Live Badge */}
              {isLive && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg z-10">
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  🔴 En direct maintenant
                </div>
              )}
              
              {!isLive && (
                <div className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg z-10">
                  ▶ Replay disponible
                </div>
              )}

              {/* Live Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 z-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {activeLive.title || "Diffusion"}
                </h3>
                {activeLive.description && (
                  <p className="text-white/90 text-sm mb-4 line-clamp-2">
                    {activeLive.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    👁 {activeLive.viewerCount || 0} spectateurs
                  </span>
                  {activeLive.startedAt && (
                    <span>
                      • {new Date(activeLive.startedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Logo */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-white shadow-xl border-4 border-white">
            {church.logo ? (
              <Image
                src={church.logo}
                alt={`${church.name} logo`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 text-4xl font-bold">
                {church.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {church.name}
              </h1>
              {church.isVerified && (
                <CheckBadgeIcon className="w-6 h-6 text-emerald-600" title="Église vérifiée" />
              )}
            </div>
            
            {church.slogan && (
              <p className="text-gray-600 text-sm sm:text-base mb-2">
                {church.slogan}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {church.city && church.country && (
                <span>
                  {church.city}, {church.country}
                </span>
              )}
              <span>•</span>
              <span>{church._count.members} membres</span>
              <span>•</span>
              <span>{church._count.follows} abonnés</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {isLive && (
              <a
                href={`/church/${church.slug}/live`}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                En direct
              </a>
            )}
            <button
              onClick={handleFollow}
              disabled={isProcessingFollow}
              aria-busy={isProcessingFollow}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isFollowing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isProcessingFollow ? "Traitement…" : isFollowing ? "Abonné" : "Suivre"}
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
              Message
            </button>
            {church.donationEnabled && (
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                Faire un don
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
