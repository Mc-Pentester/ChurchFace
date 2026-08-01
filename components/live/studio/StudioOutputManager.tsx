"use client";

import { useState } from "react";
import { Radio, Video, Plus, Trash2, Check, X, Settings } from "lucide-react";

interface OutputDestination {
  id: string;
  type: "CHURCHFACE" | "YOUTUBE" | "FACEBOOK" | "TWITCH" | "CUSTOM";
  name: string;
  enabled: boolean;
  status: "OFFLINE" | "CONNECTING" | "LIVE" | "ERROR";
  config?: {
    streamKey?: string;
    serverUrl?: string;
    rtmpUrl?: string;
  };
}

interface StudioOutputManagerProps {
  destinations: OutputDestination[];
  onDestinationToggle: (destinationId: string) => void;
  onDestinationConfig: (destinationId: string, config: any) => void;
  onDestinationDelete: (destinationId: string) => void;
  onStartAll: () => void;
  onStopAll: () => void;
}

export default function StudioOutputManager({
  destinations,
  onDestinationToggle,
  onDestinationConfig,
  onDestinationDelete,
  onStartAll,
  onStopAll,
}: StudioOutputManagerProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [configuringDestination, setConfiguringDestination] = useState<string | null>(null);
  const [streamKey, setStreamKey] = useState("");
  const [serverUrl, setServerUrl] = useState("");

  const getPlatformIcon = (type: OutputDestination["type"]) => {
    switch (type) {
      case "CHURCHFACE":
        return Radio;
      case "YOUTUBE":
        return Video;
      case "FACEBOOK":
        return Radio;
      case "TWITCH":
        return Video;
      default:
        return Radio;
    }
  };

  const getPlatformColor = (type: OutputDestination["type"]) => {
    switch (type) {
      case "CHURCHFACE":
        return "text-violet-400";
      case "YOUTUBE":
        return "text-red-500";
      case "FACEBOOK":
        return "text-blue-500";
      case "TWITCH":
        return "text-purple-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusColor = (status: OutputDestination["status"]) => {
    switch (status) {
      case "LIVE":
        return "bg-emerald-500";
      case "CONNECTING":
        return "bg-yellow-500 animate-pulse";
      case "ERROR":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleAddDestination = (type: OutputDestination["type"]) => {
    const newDestination: OutputDestination = {
      id: Date.now().toString(),
      type,
      name: type.toLowerCase(),
      enabled: true,
      status: "OFFLINE",
    };
    onDestinationConfig(newDestination.id, newDestination);
    setShowAddMenu(false);
    setConfiguringDestination(newDestination.id);
  };

  const handleSaveConfig = () => {
    if (configuringDestination) {
      onDestinationConfig(configuringDestination, {
        streamKey,
        serverUrl,
      });
      setConfiguringDestination(null);
      setStreamKey("");
      setServerUrl("");
    }
  };

  const enabledCount = destinations.filter((d) => d.enabled).length;
  const liveCount = destinations.filter((d) => d.status === "LIVE").length;

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Destinations</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Plus size={14} />
            <span>Ajouter</span>
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-2 bg-[#252535] border border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
              <button
                onClick={() => handleAddDestination("YOUTUBE")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
              >
                <Video size={14} className="text-red-500" />
                <span>YouTube</span>
              </button>
              <button
                onClick={() => handleAddDestination("FACEBOOK")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
              >
                <Radio size={14} className="text-blue-500" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleAddDestination("TWITCH")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
              >
                <Video size={14} className="text-purple-500" />
                <span>Twitch</span>
              </button>
              <button
                onClick={() => handleAddDestination("CUSTOM")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
              >
                <Radio size={14} />
                <span>Custom RTMP</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {destinations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Aucune destination configurée
          </div>
        ) : (
          destinations.map((destination) => {
            const Icon = getPlatformIcon(destination.type);
            const isConfiguring = configuringDestination === destination.id;

            return (
              <div
                key={destination.id}
                className="bg-[#252535] rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1a24] rounded-lg flex items-center justify-center">
                    <Icon size={18} className={getPlatformColor(destination.type)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{destination.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(destination.status)}`} />
                      <span className="text-gray-500 text-xs">{destination.status}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDestinationToggle(destination.id)}
                    className={`p-2 rounded-lg transition ${
                      destination.enabled
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {destination.enabled ? <Check size={14} /> : <X size={14} />}
                  </button>

                  <button
                    onClick={() => setConfiguringDestination(destination.id)}
                    className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 transition"
                  >
                    <Settings size={14} />
                  </button>

                  {destination.type !== "CHURCHFACE" && (
                    <button
                      onClick={() => onDestinationDelete(destination.id)}
                      className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {isConfiguring && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Stream Key</label>
                      <input
                        type="text"
                        value={streamKey || destination.config?.streamKey || ""}
                        onChange={(e) => setStreamKey(e.target.value)}
                        placeholder="xxxx-xxxx-xxxx-xxxx"
                        className="w-full bg-[#16161f] text-white placeholder-gray-500 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Server URL (RTMP)</label>
                      <input
                        type="text"
                        value={serverUrl || destination.config?.serverUrl || ""}
                        onChange={(e) => setServerUrl(e.target.value)}
                        placeholder="rtmp://a.rtmp.youtube.com/live2"
                        className="w-full bg-[#16161f] text-white placeholder-gray-500 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveConfig}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-1.5 rounded text-sm font-medium transition"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setConfiguringDestination(null);
                          setStreamKey("");
                          setServerUrl("");
                        }}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded text-sm font-medium transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
        <button
          onClick={onStartAll}
          disabled={enabledCount === 0}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition"
        >
          <Radio size={16} />
          <span>Démarrer tout ({enabledCount})</span>
        </button>
        <button
          onClick={onStopAll}
          disabled={liveCount === 0}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition"
        >
          <X size={16} />
          <span>Arrêter tout ({liveCount})</span>
        </button>
      </div>
    </div>
  );
}

