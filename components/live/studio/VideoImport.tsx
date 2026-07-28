"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Pause, Play, Loader2, FileVideo } from "lucide-react";

interface VideoImportProps {
  onImportComplete: (file: File, url: string) => void;
  onCancel: () => void;
}

export default function VideoImport({ onImportComplete, onCancel }: VideoImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("video/")) {
      setError("Veuillez sélectionner un fichier vidéo");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 2 GB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadProgress(0);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const startUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setIsPaused(false);
    setError(null);

    try {
      // Simulate upload with progress
      const totalSize = file.size;
      const chunkSize = 1024 * 1024; // 1MB chunks
      let uploaded = 0;

      const uploadInterval = setInterval(() => {
        if (isPaused) return;

        uploaded += chunkSize;
        const progress = Math.min((uploaded / totalSize) * 100, 100);
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          
          // Simulate getting URL from server
          const mockUrl = URL.createObjectURL(file);
          onImportComplete(file, mockUrl);
        }
      }, 100);

    } catch (err) {
      setError("Erreur lors de l'import");
      setIsUploading(false);
    }
  }, [file, isPaused, onImportComplete]);

  const pauseUpload = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeUpload = useCallback(() => {
    setIsPaused(false);
  }, []);

  const cancelUpload = useCallback(() => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsPaused(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-white text-xl font-semibold mb-4">Importer une vidéo</h2>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Upload size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Glissez-déposez une vidéo ici</p>
          <p className="text-gray-400 text-sm mb-4">ou cliquez pour sélectionner</p>
          <p className="text-gray-500 text-xs">Formats acceptés: MP4, WebM, MOV, AVI (max 2 GB)</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Info */}
          <div className="bg-[#252535] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <FileVideo size={24} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={cancelUpload}
                className="p-2 text-gray-400 hover:text-red-400 transition"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-[#252535] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 size={20} className="text-emerald-400 animate-spin" />
                  <p className="text-white text-sm">
                    {isPaused ? "En pause" : "Import en cours..."}
                  </p>
                </div>
                <p className="text-gray-400 text-xs">{Math.round(uploadProgress)}%</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex gap-2">
                {!isPaused ? (
                  <button
                    onClick={pauseUpload}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeUpload}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    Reprendre
                  </button>
                )}
                <button
                  onClick={cancelUpload}
                  className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          {!isUploading && (
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={startUpload}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                Importer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
