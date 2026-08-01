"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Eye, Clock, TrendingUp, Activity } from "lucide-react";

interface StudioStatsProps {
  broadcastId: string;
  isLive: boolean;
}

interface StreamStats {
  viewerCount: number;
  peakViewers: number;
  duration: number;
  bitrate: number;
  fps: number;
  droppedFrames: number;
}

export default function StudioStats({ broadcastId, isLive }: StudioStatsProps) {
  const [stats, setStats] = useState<StreamStats>({
    viewerCount: 0,
    peakViewers: 0,
    duration: 0,
    bitrate: 0,
    fps: 30,
    droppedFrames: 0,
  });
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!isLive) {
      startTimeRef.current = null;
      setStats({
        viewerCount: 0,
        peakViewers: 0,
        duration: 0,
        bitrate: 0,
        fps: 30,
        droppedFrames: 0,
      });
      return;
    }

    // Start timer when going live
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const now = new Date();
        const duration = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
        
        setStats((prev) => ({
          ...prev,
          duration,
        }));
      }
    }, 1000);

    // TODO: Integrate with LiveKit to get real stats
    // In production, use LiveKit's Room.getStats() or Egress API
    // For now, showing 0 for streaming metrics until backend integration

    return () => clearInterval(interval);
  }, [isLive, broadcastId]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBitrate = (bps: number) => {
    if (bps >= 1000000) {
      return `${(bps / 1000000).toFixed(1)} Mbps`;
    }
    return `${(bps / 1000).toFixed(0)} kbps`;
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4">
      <h3 className="text-white font-semibold text-sm mb-4">Statistiques en direct</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Viewer Count */}
        <div className="bg-[#252535] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye size={14} className="text-violet-400" />
            <span className="text-gray-400 text-xs">Spectateurs</span>
          </div>
          <p className="text-white text-xl font-bold">{stats.viewerCount.toLocaleString()}</p>
          <p className="text-gray-500 text-xs">Max: {stats.peakViewers.toLocaleString()}</p>
        </div>

        {/* Duration */}
        <div className="bg-[#252535] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-emerald-400" />
            <span className="text-gray-400 text-xs">Durée</span>
          </div>
          <p className="text-white text-xl font-bold">{formatDuration(stats.duration)}</p>
          <p className="text-gray-500 text-xs">Temps de diffusion</p>
        </div>

        {/* Bitrate */}
        <div className="bg-[#252535] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-gray-400 text-xs">Débit</span>
          </div>
          <p className="text-white text-xl font-bold">{formatBitrate(stats.bitrate)}</p>
          <p className="text-gray-500 text-xs">Upload actuel</p>
        </div>

        {/* FPS */}
        <div className="bg-[#252535] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-yellow-400" />
            <span className="text-gray-400 text-xs">FPS</span>
          </div>
          <p className="text-white text-xl font-bold">{stats.fps}</p>
          <p className="text-gray-500 text-xs">Images/sec</p>
        </div>
      </div>

      {/* Dropped Frames Warning */}
      {stats.droppedFrames > 0 && (
        <div className="mt-3 bg-red-600/20 border border-red-600/50 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-red-400" />
            <span className="text-red-400 text-xs">
              {stats.droppedFrames} images perdues
            </span>
          </div>
        </div>
      )}

      {/* Connection Quality */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs">Qualité de connexion</span>
          <span className="text-emerald-400 text-xs">Excellente</span>
        </div>
        <div className="h-1.5 bg-[#252535] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: "95%" }} />
        </div>
      </div>
    </div>
  );
}
