"use client";

import { useState, useEffect } from "react";
import { Plus, Play, Square, Settings, AlertCircle, CheckCircle, Clock, X, Eye, EyeOff, Crown, Copy } from "lucide-react";

interface BroadcastOutput {
  id: string;
  type: "NATIVE_CHURCHFACE" | "RTMP_EXTERNAL" | "YOUTUBE" | "FACEBOOK" | "TWITCH" | "CUSTOM";
  name: string;
  enabled: boolean;
  isPrimary?: boolean;
  platform?: string;
  rtmpUrl?: string;
  streamKey?: string;
  status: "OFFLINE" | "CONNECTING" | "ACTIVE" | "ERROR";
  config?: Record<string, any>;
}

interface StudioOutputsProps {
  broadcastId: string;
}

export default function StudioOutputs({ broadcastId }: StudioOutputsProps) {
  const [outputs, setOutputs] = useState<BroadcastOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExternalDestinations, setShowExternalDestinations] = useState(false);
  const [externalDestinations, setExternalDestinations] = useState<any[]>([]);
  const [churchfaceCredentials, setChurchfaceCredentials] = useState<any>(null);
  const [showChurchfaceCredentials, setShowChurchfaceCredentials] = useState(false);
  const [newOutput, setNewOutput] = useState({
    name: "",
    type: "RTMP_EXTERNAL" as const,
    rtmpUrl: "",
    streamKey: "",
  });
  const [showStreamKey, setShowStreamKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchOutputs();
  }, [broadcastId]);

  useEffect(() => {
    if (showExternalDestinations) {
      fetchExternalDestinations();
    }
  }, [showExternalDestinations, broadcastId]);

  const fetchOutputs = async () => {
    try {
      const response = await fetch(`/api/studio/${broadcastId}/outputs`);
      if (response.ok) {
        const data = await response.json();
        setOutputs(data);
      }
    } catch (error) {
      console.error("Failed to fetch outputs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExternalDestinations = async () => {
    try {
      const response = await fetch(`/api/studio/${broadcastId}/outputs/external`);
      if (response.ok) {
        const data = await response.json();
        setExternalDestinations(data.destinations || []);
      }
    } catch (error) {
      console.error("Failed to fetch external destinations:", error);
    }
  };

  const fetchChurchfaceCredentials = async () => {
    try {
      const response = await fetch(`/api/studio/${broadcastId}/outputs/churchface`);
      if (response.ok) {
        const data = await response.json();
        setChurchfaceCredentials(data);
        setShowChurchfaceCredentials(true);
      }
    } catch (error) {
      console.error("Failed to fetch ChurchFace credentials:", error);
    }
  };

  const handleAddExternalDestination = async (destinationId: string) => {
    try {
      const response = await fetch(`/api/studio/${broadcastId}/outputs/external`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId }),
      });

      if (response.ok) {
        await fetchOutputs();
        setShowExternalDestinations(false);
      }
    } catch (error) {
      console.error("Failed to add external destination:", error);
    }
  };

  const handleEnableMultistreaming = async () => {
    try {
      const response = await fetch(`/api/studio/${broadcastId}/outputs/multistream`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchOutputs();
      }
    } catch (error) {
      console.error("Failed to enable multistreaming:", error);
    }
  };

  const handleAddOutput = async () => {
    try {
      const response = await fetch(`/api/studio/${broadcastId}/outputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOutput),
      });

      if (response.ok) {
        await fetchOutputs();
        setShowAddForm(false);
        setNewOutput({ name: "", type: "RTMP_EXTERNAL", rtmpUrl: "", streamKey: "" });
      }
    } catch (error) {
      console.error("Failed to add output:", error);
    }
  };

  const handleToggleOutput = async (outputId: string, enabled: boolean) => {
    try {
      const endpoint = enabled ? "enable" : "disable";
      const response = await fetch(`/api/studio/${broadcastId}/outputs/${outputId}/${endpoint}`, {
        method: "POST",
      });

      if (response.ok) {
        await fetchOutputs();
      }
    } catch (error) {
      console.error("Failed to toggle output:", error);
    }
  };

  const handleDeleteOutput = async (outputId: string) => {
    if (!confirm("Are you sure you want to delete this output?")) return;

    try {
      const response = await fetch(`/api/studio/${broadcastId}/outputs/${outputId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchOutputs();
      }
    } catch (error) {
      console.error("Failed to delete output:", error);
    }
  };

  const getStatusIcon = (status: BroadcastOutput["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "ERROR":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "CONNECTING":
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const maskStreamKey = (key: string) => {
    if (!key || key.length < 4) return "****";
    return "*".repeat(key.length - 4) + key.slice(-4);
  };

  const toggleStreamKeyVisibility = (outputId: string) => {
    setShowStreamKey(prev => ({ ...prev, [outputId]: !prev[outputId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="bg-[#16161f] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  const activeCount = outputs.filter(o => o.enabled).length;
  const primaryOutput = outputs.find(o => o.isPrimary);
  const secondaryOutputs = outputs.filter(o => !o.isPrimary);

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-lg p-3 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4" />
          Outputs
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
            activeCount > 0 ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
          }`}>
            {activeCount} ACTIVE
          </span>
          <button
            onClick={handleEnableMultistreaming}
            className="px-2 py-0.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
            title="Enable all secondary outputs"
          >
            Multistream
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ChurchFace Credentials Section */}
      {primaryOutput && (
        <div className="mb-3 bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-700/50 rounded-lg p-3 shrink-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Crown className="w-4 h-4 text-violet-400 shrink-0" />
              <h4 className="text-white font-semibold text-xs truncate">ChurchFace Primary</h4>
              <span className="px-1.5 py-0.5 bg-violet-600/30 text-violet-300 text-xs rounded-full shrink-0">PRIMARY</span>
            </div>
            <button
              onClick={fetchChurchfaceCredentials}
              className="px-2 py-0.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs transition-colors shrink-0"
            >
              Show
            </button>
          </div>
          
          {showChurchfaceCredentials && churchfaceCredentials && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-gray-400 shrink-0 text-xs">RTMP:</span>
                <div className="flex items-center gap-1 min-w-0">
                  <code className="text-white font-mono text-xs bg-[#0f0f17] px-1.5 py-0.5 rounded truncate">{churchfaceCredentials.rtmpUrl}</code>
                  <button
                    onClick={() => copyToClipboard(churchfaceCredentials.rtmpUrl)}
                    className="p-0.5 text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-gray-400 shrink-0 text-xs">Key:</span>
                <div className="flex items-center gap-1 min-w-0">
                  <code className="text-white font-mono text-xs bg-[#0f0f17] px-1.5 py-0.5 rounded truncate">{churchfaceCredentials.streamKey}</code>
                  <button
                    onClick={() => copyToClipboard(churchfaceCredentials.streamKey)}
                    className="p-0.5 text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-gray-400 shrink-0 text-xs">URL:</span>
                <div className="flex items-center gap-1 min-w-0">
                  <code className="text-white font-mono text-xs bg-[#0f0f17] px-1.5 py-0.5 rounded truncate">{churchfaceCredentials.playbackUrl}</code>
                  <button
                    onClick={() => copyToClipboard(churchfaceCredentials.playbackUrl)}
                    className="p-0.5 text-gray-400 hover:text-white transition-colors shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {/* Add Output Form */}
        {showAddForm && (
          <div className="bg-[#0f0f17] border border-gray-800 rounded-lg p-3 shrink-0">
            <h4 className="text-white font-medium mb-2 text-sm">Add New Output</h4>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => { setShowAddForm(false); setShowExternalDestinations(true); }}
                className="flex-1 px-2 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs transition-colors"
              >
                From My Accounts
              </button>
              <button
                onClick={() => setShowExternalDestinations(false)}
                className="flex-1 px-2 py-1.5 bg-gray-700 text-white rounded-lg text-xs transition-colors"
              >
                Custom RTMP
              </button>
            </div>
            
            {!showExternalDestinations && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Output Name"
                  value={newOutput.name}
                  onChange={(e) => setNewOutput({ ...newOutput, name: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-xs"
                />
                <select
                  value={newOutput.type}
                  onChange={(e) => setNewOutput({ ...newOutput, type: e.target.value as any })}
                  className="w-full px-2 py-1.5 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="RTMP_EXTERNAL">RTMP Custom</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="TWITCH">Twitch</option>
                  <option value="CUSTOM">Custom</option>
                </select>
                <input
                  type="text"
                  placeholder="RTMP URL"
                  value={newOutput.rtmpUrl}
                  onChange={(e) => setNewOutput({ ...newOutput, rtmpUrl: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-xs"
                />
                <input
                  type="text"
                  placeholder="Stream Key"
                  value={newOutput.streamKey}
                  onChange={(e) => setNewOutput({ ...newOutput, streamKey: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-xs"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddOutput}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded-lg transition-colors text-xs"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* External Destinations Selection */}
        {showExternalDestinations && (
          <div className="bg-[#0f0f17] border border-gray-800 rounded-lg p-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium text-sm">Select from Your Accounts</h4>
              <button
                onClick={() => { setShowExternalDestinations(false); setShowAddForm(false); }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {externalDestinations.length === 0 ? (
              <div className="text-center py-3 text-gray-500 text-xs">
                <p>No external accounts configured</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {externalDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleAddExternalDestination(dest.id)}
                    className="w-full flex items-center justify-between p-2 bg-[#1a1a2e] border border-gray-700 rounded-lg hover:border-emerald-500 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-white font-medium text-xs truncate">{dest.name}</p>
                      <p className="text-gray-400 text-xs truncate">{dest.platform} • {dest.accountName}</p>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Outputs List */}
        <div className="space-y-2">
        {outputs.map((output) => (
          <div
            key={output.id}
            className={`bg-[#0f0f17] border rounded-lg p-3 ${output.isPrimary ? 'border-violet-700/50 bg-gradient-to-r from-violet-900/20 to-purple-900/20' : 'border-gray-800'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(output.status)}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-white font-medium text-xs truncate">{output.name}</h4>
                    {output.isPrimary && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-600/30 text-violet-300 text-xs rounded-full shrink-0">
                        <Crown className="w-2.5 h-2.5" />
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">{output.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleOutput(output.id, !output.enabled)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors ${
                    output.enabled
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  disabled={output.isPrimary}
                >
                  {output.enabled ? "Active" : "Inactive"}
                </button>
                {!output.isPrimary && (
                  <button
                    onClick={() => handleDeleteOutput(output.id)}
                    className="p-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Output Details */}
            {output.rtmpUrl && (
              <div className="mt-2 pt-2 border-t border-gray-800 space-y-1.5 text-xs">
                <div>
                  <span className="text-gray-400 text-xs">RTMP URL:</span>
                  <p className="text-white font-mono text-xs break-all">{output.rtmpUrl}</p>
                </div>
                {output.streamKey && (
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-gray-400 text-xs">Stream Key:</span>
                      <p className="text-white font-mono text-xs truncate">
                        {showStreamKey[output.id] ? output.streamKey : maskStreamKey(output.streamKey)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleStreamKeyVisibility(output.id)}
                      className="p-0.5 text-gray-400 hover:text-white transition-colors shrink-0 ml-1"
                    >
                      {showStreamKey[output.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Info */}
            {output.status === "ACTIVE" && (
              <div className="mt-2 pt-2 border-t border-gray-800">
                <p className="text-green-400 text-xs">● Streaming to {output.name}</p>
              </div>
            )}

            {output.status === "ERROR" && (
              <div className="mt-2 pt-2 border-t border-gray-800">
                <p className="text-red-400 text-xs">● Connection error</p>
              </div>
            )}

            {output.status === "CONNECTING" && (
              <div className="mt-2 pt-2 border-t border-gray-800">
                <p className="text-yellow-400 text-xs">● Connecting...</p>
              </div>
            )}
          </div>
        ))}

        {outputs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No outputs configured</p>
            <p className="text-sm">Click the + button to add your first output destination</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
