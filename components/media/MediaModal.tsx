"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MediaItem {
  id: string;
  type: string;
  url: string;
  thumbnail?: string | null;
  order: number;
}

interface MediaModalProps {
  media: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
}

export default function MediaModal({ media, initialIndex = 0, onClose }: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentMedia = media[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
  };

  const handleMediaClick = () => {
    if (currentMedia.type === "VIDEO") {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <X size={32} />
      </button>

      {/* Navigation buttons */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={48} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight size={48} />
          </button>
        </>
      )}

      {/* Media counter */}
      {media.length > 1 && (
        <div className="absolute top-4 left-4 z-10 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {media.length}
        </div>
      )}

      {/* Media content */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {currentMedia.type === "VIDEO" ? (
          <div className="relative w-full max-w-5xl max-h-full">
            <video
              src={currentMedia.url}
              controls
              autoPlay={isPlaying}
              onClick={handleMediaClick}
              className="w-full h-full max-h-[90vh] object-contain"
            />
          </div>
        ) : (
          <img
            src={currentMedia.thumbnail || currentMedia.url}
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-full max-w-5xl max-h-[90vh] object-contain"
          />
        )}
      </div>

      {/* Media type indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
        {currentMedia.type === "VIDEO" ? "🎬 Vidéo" : "🖼️ Image"}
      </div>
    </div>
  );
}
