"use client";

import { useState, useCallback } from "react";
import { 
  Radio, 
  Video, 
  Circle, 
  Square, 
  Play, 
  Pause, 
  Settings, 
  Maximize, 
  Users, 
  Clock, 
  Wifi, 
  Activity,
  MoreHorizontal
} from "lucide-react";

export type StudioMode = "RADIO" | "VIDEO";

interface StudioTopBarProps {
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  broadcastName?: string;
  churchName?: string;
  isLive: boolean;
  elapsedTime: number;
  viewerCount: number;
  networkQuality: "EXCELLENT" | "GOOD" | "POOR" | "DISCONNECTED";
  liveKitStatus: "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "ERROR";
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export default function StudioTopBar({
  mode,
  onModeChange,
  broadcastName,
  churchName,
  isLive,
  elapsedTime,
  viewerCount,
  networkQuality,
  liveKitStatus,
  onStartStreaming,
  onStopStreaming,
  onStartRecording,
  onStopRecording,
  isRecording,
  onOpenSettings,
  onToggleFullscreen,
}: StudioTopBarProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getNetworkQualityColor = () => {
    switch (networkQuality) {
      case "EXCELLENT":
        return "text-green-500";
      case "GOOD":
        return "text-yellow-500";
      case "POOR":
        return "text-orange-500";
      case "DISCONNECTED":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getLiveKitStatusColor = () => {
    switch (liveKitStatus) {
      case "CONNECTED":
        return "text-green-500";
      case "CONNECTING":
        return "text-yellow-500";
      case "DISCONNECTED":
        return "text-gray-500";
      case "ERROR":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="h-14 bg-[#0f0f1a] border-b border-[#2a2a4a] flex items-center justify-between px-4">
      {/* Left Section - Mode Toggle and Info */}
      <div className="flex items-center gap-6">
        {/* Mode Toggle */}
        <div className="flex bg-[#1a1a2e] rounded-lg p-1">
          <button
            onClick={() => onModeChange("RADIO")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              mode === "RADIO"
                ? "bg-emerald-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#2a2a4a]"
            }`}
          >
            <Radio size={16} />
            RADIO
          </button>
          <button
            onClick={() => onModeChange("VIDEO")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
              mode === "VIDEO"
                ? "bg-emerald-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#2a2a4a]"
            }`}
          >
            <Video size={16} />
            VIDÉO
          </button>
        </div>

        <div className="h-8 w-px bg-[#2a2a4a]" />

        {/* Broadcast Info */}
        <div className="flex flex-col">
          <div className="text-white font-semibold text-sm">
            {broadcastName || "Live"}
          </div>
          <div className="text-gray-400 text-xs">
            {churchName || "Église"}
          </div>
        </div>
      </div>

      {/* Center Section - Status and Stats */}
      <div className="flex items-center gap-8">
        {/* ON AIR Indicator */}
        {isLive && (
          <div className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full" />
            <span className="text-white text-sm font-bold">ON AIR</span>
          </div>
        )}

        {/* Elapsed Time */}
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={16} />
          <span className="text-white font-mono text-lg">
            {formatElapsedTime(elapsedTime)}
          </span>
        </div>

        {/* Viewer Count */}
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={16} />
          <span className="text-white font-semibold">{viewerCount}</span>
        </div>

        {/* Network Quality */}
        <div className="flex items-center gap-2 text-gray-400">
          <Wifi size={16} />
          <span className={`text-sm font-medium ${getNetworkQualityColor()}`}>
            {networkQuality}
          </span>
        </div>

        {/* LiveKit Status */}
        <div className="flex items-center gap-2 text-gray-400">
          <Activity size={16} />
          <span className={`text-sm font-medium ${getLiveKitStatusColor()}`}>
            {liveKitStatus}
          </span>
        </div>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-3">
        {/* Streaming Controls */}
        {!isLive ? (
          <button
            onClick={onStartStreaming}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Circle size={16} fill="currentColor" />
            Start Streaming
          </button>
        ) : (
          <button
            onClick={onStopStreaming}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Square size={16} />
            Stop Streaming
          </button>
        )}

        {/* Recording Controls */}
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`p-2.5 rounded-lg transition ${
            isRecording 
              ? "bg-red-600 text-white" 
              : "bg-[#1a1a2e] text-gray-400 hover:bg-[#2a2a4a] hover:text-white"
          }`}
        >
          {isRecording ? <Square size={20} /> : <Circle size={20} />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 bg-[#1a1a2e] text-gray-400 hover:bg-[#2a2a4a] hover:text-white rounded-lg transition"
        >
          <Settings size={20} />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="p-2.5 bg-[#1a1a2e] text-gray-400 hover:bg-[#2a2a4a] hover:text-white rounded-lg transition"
        >
          <Maximize size={20} />
        </button>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 bg-[#1a1a2e] text-gray-400 hover:bg-[#2a2a4a] hover:text-white rounded-lg transition"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg shadow-xl z-50">
              <div className="p-2 space-y-1">
                <button className="w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a4a] rounded-md text-sm">
                  Reset Layout
                </button>
                <button className="w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a4a] rounded-md text-sm">
                  Export Settings
                </button>
                <button className="w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a4a] rounded-md text-sm">
                  Import Settings
                </button>
                <div className="h-px bg-[#2a2a4a] my-1" />
                <button className="w-full px-3 py-2 text-left text-red-400 hover:bg-[#2a2a4a] rounded-md text-sm">
                  Clear Cache
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
