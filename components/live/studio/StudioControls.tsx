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
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col gap-3">
      <h3 className="text-white font-semibold text-sm">Contrôles</h3>

      {/* Main Controls */}
      <div className="flex items-center gap-2">
        {!isLive ? (
          <button
            onClick={onStartLive}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition"
          >
            <Play size={20} />
            <span>Démarrer le Live</span>
          </button>
        ) : (
          <button
            onClick={onStopLive}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
          >
            <Square size={20} />
            <span>Arrêter le Live</span>
          </button>
        )}
      </div>

      {/* Recording Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRecording}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
            isRecording
              ? "bg-red-600/20 text-red-400 border border-red-600"
              : "bg-[#252535] text-gray-300 hover:bg-[#353545]"
          }`}
        >
          <Circle size={16} className={isRecording ? "animate-pulse" : ""} />
          <span>{isRecording ? "Enregistrement..." : "Enregistrer"}</span>
        </button>
      </div>

      {/* Device Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onToggleCamera}
          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition ${
            isCameraEnabled
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600"
              : "bg-[#252535] text-gray-400 hover:bg-[#353545]"
          }`}
          aria-label={isCameraEnabled ? "Disable Camera" : "Enable Camera"}
        >
          {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          <span className="text-xs">Caméra</span>
        </button>

        <button
          onClick={onToggleMic}
          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition ${
            isMicEnabled
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600"
              : "bg-[#252535] text-gray-400 hover:bg-[#353545]"
          }`}
          aria-label={isMicEnabled ? "Disable Microphone" : "Enable Microphone"}
        >
          {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          <span className="text-xs">Micro</span>
        </button>

        <button
          onClick={onToggleScreenShare}
          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition ${
            isScreenSharing
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600"
              : "bg-[#252535] text-gray-400 hover:bg-[#353545]"
          }`}
          aria-label={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        >
          <MonitorUp size={20} />
          <span className="text-xs">Écran</span>
        </button>
      </div>

      {/* Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="flex-1 flex items-center justify-center gap-2 bg-[#252535] text-gray-300 hover:bg-[#353545] py-2 rounded-lg transition"
        >
          <Settings size={18} />
          <span>Paramètres</span>
        </button>
      </div>

      {/* Status Indicators */}
      {isLive && (
        <div className="flex items-center justify-center gap-2 py-2 bg-red-600/10 border border-red-600 rounded-lg">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <span className="text-red-400 text-sm font-semibold">EN DIRECT</span>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center justify-center gap-2 py-2 bg-red-600/10 border border-red-600 rounded-lg">
          <Circle size={12} className="text-red-600 animate-pulse" />
          <span className="text-red-400 text-sm">Enregistrement en cours</span>
        </div>
      )}
    </div>
  );
}
