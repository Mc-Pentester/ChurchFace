"use client";

import { useState, useEffect } from "react";
import { Video, Plus, Play, Clock, Upload } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

interface VideoGalleryProps {
  userId: string;
  isOwnProfile: boolean;
}

interface Media {
  id: string;
  type: string;
  url: string;
  thumbnail: string | null;
  caption: string | null;
  createdAt: string;
}

export default function VideoGallery({ userId, isOwnProfile }: VideoGalleryProps) {
  const [videos, setVideos] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Media | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("mediaUploader", {
    onUploadBegin: () => {
      setIsUploading(true);
    },
    onUploadError: (error) => {
      console.error("Video upload error:", error);
      setIsUploading(false);
    },
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        const fileData = {
          ...res[0],
          url: res[0].ufsUrl || res[0].url
        };
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            file: fileData,
            type: "VIDEO",
            visibility: "PUBLIC"
          }),
        });
        fetchVideos();
      }
      setIsUploading(false);
    },
  });

  useEffect(() => {
    fetchVideos();
  }, [userId]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?userId=${userId}&type=VIDEO`);
      const data = await res.json();
      setVideos(data.media?.filter((m: Media) => m.type === "VIDEO") || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      startUpload([files[0]]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Vidéos</h2>
        {isOwnProfile && (
          <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium cursor-pointer">
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Upload...
              </>
            ) : (
              <>
                <Plus size={18} />
                Ajouter une vidéo
              </>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Video size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Aucune vidéo</p>
          {isOwnProfile && (
            <label className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer">
              Ajouter votre première vidéo
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative aspect-video bg-gray-900">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.caption || "Vidéo"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video size={48} className="text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <Play size={24} className="text-emerald-600 ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {video.caption && (
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {video.caption}
                  </h3>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span>{formatDate(video.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-full max-w-4xl">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={selectedVideo.url}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
            
            {selectedVideo.caption && (
              <div className="mt-4 text-white">
                <h3 className="text-xl font-semibold">{selectedVideo.caption}</h3>
                <p className="text-gray-400 mt-1">
                  Publiée le {formatDate(selectedVideo.createdAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
