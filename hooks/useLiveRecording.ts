"use client";

import { useRef, useState, useCallback } from "react";

interface UseLiveRecordingOptions {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
}

export function useLiveRecording({ onRecordingComplete, onError }: UseLiveRecordingOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startRecording = useCallback((stream: MediaStream) => {
    try {
      chunksRef.current = [];
      
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: mimeType });
        const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
        
        setBlob(recordedBlob);
        setIsRecording(false);
        setDuration(0);
        
        onRecordingComplete?.(recordedBlob, duration);
      };

      mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`);
        onError?.(error);
        setIsRecording(false);
      };

      mediaRecorder.start(1000); // Collect chunks every second
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start recording');
      onError?.(err);
    }
  }, [onRecordingComplete, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    startTimeRef.current = null;
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      
      if (startTimeRef.current) {
        timerRef.current = setInterval(() => {
          setDuration(Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000));
        }, 1000);
      }
    }
  }, []);

  const resetRecording = useCallback(() => {
    setBlob(null);
    setDuration(0);
    chunksRef.current = [];
    startTimeRef.current = null;
  }, []);

  // Cleanup on unmount
  useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    duration,
    blob,
    formatDuration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}
