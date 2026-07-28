"use client";

import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { XMarkIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

interface UploadProgressProps {
  endpoint: "mediaUploader" | "audioUploader";
  onUploadComplete: (url: string, isVideo: boolean) => void;
  disabled?: boolean;
}

export default function UploadProgress({
  endpoint,
  onUploadComplete,
  disabled = false,
}: UploadProgressProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (res: any[]) => {
    const file = res?.[0];
    const url = file?.ufsUrl || file?.url || file?.fileUrl || "";

    if (!url) {
      setError("Erreur lors de l'upload");
      setIsUploading(false);
      return;
    }

    const type = (file?.type || "").toLowerCase();
    const cleanUrl = url.split("?")[0].toLowerCase();
    const videoExts = /\.(mp4|mov|webm|ogg|mkv|avi|m4v|flv)$/;
    const isVideo = type.startsWith("video/") || videoExts.test(cleanUrl);

    onUploadComplete(url, isVideo);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  };

  const handleUploadError = (err: Error) => {
    console.error("Upload error:", err);
    setError("Erreur lors de l'upload");
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadBegin = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
  };

  const handleProgressChange = (progress: number) => {
    setUploadProgress(progress);
  };

  const handleCancel = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="relative">
      {isUploading ? (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Upload en cours...</span>
              <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
            title="Annuler"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <UploadButton
          endpoint={endpoint}
          onUploadBegin={handleUploadBegin}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          disabled={disabled}
          appearance={{
            button: `flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`,
            container: "w-full",
            allowedContent: "hidden",
          }}
          content={{
            button({ ready }) {
              if (ready) {
                return (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Ajouter un média</span>
                  </>
                );
              }
              return "Chargement...";
            },
          }}
        />
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
