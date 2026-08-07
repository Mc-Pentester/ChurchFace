"use client";

import { useState } from "react";
import { Plus, Video, Monitor, Image, Music, Type, Globe, Trash2, Eye, EyeOff, Volume2, VolumeX, Settings } from "lucide-react";

interface StudioSource {
  id: string;
  type: "CAMERA" | "SCREEN" | "IMAGE" | "VIDEO" | "PLAYLIST" | "TEXT" | "LOGO" | "BROWSER" | "AUDIO";
  name: string;
  url?: string;
  settings?: any;
  order: number;
  isVisible: boolean;
  volume: number;
  muted: boolean;
}

interface StudioSourcesPanelProps {
  sources: StudioSource[];
  onSourceAdd: (type: StudioSource["type"]) => void;
  onSourceDelete: (sourceId: string) => void;
  onSourceToggleVisibility: (sourceId: string) => void;
  onSourceToggleMute: (sourceId: string) => void;
  onSourceVolumeChange: (sourceId: string, volume: number) => void;
  onSourceSettings?: (sourceId: string) => void;
}

const SOURCE_TYPES = [
  { type: "CAMERA" as const, icon: Video, label: "Caméra" },
  { type: "SCREEN" as const, icon: Monitor, label: "Écran" },
  { type: "IMAGE" as const, icon: Image, label: "Image" },
  { type: "VIDEO" as const, icon: Video, label: "Vidéo" },
  { type: "PLAYLIST" as const, icon: Music, label: "Playlist" },
  { type: "TEXT" as const, icon: Type, label: "Texte" },
  { type: "LOGO" as const, icon: Image, label: "Logo" },
  { type: "BROWSER" as const, icon: Globe, label: "Navigateur" },
  { type: "AUDIO" as const, icon: Music, label: "Audio" },
];

export default function StudioSourcesPanel({
  sources,
  onSourceAdd,
  onSourceDelete,
  onSourceToggleVisibility,
  onSourceToggleMute,
  onSourceVolumeChange,
  onSourceSettings,
}: StudioSourcesPanelProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sortedSources = [...sources].sort((a, b) => a.order - b.order);

  const getSourceIcon = (type: StudioSource["type"]) => {
    const sourceType = SOURCE_TYPES.find((st) => st.type === type);
    return sourceType ? sourceType.icon : Video;
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Sources</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-white transition"
            aria-label="Add Source"
          >
            <Plus size={16} />
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-2 bg-[#252535] rounded-lg shadow-xl border border-gray-700 z-10 w-48 max-h-64 overflow-y-auto">
              {SOURCE_TYPES.map((sourceType) => {
                const Icon = sourceType.icon;
                return (
                  <button
                    key={sourceType.type}
                    onClick={() => {
                      onSourceAdd(sourceType.type);
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] transition first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Icon size={16} />
                    <span className="text-sm">{sourceType.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedSources.map((source) => {
          const Icon = getSourceIcon(source.type);
          return (
            <div
              key={source.id}
              className="bg-[#252535] rounded-lg p-3 border border-transparent hover:border-gray-600 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#353545] rounded flex items-center justify-center">
                  <Icon size={16} className="text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{source.name}</p>
                  <p className="text-gray-500 text-xs uppercase">{source.type}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSourceSettings?.(source.id)}
                    className="p-1.5 bg-gray-700 text-gray-400 hover:text-white rounded transition"
                    aria-label="Settings"
                  >
                    <Settings size={14} />
                  </button>
                  <button
                    onClick={() => onSourceToggleVisibility(source.id)}
                    className={`p-1.5 rounded transition ${
                      source.isVisible ? "bg-emerald-600/20 text-emerald-400" : "bg-gray-700 text-gray-400 hover:text-white"
                    }`}
                    aria-label={source.isVisible ? "Hide" : "Show"}
                  >
                    {source.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  {source.type === "AUDIO" || source.type === "CAMERA" ? (
                    <button
                      onClick={() => onSourceToggleMute(source.id)}
                      className={`p-1.5 rounded transition ${
                        source.muted ? "bg-red-600/20 text-red-400" : "bg-gray-700 text-gray-400 hover:text-white"
                      }`}
                      aria-label={source.muted ? "Unmute" : "Mute"}
                    >
                      {source.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                  ) : null}

                  <button
                    onClick={() => onSourceDelete(source.id)}
                    className="p-1.5 bg-gray-700 text-gray-400 hover:text-red-400 rounded transition"
                    aria-label="Delete Source"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {(source.type === "AUDIO" || source.type === "CAMERA") && (
                <div className="mt-2 flex items-center gap-2">
                  <Volume2 size={12} className="text-gray-500" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={source.volume}
                    onChange={(e) => onSourceVolumeChange(source.id, parseInt(e.target.value))}
                    className="flex-1 h-1 accent-emerald-500"
                  />
                  <span className="text-xs text-gray-500 w-8 text-right">{source.volume}%</span>
                </div>
              )}
            </div>
          );
        })}

        {sortedSources.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm">Aucune source</p>
            <p className="text-xs mt-1">Ajoutez votre première source</p>
          </div>
        )}
      </div>
    </div>
  );
}
