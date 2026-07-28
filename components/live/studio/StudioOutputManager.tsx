"use client";

import { useState } from "react";
import { Video, Radio, Check, X, Settings, Globe } from "lucide-react";

interface OutputDestination {
  id: string;
  type: "CHURCHFACE" | "YOUTUBE" | "FACEBOOK" | "TWITCH" | "RTMP";
  enabled: boolean;
  config?: {
    streamKey?: string;
    streamUrl?: string;
    [key: string]: any;
  };
  status: "OFFLINE" | "CONNECTING" | "LIVE" | "ERROR";
}

interface StudioOutputManagerProps {
  destinations: OutputDestination[];
  onDestinationToggle: (destinationId: string) => void;
  onDestinationConfig: (destinationId: string, config: any) => void;
  onDestinationDelete: (destinationId: string) => void;
  onStartAll: () => void;
  onStopAll: () => void;
}

const DESTINATION_TYPES = [
  {
    type: "CHURCHFACE" as const,
    icon: Radio,
    label: "ChurchFace",
    description: "Diffusion native sur ChurchFace",
    required: true,
  },
  {
    type: "YOUTUBE" as const,
    icon: Video,
    label: "YouTube",
    description: "Diffusion sur YouTube Live",
    required: false,
  },
  {
    type: "FACEBOOK" as const,
    icon: Globe,
    label: "Facebook",
    description: "Diffusion sur Facebook Live",
    required: false,
  },
  {
    type: "TWITCH" as const,
    icon: Video,
    label: "Twitch",
    description: "Diffusion sur Twitch",
    required: false,
  },
  {
    type: "RTMP" as const,
    icon: Radio,
    label: "RTMP Personnalisé",
    description: "Diffusion RTMP personnalisée",
    required: false,
  },
];

export default function StudioOutputManager({
  destinations,
  onDestinationToggle,
  onDestinationConfig,
  onDestinationDelete,
  onStartAll,
  onStopAll,
}: StudioOutputManagerProps) {
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [configData, setConfigData] = useState({ streamKey: "", streamUrl: "" });

  const handleConfigure = (destination: OutputDestination) => {
    setConfiguringId(destination.id);
    setConfigData({
      streamKey: destination.config?.streamKey || "",
      streamUrl: destination.config?.streamUrl || "",
    });
  };

  const handleSaveConfig = () => {
    if (configuringId) {
      onDestinationConfig(configuringId, configData);
      setConfiguringId(null);
    }
  };

  const handleCancelConfig = () => {
    setConfiguringId(null);
    setConfigData({ streamKey: "", streamUrl: "" });
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

  const getDestinationIcon = (type: OutputDestination["type"]) => {
    const destType = DESTINATION_TYPES.find((dt) => dt.type === type);
    return destType ? destType.icon : Radio;
  };

  const anyEnabled = destinations.some((d) => d.enabled);
  const anyLive = destinations.some((d) => d.status === "LIVE");

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Destinations</h3>
        <div className="flex gap-2">
          {anyLive ? (
            <button onClick={onStopAll} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition">
              Arrêter tout
            </button>
          ) : (
            <button
              onClick={onStartAll}
              disabled={!anyEnabled}
              className={`px-3 py-1.5 text-xs rounded transition ${
                anyEnabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              Démarrer tout
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {destinations.map((destination) => {
          const Icon = getDestinationIcon(destination.type);
          const destType = DESTINATION_TYPES.find((dt) => dt.type === destination.type);

          return (
            <div key={destination.id} className="bg-[#252535] rounded-lg p-3 border border-transparent hover:border-gray-600 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#353545] rounded flex items-center justify-center">
                  <Icon size={18} className="text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{destType?.label}</p>
                    {destType?.required && <span className="text-xs text-emerald-400">(Requis)</span>}
                  </div>
                  <p className="text-gray-500 text-xs">{destType?.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(destination.status)}`} />
                  <button
                    onClick={() => onDestinationToggle(destination.id)}
                    className={`p-1.5 rounded transition ${
                      destination.enabled ? "bg-emerald-600/20 text-emerald-400" : "bg-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    {destination.enabled ? <Check size={14} /> : <X size={14} />}
                  </button>

                  {destination.type !== "CHURCHFACE" && (
                    <>
                      <button onClick={() => handleConfigure(destination)} className="p-1.5 bg-gray-700 text-gray-400 hover:text-white rounded transition">
                        <Settings size={14} />
                      </button>
                      <button onClick={() => onDestinationDelete(destination.id)} className="p-1.5 bg-gray-700 text-gray-400 hover:text-red-400 rounded transition">
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {configuringId === destination.id && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                  {destination.type === "RTMP" && (
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">URL du serveur RTMP</label>
                      <input
                        type="text"
                        value={configData.streamUrl}
                        onChange={(e) => setConfigData({ ...configData, streamUrl: e.target.value })}
                        className="w-full bg-gray-700 text-white text-sm px-3 py-2 rounded outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="rtmp://..."
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Clé de stream</label>
                    <input
                      type="text"
                      value={configData.streamKey}
                      onChange={(e) => setConfigData({ ...configData, streamKey: e.target.value })}
                      className="w-full bg-gray-700 text-white text-sm px-3 py-2 rounded outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Entrez la clé..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveConfig} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition">
                      Enregistrer
                    </button>
                    <button onClick={handleCancelConfig} className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {destinations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-3xl mb-2">📡</div>
            <p className="text-sm">Aucune destination</p>
            <p className="text-xs mt-1">Ajoutez une destination de diffusion</p>
          </div>
        )}
      </div>
    </div>
  );
}
