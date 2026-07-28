"use client";

import { useState } from "react";
import { Upload, Check, X, Loader2 } from "lucide-react";

interface PublishAsPreachingProps {
  videoBlob: Blob | null;
  duration: number;
  broadcastId?: string;
  onPublish: (data: { title: string; description: string; thumbnail?: string }) => Promise<void>;
  onCancel: () => void;
}

export default function PublishAsPreaching({
  videoBlob,
  duration,
  broadcastId,
  onPublish,
  onCancel,
}: PublishAsPreachingProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handlePublish = async () => {
    if (!title.trim() || !videoBlob) return;

    setIsPublishing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      await onPublish({
        title: title.trim(),
        description: description.trim(),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error("Publish error:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const fileSize = videoBlob ? (videoBlob.size / (1024 * 1024)).toFixed(2) : "0";

  return (
    <div className="bg-[#16161f] rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-white text-xl font-semibold mb-4">Publier comme Prédication</h2>

      <div className="space-y-4">
        {/* Video Info */}
        <div className="bg-[#252535] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <Upload size={24} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Enregistrement du live</p>
              <p className="text-gray-400 text-xs">
                Durée: {formatDuration(duration)} • Taille: {fileSize} MB
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-gray-300 text-sm block mb-2">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la prédication"
            className="w-full bg-[#252535] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isPublishing}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-gray-300 text-sm block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la prédication..."
            rows={4}
            className="w-full bg-[#252535] text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            disabled={isPublishing}
          />
        </div>

        {/* Upload Progress */}
        {isPublishing && (
          <div className="bg-[#252535] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 size={20} className="text-emerald-400 animate-spin" />
              <p className="text-white text-sm">Publication en cours...</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-2">{uploadProgress}%</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isPublishing}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handlePublish}
            disabled={!title.trim() || isPublishing}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publication...
              </>
            ) : (
              <>
                <Check size={18} />
                Publier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
