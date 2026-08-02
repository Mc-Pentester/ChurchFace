"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Link, Check, X } from "lucide-react";
import { rtmpRelayService, RelayDestination } from "@/lib/rtmp/RtmpRelayService";

// Custom SVG icons for social media platforms
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

interface StudioMultistreamProps {
  isLive: boolean;
  onDestinationAdd: (destination: Omit<RelayDestination, "id" | "status" | "reconnectAttempts">) => void;
  onDestinationRemove: (id: string) => void;
  onDestinationToggle: (id: string, enabled: boolean) => void;
}

const PLATFORMS = [
  { type: "YOUTUBE" as const, icon: YoutubeIcon, label: "YouTube", color: "text-red-500" },
  { type: "FACEBOOK" as const, icon: FacebookIcon, label: "Facebook", color: "text-blue-500" },
  { type: "TWITCH" as const, icon: TwitchIcon, label: "Twitch", color: "text-purple-500" },
];

export default function StudioMultistream({
  isLive,
  onDestinationAdd,
  onDestinationRemove,
  onDestinationToggle,
}: StudioMultistreamProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"YOUTUBE" | "FACEBOOK" | "TWITCH" | null>(null);
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [destinations, setDestinations] = useState<RelayDestination[]>([]);

  // Refresh destinations from service
  const refreshDestinations = () => {
    setDestinations(rtmpRelayService.getAllDestinations());
  };

  // Initial load
  useEffect(() => {
    refreshDestinations();
  }, []);

  const handleAddDestination = () => {
    if (!selectedPlatform || !rtmpUrl || !streamKey) return;

    const newDestination = rtmpRelayService.addDestination({
      type: selectedPlatform,
      name: `${selectedPlatform.charAt(0) + selectedPlatform.slice(1).toLowerCase()} Stream`,
      enabled: true,
      rtmpUrl,
      streamKey,
    });

    onDestinationAdd(newDestination);
    refreshDestinations();
    setShowAddForm(false);
    setSelectedPlatform(null);
    setRtmpUrl("");
    setStreamKey("");
  };

  const handleToggleDestination = (id: string, enabled: boolean) => {
    rtmpRelayService.updateDestination(id, { enabled });
    onDestinationToggle(id, enabled);
    refreshDestinations();
  };

  const handleRemoveDestination = (id: string) => {
    rtmpRelayService.removeDestination(id);
    onDestinationRemove(id);
    refreshDestinations();
  };

  const getStatusColor = (status: RelayDestination["status"]) => {
    switch (status) {
      case "LIVE":
        return "bg-emerald-500";
      case "CONNECTING":
        return "bg-yellow-500";
      case "ERROR":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: RelayDestination["status"]) => {
    switch (status) {
      case "LIVE":
        return "En direct";
      case "CONNECTING":
        return "Connexion...";
      case "ERROR":
        return "Erreur";
      default:
        return "Hors ligne";
    }
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Multistreaming</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isLive}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-white transition"
            aria-label="Add Destination"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Add Destination Form */}
      {showAddForm && (
        <div className="bg-[#252535] rounded-lg p-4 mb-4 space-y-3">
          <div className="flex gap-2">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.type}
                  onClick={() => setSelectedPlatform(platform.type)}
                  className={`flex-1 flex items-center justify-center p-2 rounded-lg transition ${
                    selectedPlatform === platform.type
                      ? "bg-emerald-600/20 border-2 border-emerald-500"
                      : "bg-[#353545] border-2 border-transparent hover:border-gray-600"
                  }`}
                  title={platform.label}
                >
                  <Icon className={`${platform.color} w-6 h-6`} />
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">URL RTMP</label>
            <input
              type="text"
              value={rtmpUrl}
              onChange={(e) => setRtmpUrl(e.target.value)}
              placeholder="rtmp://a.rtmp.youtube.com/live2"
              className="w-full bg-[#353545] text-white placeholder-gray-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Clé de stream</label>
            <input
              type="password"
              value={streamKey}
              onChange={(e) => setStreamKey(e.target.value)}
              placeholder="xxxx-xxxx-xxxx-xxxx"
              className="w-full bg-[#353545] text-white placeholder-gray-500 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddDestination}
              disabled={!selectedPlatform || !rtmpUrl || !streamKey}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold text-sm transition"
            >
              Ajouter
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setSelectedPlatform(null);
                setRtmpUrl("");
                setStreamKey("");
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold text-sm transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Destinations List */}
      <div className="space-y-2">
        {destinations.map((dest) => {
          const Platform = PLATFORMS.find(p => p.type === dest.type)?.icon || Link;
          const platformColor = PLATFORMS.find(p => p.type === dest.type)?.color || "text-gray-400";
          return (
            <div
              key={dest.id}
              className="bg-[#252535] rounded-lg p-3 border border-transparent hover:border-gray-600 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#353545] rounded-lg flex items-center justify-center">
                  <Platform className={`${platformColor} w-5 h-5`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(dest.status)}`} />
                    <p className="text-gray-500 text-xs">{getStatusText(dest.status)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleDestination(dest.id, !dest.enabled)}
                    disabled={isLive}
                    className={`p-2 rounded-lg transition ${
                      dest.enabled
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "bg-gray-700 text-gray-400 hover:text-white"
                    } disabled:cursor-not-allowed`}
                    aria-label={dest.enabled ? "Disable" : "Enable"}
                  >
                    {dest.enabled ? <Check size={16} /> : <X size={16} />}
                  </button>

                  <button
                    onClick={() => handleRemoveDestination(dest.id)}
                    disabled={isLive}
                    className="p-2 bg-gray-700 text-gray-400 hover:text-red-400 rounded-lg transition disabled:cursor-not-allowed"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {dest.lastError && (
                <p className="text-red-400 text-xs mt-2">{dest.lastError}</p>
              )}
            </div>
          );
        })}

        {destinations.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <div className="text-3xl mb-2">📡</div>
            <p>Aucune destination configurée</p>
            <p className="text-xs mt-1">Ajoutez YouTube, Facebook ou Twitch</p>
          </div>
        )}
      </div>
    </div>
  );
}
