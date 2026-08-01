"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AudioChannel {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  peak: number;
  color: string;
}

interface UseAudioMixerOptions {
  stream?: MediaStream | null;
  onPeakUpdate?: (channelId: string, peak: number) => void;
}

export function useAudioMixer({ stream, onPeakUpdate }: UseAudioMixerOptions = {}) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPeak, setCurrentPeak] = useState(0);

  // Initialize Web Audio API
  const initializeAudio = useCallback(async () => {
    if (!stream || isInitialized) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(gainNode);
      gainNode.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize audio mixer:", error);
    }
  }, [stream, isInitialized]);

  // Measure audio levels
  const measureAudioLevels = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const measure = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume (RMS-like)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Convert to 0-100 scale
      const peak = Math.min(100, (average / 255) * 100 * 2);
      
      setCurrentPeak(peak);
      
      if (onPeakUpdate) {
        onPeakUpdate("main", peak);
      }

      animationFrameRef.current = requestAnimationFrame(measure);
    };

    measure();
  }, [onPeakUpdate]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, []);

  // Mute/Unmute
  const setMuted = useCallback((muted: boolean) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = muted ? 0 : 1;
    }
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    gainNodeRef.current = null;
  }, []);

  // Initialize when stream changes
  useEffect(() => {
    if (stream) {
      initializeAudio();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [stream, initializeAudio, cleanup]);

  // Start measuring when initialized
  useEffect(() => {
    if (isInitialized) {
      measureAudioLevels();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, measureAudioLevels]);

  return {
    currentPeak,
    setVolume,
    setMuted,
    isInitialized,
  };
}
