"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface AudioChannel {
  id: string;
  name: string;
  type: "MICROPHONE" | "DESKTOP_AUDIO" | "MEDIA" | "MUSIC" | "GUEST" | "SYSTEM";
  volume: number;
  muted: boolean;
  solo: boolean;
  balance: number; // -1 (left) to 1 (right)
  peak: number;
  rms: number;
  color: string;
  icon: string;
  deviceId?: string;
}

export interface AudioEffects {
  compression: {
    enabled: boolean;
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  noiseSuppression: {
    enabled: boolean;
    level: number;
  };
  echoCancellation: {
    enabled: boolean;
  };
  limiter: {
    enabled: boolean;
    threshold: number;
  };
  equalizer: {
    enabled: boolean;
    bands: number[]; // EQ bands in dB
  };
}

export interface AudioEngineConfig {
  sampleRate: number;
  bufferSize: number;
  outputVolume: number;
  outputMuted: boolean;
}

export function useAudioEngine(initialConfig?: Partial<AudioEngineConfig>) {
  const [channels, setChannels] = useState<AudioChannel[]>([]);
  const [config, setConfig] = useState<AudioEngineConfig>({
    sampleRate: 48000,
    bufferSize: 512,
    outputVolume: 100,
    outputMuted: false,
    ...initialConfig,
  });
  const [effects, setEffects] = useState<AudioEffects>({
    compression: { enabled: false, threshold: -24, ratio: 4, attack: 10, release: 100 },
    noiseSuppression: { enabled: false, level: 20 },
    echoCancellation: { enabled: true },
    limiter: { enabled: true, threshold: -1 },
    equalizer: { enabled: false, bands: [0, 0, 0, 0, 0, 0, 0, 0] },
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const pannerNodesRef = useRef<Map<string, StereoPannerNode>>(new Map());
  const sourceNodesRef = useRef<Map<string, MediaStreamAudioSourceNode>>(new Map());
  const channelAnalysersRef = useRef<Map<string, AnalyserNode>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const previousLevelsRef = useRef<Map<string, { peak: number; rms: number }>>(new Map());
  const channelsRef = useRef<AudioChannel[]>([]);

  // Keep channelsRef in sync with channels state
  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== "undefined" && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: config.sampleRate,
      });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [config.sampleRate]);

  // Channel management
  const addChannel = useCallback((channel: Omit<AudioChannel, "id" | "peak" | "rms">) => {
    const newChannel: AudioChannel = {
      ...channel,
      id: `channel_${Date.now()}_${Math.random()}`,
      peak: 0,
      rms: 0,
    };
    setChannels(prev => [...prev, newChannel]);

    // Create audio nodes
    if (audioContextRef.current) {
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = channel.volume / 100;
      gainNodesRef.current.set(newChannel.id, gainNode);

      const pannerNode = audioContextRef.current.createStereoPanner();
      pannerNode.pan.value = channel.balance;
      pannerNodesRef.current.set(newChannel.id, pannerNode);
    }

    return newChannel;
  }, []);

  const updateChannel = useCallback((channelId: string, updates: Partial<AudioChannel>) => {
    setChannels(prev => prev.map(channel =>
      channel.id === channelId ? { ...channel, ...updates } : channel
    ));

    // Update audio nodes
    if (updates.volume !== undefined) {
      const gainNode = gainNodesRef.current.get(channelId);
      if (gainNode) {
        gainNode.gain.value = updates.volume / 100;
      }
    }

    if (updates.balance !== undefined) {
      const pannerNode = pannerNodesRef.current.get(channelId);
      if (pannerNode) {
        pannerNode.pan.value = updates.balance;
      }
    }
  }, []);

  const removeChannel = useCallback((channelId: string) => {
    setChannels(prev => prev.filter(channel => channel.id !== channelId));
    gainNodesRef.current.delete(channelId);
    pannerNodesRef.current.delete(channelId);
    sourceNodesRef.current.delete(channelId);
    channelAnalysersRef.current.delete(channelId);
  }, []);

  // Volume control
  const setVolume = useCallback((channelId: string, volume: number) => {
    updateChannel(channelId, { volume: Math.max(0, Math.min(100, volume)) });
  }, [updateChannel]);

  const toggleMute = useCallback((channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;
    updateChannel(channelId, { muted: !channel.muted });
  }, [channels, updateChannel]);

  const toggleSolo = useCallback((channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;
    
    // If soloing, unmute other soloed channels
    if (!channel.solo) {
      setChannels(prev => prev.map(c => ({
        ...c,
        solo: c.id === channelId,
      })));
    } else {
      updateChannel(channelId, { solo: false });
    }
  }, [channels, updateChannel]);

  // Balance control
  const setBalance = useCallback((channelId: string, balance: number) => {
    updateChannel(channelId, { balance: Math.max(-1, Math.min(1, balance)) });
  }, [updateChannel]);

  // VU meter calculation
  const calculateLevels = useCallback(() => {
    // Throttle UI updates to 50ms
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 50) {
      animationFrameRef.current = requestAnimationFrame(calculateLevels);
      return;
    }
    lastUpdateTimeRef.current = now;

    setChannels(prev => {
      let hasChanges = false;
      const updated = prev.map(channel => {
        const channelAnalyser = channelAnalysersRef.current.get(channel.id);
        
        let channelPeak = 0;
        let channelRms = 0;

        // Get real audio levels from channel analyser
        if (channelAnalyser && !channel.muted) {
          const dataArray = new Uint8Array(channelAnalyser.frequencyBinCount);
          channelAnalyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i] / 255;
            sum += value * value;
            if (value > channelPeak) channelPeak = value;
          }
          channelRms = Math.sqrt(sum / dataArray.length);

          // Apply volume and solo
          channelPeak *= channel.volume / 100;
          channelRms *= channel.volume / 100;
          
          if (channel.solo) {
            // Solo: no attenuation
          } else {
            // Check if any channel is soloed using ref to avoid dependency
            const anySolo = channelsRef.current.some(c => c.solo && c.id !== channel.id);
            if (anySolo) {
              channelPeak = 0;
              channelRms = 0;
            }
          }
        } else {
          channelPeak = 0;
          channelRms = 0;
        }

        // Check if values actually changed
        const prevLevels = previousLevelsRef.current.get(channel.id);
        const peakChanged = !prevLevels || Math.abs(prevLevels.peak - channelPeak) > 0.01;
        const rmsChanged = !prevLevels || Math.abs(prevLevels.rms - channelRms) > 0.01;

        if (peakChanged || rmsChanged) {
          hasChanges = true;
          previousLevelsRef.current.set(channel.id, { peak: channelPeak, rms: channelRms });
          return {
            ...channel,
            peak: channelPeak,
            rms: channelRms,
          };
        }

        return channel;
      });

      // Only update if values actually changed
      if (hasChanges) {
        return updated;
      }
      return prev;
    });

    animationFrameRef.current = requestAnimationFrame(calculateLevels);
  }, []);

  // Start VU meter
  useEffect(() => {
    if (audioContextRef.current && analyserRef.current) {
      animationFrameRef.current = requestAnimationFrame(calculateLevels);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [calculateLevels]);

  // Effects management
  const updateEffects = useCallback((updates: Partial<AudioEffects>) => {
    setEffects(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleCompression = useCallback((enabled: boolean) => {
    updateEffects({ compression: { ...effects.compression, enabled } });
  }, [effects.compression, updateEffects]);

  const toggleNoiseSuppression = useCallback((enabled: boolean) => {
    updateEffects({ noiseSuppression: { ...effects.noiseSuppression, enabled } });
  }, [effects.noiseSuppression, updateEffects]);

  const toggleEchoCancellation = useCallback((enabled: boolean) => {
    updateEffects({ echoCancellation: { ...effects.echoCancellation, enabled } });
  }, [effects.echoCancellation, updateEffects]);

  const toggleLimiter = useCallback((enabled: boolean) => {
    updateEffects({ limiter: { ...effects.limiter, enabled } });
  }, [effects.limiter, updateEffects]);

  const toggleEqualizer = useCallback((enabled: boolean) => {
    updateEffects({ equalizer: { ...effects.equalizer, enabled } });
  }, [effects.equalizer, updateEffects]);

  const setEqualizerBand = useCallback((bandIndex: number, value: number) => {
    const newBands = [...effects.equalizer.bands];
    newBands[bandIndex] = value;
    updateEffects({ equalizer: { ...effects.equalizer, bands: newBands } });
  }, [effects.equalizer.bands, updateEffects]);

  // Output control
  const setOutputVolume = useCallback((volume: number) => {
    setConfig(prev => ({ ...prev, outputVolume: Math.max(0, Math.min(100, volume)) }));
  }, []);

  const toggleOutputMute = useCallback(() => {
    setConfig(prev => ({ ...prev, outputMuted: !prev.outputMuted }));
  }, []);

  // Device management
  const getAudioDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return { inputs: [], outputs: [] };
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const inputs = devices
        .filter(device => device.kind === "audioinput")
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
        }));

      const outputs = devices
        .filter(device => device.kind === "audiooutput")
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
        }));

      return { inputs, outputs };
    } catch (error) {
      return { inputs: [], outputs: [] };
    }
  }, []);

  // Connect audio source to channel
  const connectSource = useCallback(async (channelId: string, stream: MediaStream) => {
    if (!audioContextRef.current) return;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    sourceNodesRef.current.set(channelId, source);

    const gainNode = gainNodesRef.current.get(channelId);
    const pannerNode = pannerNodesRef.current.get(channelId);

    // Create channel-specific analyser
    const channelAnalyser = audioContextRef.current.createAnalyser();
    channelAnalyser.fftSize = 2048;
    channelAnalyser.smoothingTimeConstant = 0.8;
    channelAnalysersRef.current.set(channelId, channelAnalyser);

    if (gainNode && pannerNode) {
      source.connect(gainNode);
      gainNode.connect(pannerNode);
      pannerNode.connect(channelAnalyser);
      channelAnalyser.connect(analyserRef.current!);
      analyserRef.current!.connect(audioContextRef.current.destination);
    }
  }, []);

  // Disconnect audio source
  const disconnectSource = useCallback((channelId: string) => {
    const sourceNode = sourceNodesRef.current.get(channelId);
    const gainNode = gainNodesRef.current.get(channelId);
    const pannerNode = pannerNodesRef.current.get(channelId);
    const channelAnalyser = channelAnalysersRef.current.get(channelId);

    if (sourceNode) {
      sourceNode.disconnect();
      sourceNodesRef.current.delete(channelId);
    }
    if (gainNode) {
      gainNode.disconnect();
    }
    if (pannerNode) {
      pannerNode.disconnect();
    }
    if (channelAnalyser) {
      channelAnalyser.disconnect();
      channelAnalysersRef.current.delete(channelId);
    }
  }, []);

  return {
    // State
    channels,
    config,
    effects,
    
    // Channel management
    addChannel,
    updateChannel,
    removeChannel,
    
    // Volume control
    setVolume,
    toggleMute,
    toggleSolo,
    
    // Balance control
    setBalance,
    
    // Effects
    updateEffects,
    toggleCompression,
    toggleNoiseSuppression,
    toggleEchoCancellation,
    toggleLimiter,
    toggleEqualizer,
    setEqualizerBand,
    
    // Output control
    setOutputVolume,
    toggleOutputMute,
    
    // Device management
    getAudioDevices,
    
    // Source connection
    connectSource,
    disconnectSource,
  };
}
