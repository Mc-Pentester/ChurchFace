"use client";

import { useRef, useEffect, useState } from "react";

interface StudioProgramProps {
  stream?: MediaStream | null;
  muted?: boolean;
  className?: string;
  isLive?: boolean;
  isTransitioning?: boolean;
  transitionType?: "CUT" | "FADE" | "DISSOLVE" | "SLIDE";
}

export default function StudioProgram({ 
  stream, 
  muted = true, 
  className = "", 
  isLive = false,
  isTransitioning = false,
  transitionType = "CUT"
}: StudioProgramProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [opacity, setOpacity] = useState(1);
  const [transform, setTransform] = useState("translateX(0)");
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Cancel any pending play request
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {});
      playPromiseRef.current = null;
    }

    if (stream) {
      video.srcObject = stream;
      playPromiseRef.current = video.play().catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Video play error:', error);
        }
      });
    } else {
      video.srcObject = null;
    }

    return () => {
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
      }
      if (video.srcObject) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [stream]);

  // Handle transitions
  useEffect(() => {
    if (isTransitioning) {
      switch (transitionType) {
        case "FADE":
          setOpacity(0.5);
          setTimeout(() => setOpacity(1), 500);
          break;
        case "DISSOLVE":
          setOpacity(0.3);
          setTimeout(() => setOpacity(1), 750);
          break;
        case "SLIDE":
          setTransform("translateX(-100%)");
          setTimeout(() => setTransform("translateX(0)"), 600);
          break;
        case "CUT":
        default:
          setOpacity(1);
          setTransform("translateX(0)");
          break;
      }
    } else {
      setOpacity(1);
      setTransform("translateX(0)");
    }
  }, [isTransitioning, transitionType]);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover transition-all duration-500"
        style={{
          opacity,
          transform,
        }}
      />
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📺</div>
            <p className="text-sm">Aucun signal</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        PROGRAM
      </div>
      {isLive && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded animate-pulse">
          ● LIVE
        </div>
      )}
      {isTransitioning && (
        <div className="absolute bottom-2 left-2 bg-violet-600/80 text-white text-xs px-2 py-1 rounded">
          {transitionType} transition...
        </div>
      )}
    </div>
  );
}
