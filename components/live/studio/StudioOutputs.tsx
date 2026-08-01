"use client";

import { useState, useEffect } from "react";
import { outputManager } from "@/lib/livekit/OutputManager";
import { rtmpRelayService } from "@/lib/livekit/RTMPRelayService";
import { Play, Square, Settings, AlertCircle, CheckCircle, Clock, X } from "lucide-react";

export default function StudioOutputs() {
  const [status, setStatus] = useState(outputManager.getStatus());
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const callbackId = outputManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      outputManager.removeStatusChangeCallback(callbackId);
    };
  }, []);

  const handleStartStreaming = async () => {
    try {
      await outputManager.startStreaming();
      setIsStreaming(true);
    } catch (error) {
      console.error("Failed to start streaming:", error);
    }
  };

  const handleStopStreaming = async () => {
    try {
      await outputManager.stopStreaming();
      setIsStreaming(false);
    } catch (error) {
      console.error("Failed to stop streaming:", error);
    }
  };

  const handleToggleDestination = async (destinationId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await outputManager.enableDestination(destinationId);
      } else {
        await outputManager.disableDestination(destinationId);
      }
    } catch (error) {
      console.error(`Failed to toggle destination ${destinationId}:`, error);
    }
  };

  const getStatusIcon = (destStatus: "idle" | "active" | "error") => {
    switch (destStatus) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const destinations = [
    { id: "churchface", name: "ChurchFace", status: status.churchFace, enabled: true, locked: true },
    { id: "youtube", name: "YouTube", status: status.youtube, enabled: outputManager.getConfig().youtubeEnabled, locked: false },
    { id: "facebook", name: "Facebook", status: status.facebook, enabled: outputManager.getConfig().facebookEnabled, locked: false },
    { id: "twitch", name: "Twitch", status: status.twitch, enabled: outputManager.getConfig().twitchEnabled, locked: false },
  ];

  return (
    <div className="bg-[#16161f] border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Outputs
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.overallStatus === "streaming" ? "bg-green-500/20 text-green-400" :
            status.overallStatus === "error" ? "bg-red-500/20 text-red-400" :
            "bg-gray-500/20 text-gray-400"
          }`}>
            {status.overallStatus.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="bg-[#0f0f17] border border-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(dest.status)}
                <div>
                  <h4 className="text-white font-medium">{dest.name}</h4>
                  <p className="text-gray-400 text-sm">
                    {dest.status === "active" ? "● LIVE" : 
                     dest.status === "error" ? "● ERROR" : 
                     "● IDLE"}
                  </p>
                </div>
              </div>

              {!dest.locked && (
                <button
                  onClick={() => handleToggleDestination(dest.id, !dest.enabled)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    dest.enabled
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {dest.enabled ? "Active" : "Inactive"}
                </button>
              )}
            </div>

            {dest.status === "active" && (
              <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Bitrate</span>
                  <p className="text-white font-medium">
                    {dest.id === "churchface" ? "4500 kbps" : 
                     rtmpRelayService.getDestination(dest.id)?.bitrate || "0"} kbps
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">FPS</span>
                  <p className="text-white font-medium">
                    {dest.id === "churchface" ? "30" : 
                     rtmpRelayService.getDestination(dest.id)?.fps || "0"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Resolution</span>
                  <p className="text-white font-medium">1920x1080</p>
                </div>
              </div>
            )}

            {dest.status === "error" && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-red-400 text-sm">
                  {rtmpRelayService.getDestination(dest.id)?.lastError || "Connection error"}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Recording Status */}
        <div className="bg-[#0f0f17] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.recording)}
              <div>
                <h4 className="text-white font-medium">Recording</h4>
                <p className="text-gray-400 text-sm">
                  {status.recording === "active" ? "● RECORDING" : 
                   status.recording === "error" ? "● ERROR" : 
                   "● IDLE"}
                </p>
              </div>
            </div>
          </div>

          {status.recording === "active" && (
            <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Duration</span>
                <p className="text-white font-medium">00:00:00</p>
              </div>
              <div>
                <span className="text-gray-400">Size</span>
                <p className="text-white font-medium">0 MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mt-6 flex gap-3">
        {!isStreaming ? (
          <button
            onClick={handleStartStreaming}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Streaming
          </button>
        ) : (
          <button
            onClick={handleStopStreaming}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Square className="w-5 h-5" />
            Stop Streaming
          </button>
        )}
      </div>
    </div>
  );
}
