"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Video, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Maximize2, Minimize2 } from "lucide-react";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "audio" | "video";
  recipientName: string;
  recipientImage?: string | null;
}

export default function CallModal({ isOpen, onClose, callType, recipientName, recipientImage }: CallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      setIsConnected(false);
      return;
    }

    // Simulate connection after 2 seconds
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    // Update call duration
    const durationInterval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(durationInterval);
    };
  }, [isOpen]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/90 z-50 flex items-center justify-center ${isFullscreen ? "" : "p-4"}`}>
      <div className={`bg-gray-900 rounded-2xl overflow-hidden ${isFullscreen ? "w-full h-full" : "w-full max-w-4xl"}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
              {recipientImage ? (
                <img src={recipientImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-emerald-600 font-bold text-xl">
                  {recipientName[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{recipientName}</h3>
              <p className="text-white/80 text-sm">
                {isConnected ? formatDuration(callDuration) : "Appel en cours..."}
              </p>
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-white/20 transition text-white"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        {/* Video Area */}
        {callType === "video" && (
          <div className="relative bg-gray-800 aspect-video">
            {/* Remote Video */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isConnected ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    {recipientImage ? (
                      <img src={recipientImage} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-gray-400 font-bold text-3xl">
                        {recipientName[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-white">Appel en cours...</p>
                </div>
              )}
            </div>

            {/* Local Video */}
            {!isVideoOff && (
              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Audio Call */}
        {callType === "audio" && (
          <div className="bg-gray-800 p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-purple-500 flex items-center justify-center mb-6">
              {recipientImage ? (
                <img src={recipientImage} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-white font-bold text-5xl">
                  {recipientName[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <h3 className="text-white text-2xl font-semibold mb-2">{recipientName}</h3>
            <p className="text-gray-400">
              {isConnected ? formatDuration(callDuration) : "Appel en cours..."}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-gray-900 p-6 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition ${
              isMuted ? "bg-red-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {callType === "video" && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition ${
                isVideoOff ? "bg-red-500 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
