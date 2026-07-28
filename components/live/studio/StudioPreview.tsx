"use client";

import { useRef, useEffect } from "react";

interface StudioPreviewProps {
  stream?: MediaStream | null;
  muted?: boolean;
  className?: string;
}

export default function StudioPreview({ stream, muted = true, className = "" }: StudioPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
      video.play().catch(console.error);
    } else {
      video.srcObject = null;
    }

    return () => {
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">Aucun signal</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        PREVIEW
      </div>
    </div>
  );
}
