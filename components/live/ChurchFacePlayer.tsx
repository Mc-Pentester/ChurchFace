"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2 } from "lucide-react";

interface ChurchFacePlayerProps {
  streamId: string;
  playbackUrl: string;
  webrtcUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
  onStateChange?: (state: "idle" | "loading" | "playing" | "paused" | "error") => void;
  onError?: (error: Error) => void;
}

export default function ChurchFacePlayer({
  streamId,
  playbackUrl,
  webrtcUrl,
  autoplay = false,
  muted = false,
  className = "",
  onStateChange,
  onError,
}: ChurchFacePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused" | "error">("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);

  useEffect(() => {
    if (autoplay && state === "idle") {
      play();
    }
  }, [autoplay, state]);

  const play = async () => {
    if (!videoRef.current) return;

    try {
      setState("loading");
      
      // Prefer WebRTC if available
      if (webrtcUrl) {
        await playWebRTC();
      } else {
        // Fallback to HLS or direct stream
        await playHLS();
      }
      
      setIsPlaying(true);
      setState("playing");
    } catch (error) {
      console.error("Error playing stream:", error);
      setState("error");
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const playWebRTC = async () => {
    if (!webrtcUrl || !videoRef.current) return;

    // In a real implementation, this would use WebRTC to connect to the stream
    // For now, we simulate with the playback URL
    videoRef.current.src = playbackUrl;
    await videoRef.current.play();
  };

  const playHLS = async () => {
    if (!videoRef.current) return;

    // In a real implementation, this would use HLS.js for HLS streams
    // For now, we use the direct playback URL
    videoRef.current.src = playbackUrl;
    await videoRef.current.play();
  };

  const pause = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    setState("paused");
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume / 100;
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVideoError = () => {
    setState("error");
    if (onError) {
      onError(new Error("Failed to load stream"));
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onError={handleVideoError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setState("paused");
        }}
      />

      {/* Loading State */}
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Error State */}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <p className="text-lg mb-2">Erreur de chargement du stream</p>
          <button
            onClick={play}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Idle State */}
      {state === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <button
            onClick={play}
            className="w-20 h-20 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center transition transform hover:scale-105"
          >
            <Play size={32} className="fill-current ml-1" />
          </button>
          <p className="mt-4 text-lg">Cliquez pour démarrer</p>
        </div>
      )}

      {/* Controls */}
      {showControls && state !== "idle" && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full h-1 bg-gray-600 rounded-full cursor-pointer">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-emerald-400 transition"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="fill-current ml-1" />}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-emerald-400 transition"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-20 accent-emerald-500"
                />
              </div>

              {/* Time */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Settings */}
              <button className="text-white hover:text-emerald-400 transition">
                <Settings size={20} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-emerald-400 transition"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Indicator */}
      {state === "playing" && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      {/* Stream Info */}
      {state === "playing" && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
          ChurchFace
        </div>
      )}
    </div>
  );
}
