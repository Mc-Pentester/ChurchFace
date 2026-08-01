"use client";

import { useState } from "react";
import { FolderOpen, Video, Music, Image as ImageIcon, Search, Upload, Trash2, Play, Plus } from "lucide-react";

interface MediaItem {
  id: string;
  type: "VIDEO" | "AUDIO" | "IMAGE";
  name: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  size: number;
  createdAt: Date;
}

interface StudioMediaLibraryProps {
  mediaItems: MediaItem[];
  onMediaSelect: (item: MediaItem) => void;
  onMediaDelete: (itemId: string) => void;
  onMediaUpload: (files: File[]) => void;
  uploads?: Array<{
    fileName: string;
    progress: number;
    status: "uploading" | "completed" | "error";
    error?: string;
  }>;
  isUploading?: boolean;
  onCancelUpload?: (fileName: string) => void;
}

export default function StudioMediaLibrary({
  mediaItems,
  onMediaSelect,
  onMediaDelete,
  onMediaUpload,
  uploads = [],
  isUploading = false,
  onCancelUpload,
}: StudioMediaLibraryProps) {
  const [filter, setFilter] = useState<"ALL" | "VIDEO" | "AUDIO" | "IMAGE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const filteredItems = mediaItems.filter((item) => {
    const matchesFilter = filter === "ALL" || item.type === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getMediaIcon = (type: MediaItem["type"]) => {
    switch (type) {
      case "VIDEO":
        return Video;
      case "AUDIO":
        return Music;
      case "IMAGE":
        return ImageIcon;
      default:
        return Video;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onMediaUpload(files);
    }
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Bibliothèque médias</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition">
            <Upload size={14} />
            <span>Importer</span>
            <input
              type="file"
              multiple
              accept="video/*,audio/*,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {(isUploading || uploads.length > 0) && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Upload en cours</span>
            <span>{uploads.filter(u => u.status === "completed").length}/{uploads.length}</span>
          </div>
          {uploads.length > 0 ? (
            uploads.map((upload) => (
              <div key={upload.fileName} className="bg-[#252535] rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs truncate flex-1">{upload.fileName}</span>
                  {upload.status === "completed" && (
                    <span className="text-emerald-400 text-xs">✓</span>
                  )}
                  {upload.status === "error" && (
                    <span className="text-red-400 text-xs">✗</span>
                  )}
                  {upload.status === "uploading" && (
                    <span className="text-violet-400 text-xs">{upload.progress}%</span>
                  )}
                  {onCancelUpload && (upload.status === "uploading" || upload.status === "error") && (
                    <button
                      onClick={() => onCancelUpload(upload.fileName)}
                      className="text-gray-400 hover:text-red-400 text-xs ml-2"
                      title={upload.status === "error" ? "Supprimer" : "Annuler"}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="w-full bg-[#1a1a24] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      upload.status === "completed" ? "bg-emerald-500" :
                      upload.status === "error" ? "bg-red-500" :
                      "bg-violet-500"
                    }`}
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
                {upload.error && (
                  <p className="text-red-400 text-xs mt-1">{upload.error}</p>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#252535] rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-violet-400 text-sm">
                <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                <span>Upload en cours...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-[#252535] text-white placeholder-gray-500 pl-8 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-[#252535] text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="ALL">Tous</option>
          <option value="VIDEO">Vidéos</option>
          <option value="AUDIO">Audio</option>
          <option value="IMAGE">Images</option>
        </select>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            {mediaItems.length === 0 ? (
              <>
                <FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p>Aucun média. Importez des fichiers pour commencer.</p>
              </>
            ) : (
              <p>Aucun média ne correspond à votre recherche.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map((item) => {
              const Icon = getMediaIcon(item.type);
              const isSelected = selectedItem === item.id;

              return (
                <div
                  key={item.id}
                  className={`group relative bg-[#252535] rounded-lg overflow-hidden cursor-pointer transition ${
                    isSelected ? "ring-2 ring-violet-500" : "hover:bg-[#353545]"
                  }`}
                  onClick={() => {
                    setSelectedItem(item.id);
                    onMediaSelect(item);
                  }}
                >
                  {/* Thumbnail/Preview */}
                  <div className="aspect-video bg-[#1a1a24] flex items-center justify-center relative">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon size={32} className="text-gray-600" />
                    )}
                    
                    {item.type === "VIDEO" && item.duration && (
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(item.duration)}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMediaSelect(item);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Play size={24} className="text-white fill-white" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-500 text-xs">{formatFileSize(item.size)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMediaDelete(item.id);
                        }}
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{mediaItems.length} fichiers</span>
          <span>{formatFileSize(mediaItems.reduce((acc, item) => acc + item.size, 0))} total</span>
        </div>
      </div>
    </div>
  );
}
