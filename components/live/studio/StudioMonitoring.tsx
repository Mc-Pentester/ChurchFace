"use client";

import { useState, useEffect } from "react";
import { liveKitService, ConnectionState } from "@/lib/livekit/LiveKitService";
import { monitoringService, MonitoringData } from "@/lib/livekit/MonitoringService";
import { Signal, Activity, Wifi, Clock, Video, Mic, Cpu, HardDrive, Users, TrendingUp } from "lucide-react";

export default function StudioMonitoring() {
  const [state, setState] = useState<ConnectionState>("idle");
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Start monitoring service
    monitoringService.startMonitoring();
    setIsMonitoring(true);

    // Subscribe to stats updates
    const callbackId = monitoringService.onStatsUpdate((data) => {
      setMonitoringData(data);
    });

    // Also track LiveKit connection state
    const stateInterval = setInterval(() => {
      const currentState = liveKitService.getState();
      setState(currentState);
    }, 1000);

    return () => {
      monitoringService.removeStatsCallback(callbackId);
      monitoringService.stopMonitoring();
      clearInterval(stateInterval);
      setIsMonitoring(false);
    };
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const getStateColor = () => {
    switch (state) {
      case "connected":
        return "text-emerald-400";
      case "connecting":
      case "reconnecting":
        return "text-yellow-400";
      case "error":
      case "disconnected":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getNetworkQualityColor = () => {
    if (!monitoringData) return "text-gray-400";
    const quality = monitoringService.getNetworkQuality();
    switch (quality) {
      case "excellent":
        return "text-emerald-400";
      case "good":
        return "text-green-400";
      case "fair":
        return "text-yellow-400";
      case "poor":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getHealthStatusColor = () => {
    if (!monitoringData) return "text-gray-400";
    const health = monitoringService.getHealthStatus();
    switch (health) {
      case "healthy":
        return "text-emerald-400";
      case "degraded":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Activity size={18} />
          Monitoring
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            monitoringService.getHealthStatus() === "healthy" ? "bg-emerald-500/20 text-emerald-400" :
            monitoringService.getHealthStatus() === "degraded" ? "bg-yellow-500/20 text-yellow-400" :
            "bg-red-500/20 text-red-400"
          }`}>
            {monitoringService.getHealthStatus().toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Connection State */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">État</span>
          <span className={`text-sm font-medium ${getStateColor()}`}>
            {state.toUpperCase()}
          </span>
        </div>

        {/* Network Quality */}
        {monitoringData && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Qualité réseau</span>
            <span className={`text-sm font-medium ${getNetworkQualityColor()}`}>
              {monitoringService.getNetworkQuality().toUpperCase()}
            </span>
          </div>
        )}

        {/* Uptime */}
        {monitoringData?.stream && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Clock size={14} />
              Temps
            </span>
            <span className="text-white text-sm font-mono">
              {formatUptime(monitoringData.stream.duration)}
            </span>
          </div>
        )}

        {/* Network Stats */}
        {monitoringData?.network && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Signal size={14} />
                Latence
              </span>
              <span className="text-white text-sm font-mono">
                {monitoringData.network.rtt.toFixed(0)} ms
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Wifi size={14} />
                Perte de paquets
              </span>
              <span className="text-white text-sm font-mono">
                {monitoringData.network.packetLoss.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Débit</span>
              <span className="text-white text-sm font-mono">
                {(monitoringData.network.bitrate / 1000).toFixed(1)} Mbps
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Video size={14} />
                FPS
              </span>
              <span className="text-white text-sm font-mono">
                {monitoringData.network.fps}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Résolution</span>
              <span className="text-white text-sm font-mono">
                {monitoringData.network.resolution.width}x{monitoringData.network.resolution.height}
              </span>
            </div>
          </>
        )}

        {/* System Stats */}
        {monitoringData?.system && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Cpu size={14} />
                CPU
              </span>
              <span className="text-white text-sm font-mono">
                {monitoringData.system.cpuUsage.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <HardDrive size={14} />
                Mémoire
              </span>
              <span className="text-white text-sm font-mono">
                {monitoringData.system.memoryUsage.toFixed(1)}%
              </span>
            </div>
          </>
        )}

        {/* Stream Stats */}
        {monitoringData?.stream && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Users size={14} />
                Spectateurs
              </span>
              <span className="text-white text-sm font-mono">
                {monitoringData.stream.viewers}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <TrendingUp size={14} />
                Données envoyées
              </span>
              <span className="text-white text-sm font-mono">
                {formatBytes(monitoringData.stream.bytesSent)}
              </span>
            </div>
          </>
        )}

        {/* Output Stats */}
        {monitoringData?.outputs && (
          <div className="pt-3 border-t border-gray-800 mt-3">
            <div className="text-gray-400 text-xs mb-2">SORTIES</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">ChurchFace</span>
                <span className={`font-medium ${
                  monitoringData.outputs.churchFace.status === "active" ? "text-green-400" :
                  monitoringData.outputs.churchFace.status === "error" ? "text-red-400" :
                  "text-gray-400"
                }`}>
                  {monitoringData.outputs.churchFace.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">YouTube</span>
                <span className={`font-medium ${
                  monitoringData.outputs.youtube.status === "active" ? "text-green-400" :
                  monitoringData.outputs.youtube.status === "error" ? "text-red-400" :
                  "text-gray-400"
                }`}>
                  {monitoringData.outputs.youtube.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Facebook</span>
                <span className={`font-medium ${
                  monitoringData.outputs.facebook.status === "active" ? "text-green-400" :
                  monitoringData.outputs.facebook.status === "error" ? "text-red-400" :
                  "text-gray-400"
                }`}>
                  {monitoringData.outputs.facebook.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Twitch</span>
                <span className={`font-medium ${
                  monitoringData.outputs.twitch.status === "active" ? "text-green-400" :
                  monitoringData.outputs.twitch.status === "error" ? "text-red-400" :
                  "text-gray-400"
                }`}>
                  {monitoringData.outputs.twitch.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Enregistrement</span>
                <span className={`font-medium ${
                  monitoringData.outputs.recording.status === "active" ? "text-green-400" :
                  monitoringData.outputs.recording.status === "error" ? "text-red-400" :
                  "text-gray-400"
                }`}>
                  {monitoringData.outputs.recording.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
