"use client";

import { Play, Square, Video, VideoOff, Mic, MicOff, MonitorUp, Settings, Circle } from "lucide-react";

interface StudioControlsProps {
  isLive: boolean;
  isRecording: boolean;
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
  isScreenSharing: boolean;
  onStartLive: () => void;
  onStopLive: () => void;
  onToggleRecording: () => void;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleScreenShare: () => void;
  onOpenSettings: () => void;
}

export default function StudioControls({
  isLive,
  isRecording,
  isCameraEnabled,
  isMicEnabled,
  isScreenSharing,
  onStartLive,
  onStopLive,
  onToggleRecording,
  onToggleCamera,
  onToggleMic,
  onToggleScreenShare,
  onOpenSettings,
}: StudioControlsProps) {
  return (
    <div className="bg-[#16161f] rounded-lg p-3 flex flex-col gap-2">
      <h3 className="text-white font-semibold text-xs">Contrôles</h3>

      {/* Main Controls */}
      <div className="flex items-center gap-2">
        {!isLive ? (
          <button
            onClick={onStartLive}
            className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold transition text-xs"
          >
            <Play size={16} />
            <span>Live</span>
          </button>
        ) : (
          <button
            onClick={onStopLive}
            className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition text-xs"
          >
            <Square size={16} />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Recording Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRecording}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-medium transition text-xs ${
            isRecording
              ? "bg-red-600/20 text-red-400 border border-red-600"
              : "bg-[#252535] text-gray-300 hover:bg-[#353545]"
          }`}
        >
          <Circle size={12} className={isRecording ? "animate-pulse" : ""} />
          <span>{isRecording ? "Rec..." : "Enregistrer"}</span>
        </button>
      </div>

      {/* Device Controls */}
      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={onToggleCamera}
          className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg transition ${
            isCameraEnabled
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600"
              : "bg-[#252535] text-gray-400 hover:bg-[#353545]"
          }`}
          aria-label={isCameraEnabled ? "Disable Camera" : "Enable Camera"}
        >
          {isCameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}
          <span className="text-[10px]">Caméra</span>
        </button>

        <button
          onClick={onToggleMic}
          className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg transition ${
            isMicEnabled
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600"
              : "bg-[#252535] text-gray-400 hover:bg-[#353545]"
          }`}
          aria-label={isMicEnabled ? "Disable Microphone" : "Enable Microphone"}
        >
          {isMicEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          <span className="text-[10px]">Micro</span>
        </button>

        <button
          onClick={onToggleScreenShare}
          className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg transition ${
            isScreenSharing
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600"
              : "bg-[#252535] text-gray-400 hover:bg-[#353545]"
          }`}
          aria-label={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        >
          <MonitorUp size={16} />
          <span className="text-[10px]">Écran</span>
        </button>
      </div>

      {/* Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="flex-1 flex items-center justify-center gap-1 bg-[#252535] text-gray-300 hover:bg-[#353545] py-1.5 rounded-lg transition text-xs"
        >
          <Settings size={14} />
          <span>Paramètres</span>
        </button>
      </div>

      {/* Status Indicators */}
      {isLive && (
        <div className="flex items-center justify-center gap-1 py-1.5 bg-red-600/10 border border-red-600 rounded-lg">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          <span className="text-red-400 text-xs font-semibold">EN DIRECT</span>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center justify-center gap-1 py-1.5 bg-red-600/10 border border-red-600 rounded-lg">
          <Circle size={10} className="text-red-600 animate-pulse" />
          <span className="text-red-400 text-xs">Enregistrement</span>
        </div>
      )}
    </div>
  );
}
