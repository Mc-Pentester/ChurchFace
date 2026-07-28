"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import StudioPreview from "./StudioPreview";
import StudioProgram from "./StudioProgram";
import StudioScenesPanel from "./StudioScenesPanel";
import StudioSourcesPanel from "./StudioSourcesPanel";
import StudioAudioMixer from "./StudioAudioMixer";
import StudioControls from "./StudioControls";
import StudioOutputManager from "./StudioOutputManager";
import StudioLiveKitRoom, { StudioLiveKitRoomRef } from "./StudioLiveKitRoom";
import StudioSourceSettings from "./StudioSourceSettings";
import { useLiveRecording } from "@/hooks/useLiveRecording";
import { Mic, Music, MonitorUp, Volume2, Camera } from "lucide-react";

interface StudioScene {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
}

interface StudioSource {
  id: string;
  type: "CAMERA" | "SCREEN" | "IMAGE" | "VIDEO" | "PLAYLIST" | "TEXT" | "LOGO" | "BROWSER" | "AUDIO";
  name: string;
  url?: string;
  settings?: any;
  order: number;
  isVisible: boolean;
  volume: number;
  muted: boolean;
}

interface OutputDestination {
  id: string;
  type: "CHURCHFACE" | "YOUTUBE" | "FACEBOOK" | "TWITCH" | "RTMP";
  enabled: boolean;
  config?: {
    streamKey?: string;
    streamUrl?: string;
    [key: string]: any;
  };
  status: "OFFLINE" | "CONNECTING" | "LIVE" | "ERROR";
}

interface AudioChannel {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  peak: number;
  color: string;
  icon: typeof Mic;
}

interface StudioLiveProps {
  broadcastId?: string;
  livekitToken?: string;
  livekitUrl?: string;
  roomName?: string;
}

export default function StudioLive({
  broadcastId,
  livekitToken,
  livekitUrl,
  roomName,
}: StudioLiveProps) {
  const [isLive, setIsLive] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [programStream, setProgramStream] = useState<MediaStream | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSource, setSelectedSource] = useState<StudioSource | null>(null);
  const [availableDevices, setAvailableDevices] = useState<{ cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[] }>({ cameras: [], microphones: [] });
  const [devicesPermissionGranted, setDevicesPermissionGranted] = useState(false);
  const liveKitRoomRef = useRef<StudioLiveKitRoomRef | null>(null);

  // Scenes state
  const [scenes, setScenes] = useState<StudioScene[]>([
    { id: "1", name: "Scène 1", description: "Caméra principale", order: 0, isActive: true },
  ]);

  // Sources state
  const [sources, setSources] = useState<StudioSource[]>([]);

  // Audio channels state
  const [audioChannels, setAudioChannels] = useState<AudioChannel[]>([
    {
      id: "mic1",
      name: "MIC PRINCIPAL",
      volume: 75,
      muted: false,
      solo: false,
      peak: 0,
      color: "text-emerald-400",
      icon: Mic,
    },
    {
      id: "music",
      name: "MUSIQUE",
      volume: 70,
      muted: false,
      solo: false,
      peak: 0,
      color: "text-violet-400",
      icon: Music,
    },
  ]);

  // Output destinations state
  const [destinations, setDestinations] = useState<OutputDestination[]>([
    {
      id: "churchface",
      type: "CHURCHFACE",
      enabled: true,
      status: "OFFLINE",
    },
  ]);

  // Recording hook
  const {
    isRecording,
    duration,
    blob: recordingBlob,
    formatDuration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useLiveRecording({
    onRecordingComplete: (blob, duration) => {
      console.log("Recording completed:", { blob, duration });
    },
  });

  // VU meter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioChannels((prev) =>
        prev.map((channel) => ({
          ...channel,
          peak: channel.muted
            ? 0
            : Math.max(0, Math.min(100, channel.volume + (Math.random() * 30 - 15))),
        }))
      );
    }, 180);

    return () => clearInterval(interval);
  }, []);

  // Scene handlers
  const handleSceneSelect = (sceneId: string) => {
    setScenes((prev) =>
      prev.map((scene) => ({
        ...scene,
        isActive: scene.id === sceneId,
      }))
    );
  };

  const handleSceneAdd = () => {
    const newScene: StudioScene = {
      id: Date.now().toString(),
      name: `Scène ${scenes.length + 1}`,
      order: scenes.length,
      isActive: false,
    };
    setScenes([...scenes, newScene]);
  };

  const handleSceneDelete = (sceneId: string) => {
    setScenes(scenes.filter((s) => s.id !== sceneId));
  };

  const handleSceneRename = (sceneId: string, name: string) => {
    setScenes(
      scenes.map((scene) => (scene.id === sceneId ? { ...scene, name } : scene))
    );
  };

  const handleSceneReorder = (fromIndex: number, toIndex: number) => {
    const newScenes = [...scenes];
    const [removed] = newScenes.splice(fromIndex, 1);
    newScenes.splice(toIndex, 0, removed);
    setScenes(newScenes.map((scene, index) => ({ ...scene, order: index })));
  };

  // Source handlers
  const handleSourceAdd = (type: StudioSource["type"]) => {
    const newSource: StudioSource = {
      id: Date.now().toString(),
      type,
      name: `Source ${type.toLowerCase()}`,
      order: sources.length,
      isVisible: true,
      volume: 100,
      muted: false,
    };
    setSources([...sources, newSource]);
  };

  const handleSourceDelete = (sourceId: string) => {
    setSources(sources.filter((s) => s.id !== sourceId));
  };

  const handleSourceToggleVisibility = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    const newVisibility = !source.isVisible;
    setSources(
      sources.map((s) => (s.id === sourceId ? { ...s, isVisible: newVisibility } : s))
    );

    // Activate/deactivate camera or microphone via LiveKit
    if (source.type === "CAMERA" && source.settings?.deviceId) {
      if (newVisibility) {
        console.log("Activating camera with device:", source.settings.deviceId);
        console.log("liveKitRoomRef.current:", liveKitRoomRef.current);
        if (liveKitRoomRef.current) {
          liveKitRoomRef.current.switchCamera(source.settings.deviceId);
        } else {
          console.error("liveKitRoomRef.current is null - LiveKit not connected");
        }
      } else {
        console.log("Deactivating camera");
        console.log("liveKitRoomRef.current:", liveKitRoomRef.current);
        if (liveKitRoomRef.current) {
          liveKitRoomRef.current.toggleCamera(); // Toggle off
        } else {
          console.error("liveKitRoomRef.current is null - LiveKit not connected");
        }
      }
    } else if (source.type === "AUDIO" && source.settings?.deviceId) {
      if (newVisibility) {
        console.log("Activating microphone with device:", source.settings.deviceId);
        console.log("liveKitRoomRef.current:", liveKitRoomRef.current);
        if (liveKitRoomRef.current) {
          liveKitRoomRef.current.switchMicrophone(source.settings.deviceId);
        } else {
          console.error("liveKitRoomRef.current is null - LiveKit not connected");
        }
      } else {
        console.log("Muting microphone");
        console.log("liveKitRoomRef.current:", liveKitRoomRef.current);
        if (liveKitRoomRef.current) {
          liveKitRoomRef.current.toggleMute(); // Mute
        } else {
          console.error("liveKitRoomRef.current is null - LiveKit not connected");
        }
      }
    }
  };

  const handleSourceToggleMute = (sourceId: string) => {
    setSources(
      sources.map((s) => (s.id === sourceId ? { ...s, muted: !s.muted } : s))
    );
  };

  const handleSourceSettings = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (source) {
      setSelectedSource(source);
      setShowSettings(true);
    }
  };

  const handleSourceSettingsSave = (updatedSettings: any) => {
    if (selectedSource) {
      const updatedSource = { ...selectedSource, ...updatedSettings };
      setSources(sources.map(s => 
        s.id === selectedSource.id 
          ? updatedSource
          : s
      ));

      // If source is visible and has a device, activate it immediately
      if (updatedSource.isVisible && updatedSource.settings?.deviceId) {
        if (updatedSource.type === "CAMERA") {
          console.log("Activating camera with device:", updatedSource.settings.deviceId);
          console.log("liveKitRoomRef.current:", liveKitRoomRef.current);
          if (liveKitRoomRef.current) {
            liveKitRoomRef.current.switchCamera(updatedSource.settings.deviceId);
          } else {
            console.error("liveKitRoomRef.current is null - LiveKit not connected");
          }
        } else if (updatedSource.type === "AUDIO") {
          console.log("Activating microphone with device:", updatedSource.settings.deviceId);
          console.log("liveKitRoomRef.current:", liveKitRoomRef.current);
          if (liveKitRoomRef.current) {
            liveKitRoomRef.current.switchMicrophone(updatedSource.settings.deviceId);
          } else {
            console.error("liveKitRoomRef.current is null - LiveKit not connected");
          }
        }
      }
    }
  };

  const handleSourceVolumeChange = (sourceId: string, volume: number) => {
    setSources(
      sources.map((s) => (s.id === sourceId ? { ...s, volume } : s))
    );
  };

  // Audio channel handlers
  const handleChannelUpdate = (channelId: string, updates: Partial<AudioChannel>) => {
    setAudioChannels(
      audioChannels.map((ch) => (ch.id === channelId ? { ...ch, ...updates } : ch))
    );
  };

  // Control handlers
  const handleStartLive = async () => {
    setIsLive(true);
    if (programStream) {
      startRecording(programStream);
    }

    // Update ChurchLive status to LIVE
    try {
      await fetch(`/api/live/${broadcastId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'LIVE' })
      });
    } catch (error) {
      console.error('Failed to update live status:', error);
    }
  };

  const handleStopLive = async () => {
    setIsLive(false);
    stopRecording();

    // Update ChurchLive status to OFFLINE
    try {
      await fetch(`/api/live/${broadcastId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'OFFLINE' })
      });
    } catch (error) {
      console.error('Failed to update live status:', error);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else if (programStream) {
      startRecording(programStream);
    }
  };

  const handleToggleCamera = useCallback(async () => {
    if (liveKitRoomRef.current) {
      await liveKitRoomRef.current.toggleCamera();
      setIsCameraEnabled(!isCameraEnabled);
    }
  }, [isCameraEnabled]);

  const handleToggleMic = useCallback(async () => {
    if (liveKitRoomRef.current) {
      await liveKitRoomRef.current.toggleMute();
      setIsMicEnabled(!isMicEnabled);
    }
  }, [isMicEnabled]);

  const handleToggleScreenShare = useCallback(async () => {
    if (liveKitRoomRef.current) {
      if (isScreenSharing) {
        await liveKitRoomRef.current.stopScreenShare();
      } else {
        await liveKitRoomRef.current.startScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
    }
  }, [isScreenSharing]);

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Output handlers
  const handleDestinationToggle = (destinationId: string) => {
    setDestinations(
      destinations.map((d) =>
        d.id === destinationId ? { ...d, enabled: !d.enabled } : d
      )
    );
  };

  const handleDestinationConfig = (destinationId: string, config: any) => {
    setDestinations(
      destinations.map((d) =>
        d.id === destinationId ? { ...d, config } : d
      )
    );
  };

  const handleDestinationDelete = (destinationId: string) => {
    setDestinations(destinations.filter((d) => d.id !== destinationId));
  };

  const handleStartAllOutputs = () => {
    setDestinations(
      destinations.map((d) => (d.enabled ? { ...d, status: "CONNECTING" } : d))
    );
    // Simulate connection
    setTimeout(() => {
      setDestinations(
        destinations.map((d) => (d.enabled ? { ...d, status: "LIVE" } : d))
      );
    }, 2000);
  };

  const handleStopAllOutputs = () => {
    setDestinations(
      destinations.map((d) => ({ ...d, status: "OFFLINE" }))
    );
  };

  // LiveKit integration
  const handleLocalStreamChange = useCallback((stream: MediaStream | null) => {
    setLocalStream(stream);
    setProgramStream(stream); // For now, program = preview
  }, []);

  const handleCameraEnabledChange = useCallback((enabled: boolean) => {
    setIsCameraEnabled(enabled);
  }, []);

  const handleMicEnabledChange = useCallback((enabled: boolean) => {
    setIsMicEnabled(enabled);
  }, []);

  const handleDevicesAvailable = useCallback((devices: { cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[] }) => {
    setAvailableDevices(devices);
  }, []);

  // Request camera/microphone permission on user action
  const handleRequestPermissions = async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Stop the temporary stream
      tempStream.getTracks().forEach(track => track.stop());
      
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      
      console.log("Detected devices:", { cameras: cameras.length, microphones: microphones.length });
      setAvailableDevices({ cameras, microphones });
      setDevicesPermissionGranted(true);
    } catch (error) {
      console.error("Permission request failed:", error);
      alert("Impossible d'accéder à la caméra et au micro. Vérifiez les permissions de votre navigateur.");
    }
  };

  return (
    <div className="h-screen bg-[#0f0f17] flex flex-col">
      {/* Header */}
      <div className="bg-[#16161f] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">Studio Live</h1>
        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">{formatDuration(duration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Scenes */}
        <div className="w-64 bg-[#16161f] border-r border-gray-800 p-4 flex flex-col gap-4">
          {/* Permission Request Button */}
          {!devicesPermissionGranted && (
            <div className="bg-[#252535] rounded-lg p-4 border border-emerald-600/50">
              <h3 className="text-white font-semibold mb-2">Activer le studio</h3>
              <p className="text-gray-400 text-sm mb-3">
                Pour utiliser le studio live, vous devez autoriser l'accès à votre caméra et votre micro.
              </p>
              <button
                onClick={handleRequestPermissions}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition"
              >
                <Camera size={20} />
                <span>Activer la caméra et le micro</span>
              </button>
            </div>
          )}

          <StudioScenesPanel
            scenes={scenes}
            onSceneSelect={handleSceneSelect}
            onSceneAdd={handleSceneAdd}
            onSceneDelete={handleSceneDelete}
            onSceneRename={handleSceneRename}
            onSceneReorder={handleSceneReorder}
          />
        </div>

        {/* Center - Preview/Program */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          <div className="flex-1 flex gap-4">
            <div className="flex-1">
              <StudioPreview stream={localStream} className="h-full" />
            </div>
            <div className="flex-1">
              <StudioProgram stream={programStream} isLive={isLive} className="h-full" />
            </div>
          </div>

          {/* Sources */}
          <div className="h-48">
            <StudioSourcesPanel
              sources={sources}
              onSourceAdd={handleSourceAdd}
              onSourceDelete={handleSourceDelete}
              onSourceToggleVisibility={handleSourceToggleVisibility}
              onSourceToggleMute={handleSourceToggleMute}
              onSourceVolumeChange={handleSourceVolumeChange}
              onSourceSettings={handleSourceSettings}
            />
          </div>
        </div>

        {/* Right Panel - Controls & Outputs */}
        <div className="w-80 bg-[#16161f] border-l border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Controls */}
          <StudioControls
            isLive={isLive}
            isRecording={isRecording}
            isCameraEnabled={isCameraEnabled}
            isMicEnabled={isMicEnabled}
            isScreenSharing={isScreenSharing}
            onStartLive={handleStartLive}
            onStopLive={handleStopLive}
            onToggleRecording={handleToggleRecording}
            onToggleCamera={handleToggleCamera}
            onToggleMic={handleToggleMic}
            onToggleScreenShare={handleToggleScreenShare}
            onOpenSettings={handleOpenSettings}
          />

          {/* Audio Mixer */}
          <div className="flex-1">
            <StudioAudioMixer
              channels={audioChannels}
              onChannelUpdate={handleChannelUpdate}
            />
          </div>

          {/* Output Manager */}
          <div className="h-64">
            <StudioOutputManager
              destinations={destinations}
              onDestinationToggle={handleDestinationToggle}
              onDestinationConfig={handleDestinationConfig}
              onDestinationDelete={handleDestinationDelete}
              onStartAll={handleStartAllOutputs}
              onStopAll={handleStopAllOutputs}
            />
          </div>
        </div>
      </div>

      {/* LiveKit Room (hidden, manages connection) */}
      {livekitToken && livekitUrl && roomName && (
        <StudioLiveKitRoom
          ref={liveKitRoomRef}
          token={livekitToken}
          serverUrl={livekitUrl}
          roomName={roomName}
          onLocalStreamChange={handleLocalStreamChange}
          onCameraEnabledChange={handleCameraEnabledChange}
          onMicEnabledChange={handleMicEnabledChange}
          onDevicesAvailable={handleDevicesAvailable}
          initialCameraEnabled={isCameraEnabled}
          initialMicEnabled={isMicEnabled}
        />
      )}

      {/* Source Settings Modal */}
      {selectedSource && (
        <StudioSourceSettings
          source={selectedSource}
          isOpen={showSettings}
          onClose={handleCloseSettings}
          onSave={handleSourceSettingsSave}
          availableDevices={availableDevices}
        />
      )}
    </div>
  );
}
