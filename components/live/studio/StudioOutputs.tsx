"use client";

import { useState, useEffect } from "react";
import { Plus, Play, Square, Settings, AlertCircle, CheckCircle, Clock, X, Eye, EyeOff } from "lucide-react";

interface BroadcastOutput {
  id: string;
  type: "NATIVE_CHURCHFACE" | "RTMP_EXTERNAL" | "YOUTUBE" | "FACEBOOK" | "TWITCH" | "CUSTOM";
  name: string;
  enabled: boolean;
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

  if (isLoading) {
    return (
      <div className="bg-[#16161f] border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  const activeCount = outputs.filter(o => o.enabled && o.status === "ACTIVE").length;

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Outputs
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            activeCount > 0 ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
          }`}>
            {activeCount} ACTIVE
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Output Form */}
      {showAddForm && (
        <div className="mb-4 bg-[#0f0f17] border border-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Add New Output</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Output Name (e.g., YouTube Main)"
              value={newOutput.name}
              onChange={(e) => setNewOutput({ ...newOutput, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={newOutput.type}
              onChange={(e) => setNewOutput({ ...newOutput, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
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
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Stream Key"
              value={newOutput.streamKey}
              onChange={(e) => setNewOutput({ ...newOutput, streamKey: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddOutput}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add Output
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outputs List */}
      <div className="space-y-3">
        {outputs.map((output) => (
          <div
            key={output.id}
            className="bg-[#0f0f17] border border-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(output.status)}
                <div>
                  <h4 className="text-white font-medium">{output.name}</h4>
                  <p className="text-gray-400 text-sm">{output.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleOutput(output.id, !output.enabled)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    output.enabled
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {output.enabled ? "Active" : "Inactive"}
                </button>
                {output.type !== "NATIVE_CHURCHFACE" && (
                  <button
                    onClick={() => handleDeleteOutput(output.id)}
                    className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Output Details */}
            {output.rtmpUrl && (
              <div className="mt-3 pt-3 border-t border-gray-800 space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">RTMP URL:</span>
                  <p className="text-white font-mono text-xs break-all">{output.rtmpUrl}</p>
                </div>
                {output.streamKey && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-400">Stream Key:</span>
                      <p className="text-white font-mono text-xs">
                        {showStreamKey[output.id] ? output.streamKey : maskStreamKey(output.streamKey)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleStreamKeyVisibility(output.id)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      {showStreamKey[output.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Info */}
            {output.status === "ACTIVE" && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-green-400 text-sm">● Streaming to {output.name}</p>
              </div>
            )}

            {output.status === "ERROR" && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-red-400 text-sm">● Connection error - check RTMP URL and stream key</p>
              </div>
            )}

            {output.status === "CONNECTING" && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-yellow-400 text-sm">● Connecting...</p>
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
  );
}
