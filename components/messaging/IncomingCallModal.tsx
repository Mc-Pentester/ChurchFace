"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { socket } from "@/lib/socket";

interface IncomingCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName: string;
  callerImage?: string | null;
  callType: "audio" | "video";
  callerId: string;
  currentUserId: string;
  onAccept: () => void;
}

export default function IncomingCallModal({
  isOpen,
  onClose,
  callerName,
  callerImage,
  callType,
  callerId,
  currentUserId,
  onAccept
}: IncomingCallModalProps) {
  const [isRinging, setIsRinging] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callIdRef = useRef<string>("");

  useEffect(() => {
    if (!isOpen) {
      stopRinging();
      return;
    }

    // Generate unique call ID
    callIdRef.current = `${callerId}-${currentUserId}-${Date.now()}`;

    // Play ringing sound
    playRinging();

    // Listen for call end
    const handleCallEnd = () => {
      stopRinging();
      onClose();
    };

    socket.on("call:end", handleCallEnd);

    return () => {
      socket.off("call:end", handleCallEnd);
      stopRinging();
    };
  }, [isOpen, callerId, currentUserId]);

  const playRinging = () => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(console.error);
    }
  };

  const stopRinging = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsRinging(false);
  };

  const handleReject = () => {
    socket.emit("call:end", {
      callId: callIdRef.current,
      recipientId: callerId
    });
    stopRinging();
    onClose();
  };

  const handleAccept = () => {
    stopRinging();
    onAccept();
  };

  if (!isOpen) return null;

  return (
    <>
      <audio ref={audioRef} src="/sounds/call.mp3" />
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-emerald-600 to-purple-600 rounded-3xl p-8 max-w-sm w-full text-center">
          {/* Caller Avatar */}
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden mx-auto mb-6 shadow-2xl">
            {callerImage ? (
              <img src={callerImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-emerald-600 font-bold text-5xl">
                {callerName[0]?.toUpperCase()}
              </span>
            )}
          </div>

          {/* Caller Info */}
          <h2 className="text-white text-2xl font-bold mb-2">{callerName}</h2>
          <p className="text-white/80 text-lg mb-8">
            {callType === "audio" ? "Appel audio" : "Appel vidéo"}
          </p>

          {/* Call Type Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              {callType === "audio" ? (
                <Phone size={32} className="text-white" />
              ) : (
                <Video size={32} className="text-white" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleReject}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-lg"
            >
              <PhoneOff size={24} />
            </button>
            <button
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition shadow-lg animate-pulse"
            >
              <Phone size={24} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
