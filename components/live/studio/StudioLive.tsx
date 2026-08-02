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
import StudioCanvas from "./StudioCanvas";
import StudioGuests from "./StudioGuests";
import StudioChat from "./StudioChat";
import StudioOverlays from "./StudioOverlays";
import StudioMediaLibrary from "./StudioMediaLibrary";
import StudioStats from "./StudioStats";
import StudioSermons from "./StudioSermons";
import StudioMonitoring from "./StudioMonitoring";
import StudioErrorDisplay from "./StudioErrorDisplay";
import { useLiveRecording } from "@/hooks/useLiveRecording";
import { useAudioMixer } from "@/hooks/useAudioMixer";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { Mic, Music, MonitorUp, Volume2, Camera, X } from "lucide-react";
import { LocalVideoTrack, LocalAudioTrack, Track } from "livekit-client";
import { liveKitService } from "@/lib/livekit/LiveKitService";
import { errorHandler } from "@/lib/livekit/ErrorHandler";

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
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  isLocked?: boolean;
}

interface OutputDestination {
  id: string;
  type: "CHURCHFACE" | "YOUTUBE" | "FACEBOOK" | "TWITCH" | "CUSTOM";
  name: string;
  enabled: boolean;
  status: "OFFLINE" | "CONNECTING" | "LIVE" | "ERROR";
  config?: {
    streamKey?: string;
    serverUrl?: string;
    rtmpUrl?: string;
  };
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

interface CanvasSource {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  isVisible: boolean;
  isLocked: boolean;
}

interface StudioLiveProps {
  broadcastId?: string;
  livekitToken?: string;
  livekitUrl?: string;
  roomName?: string;
  userId?: string;
  userName?: string;
}

export default function StudioLive({
  broadcastId,
  livekitToken,
  livekitUrl,
  roomName,
  userId,
  userName,
}: StudioLiveProps) {

  const [isLive, setIsLive] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Camera preview state
  const [cameraPreviewTrack, setCameraPreviewTrack] = useState<LocalVideoTrack | null>(null);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  
  // Preview/Program streams
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [programStream, setProgramStream] = useState<MediaStream | null>(null);
  
  // Transition state
  const [transitionType, setTransitionType] = useState<"CUT" | "FADE" | "DISSOLVE" | "SLIDE">("CUT");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Take preview to program with transition
  const handleTakeToProgram = useCallback(async () => {
    if (!previewStream || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Store current program stream for transition
    const oldProgramStream = programStream;
    
    switch (transitionType) {
      case "CUT":
        // Instant cut
        setProgramStream(previewStream);
        setIsTransitioning(false);
        break;
      
      case "FADE":
        // Fade transition - crossfade between streams
        setProgramStream(previewStream);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsTransitioning(false);
        break;
      
      case "DISSOLVE":
        // Dissolve transition - similar to fade but with different timing
        setProgramStream(previewStream);
        await new Promise(resolve => setTimeout(resolve, 750));
        setIsTransitioning(false);
        break;
      
      case "SLIDE":
        // Slide transition - slide from right
        setProgramStream(previewStream);
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsTransitioning(false);
        break;
    }
  }, [previewStream, programStream, transitionType, isTransitioning]);
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

  // Canvas sources state (for visual positioning)
  const [canvasSources, setCanvasSources] = useState<CanvasSource[]>([]);

  // Overlays state
  const [overlays, setOverlays] = useState<any[]>([]);

  // Media library state
  const [mediaItems, setMediaItems] = useState<any[]>([]);

  // Sermon handlers
  const handleSermonSelect = (sermon: any) => {
    console.log("Selected sermon:", sermon);
    // Will be implemented to add as source or play
  };

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
      name: "ChurchFace",
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
      // Save to media library
      const url = URL.createObjectURL(blob);
      const newMediaItem = {
        id: Date.now().toString(),
        type: "VIDEO" as const,
        name: `Recording ${new Date().toLocaleString()}`,
        url,
        size: blob.size,
        createdAt: new Date(),
        duration,
      };
      setMediaItems((prev) => [...prev, newMediaItem]);
    },
  });

  // Cloud recording state (LiveKit Egress)
  const [isCloudRecording, setIsCloudRecording] = useState(false);
  const [cloudRecordingId, setCloudRecordingId] = useState<string | null>(null);

  // Audio mixer hook for real VU meters
  const { currentPeak: mainPeak, setVolume: setMainVolume } = useAudioMixer({
    stream: previewStream,
    onPeakUpdate: (channelId, peak) => {
      // Update main microphone channel peak
      setAudioChannels((prev) =>
        prev.map((ch) =>
          ch.id === "mic1" ? { ...ch, peak: ch.muted ? 0 : peak } : ch
        )
      );
    },
  });

  // Media upload hook
  const { uploads, isUploading, uploadFiles, cancelUpload, clearCompleted } = useMediaUpload();

  // Setup LiveKit callbacks for preview track
  useEffect(() => {
    liveKitService.setCallbacks({
      onPreviewTrack: (track) => {
        console.log("[Camera] Preview track received", track);
        setCameraPreviewTrack(track);
      },
    });

    return () => {
      liveKitService.clearCallbacks();
    };
  }, []);

  // Attach preview track to video element when both are available
  useEffect(() => {
    if (cameraPreviewTrack && cameraPreviewRef.current) {
      console.log("[Camera] Attaching preview track to video element");
      cameraPreviewTrack.attach(cameraPreviewRef.current);
    }
  }, [cameraPreviewTrack]);


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
    if (type === "CAMERA") {
      // For camera, show preview first
      handleAddCameraSource();
    } else {
      // For other types, add directly
      const newSource: StudioSource = {
        id: `${type}-${Date.now()}`,
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} ${sources.filter(s => s.type === type).length + 1}`,
        order: sources.length,
        isVisible: false,
        volume: 100,
        muted: false,
        x: 50,
        y: 50,
        width: 320,
        height: 240,
        rotation: 0,
        zIndex: sources.length + 1,
        isLocked: false,
      };
      setSources([...sources, newSource]);
      
      // Also add to canvas sources with all required properties
      const newCanvasSource: CanvasSource = {
        id: newSource.id,
        type: newSource.type,
        name: newSource.name,
        x: newSource.x || 50,
        y: newSource.y || 50,
        width: newSource.width || 320,
        height: newSource.height || 240,
        rotation: newSource.rotation || 0,
        zIndex: newSource.zIndex || sources.length + 1,
        isVisible: newSource.isVisible,
        isLocked: newSource.isLocked || false,
      };
      setCanvasSources([...canvasSources, newCanvasSource]);
    }
  };

  const handleSourceDelete = (sourceId: string) => {
    setSources(sources.filter((s) => s.id !== sourceId));
    setCanvasSources(canvasSources.filter((s) => s.id !== sourceId));
  };

  // Canvas source handlers
  const handleCanvasSourceUpdate = (sourceId: string, updates: any) => {
    setCanvasSources(canvasSources.map(s => 
      s.id === sourceId ? { ...s, ...updates } : s
    ));
    
    // Also update in sources
    setSources(sources.map(s => 
      s.id === sourceId ? { ...s, ...updates } : s
    ));
  };

  const handleSourceToggleVisibility = (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    const newVisibility = !source.isVisible;
    setSources(
      sources.map((s) => (s.id === sourceId ? { ...s, isVisible: newVisibility } : s))
    );
    
    // Also update canvas sources
    setCanvasSources(canvasSources.map(s => 
      s.id === sourceId ? { ...s, isVisible: newVisibility } : s
    ));

    // Activate/deactivate camera or microphone via LiveKit
    if (source.type === "CAMERA" && source.settings?.deviceId) {
      if (newVisibility) {
        if (liveKitRoomRef.current) {
          liveKitRoomRef.current.switchCamera(source.settings.deviceId);
        }
      } else {
        // Toggle not implemented in new architecture
        console.warn("toggleCamera not implemented");
      }
    }

    if (source.type === "AUDIO" && source.settings?.deviceId) {
      if (newVisibility) {
        if (liveKitRoomRef.current) {
          liveKitRoomRef.current.switchMicrophone(source.settings.deviceId);
        }
      } else {
        // Toggle not implemented in new architecture
        console.warn("toggleMute not implemented");
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
          if (liveKitRoomRef.current) {
            liveKitRoomRef.current.switchCamera(updatedSource.settings.deviceId);
          }
        } else if (updatedSource.type === "AUDIO") {
          if (liveKitRoomRef.current) {
            liveKitRoomRef.current.switchMicrophone(updatedSource.settings.deviceId);
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

  // Cloud recording handlers (LiveKit Egress)
  const handleStartCloudRecording = async () => {
    try {
      const response = await fetch('/api/livekit/egress/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          output: {
            fileType: "MP4",
            s3: {
              accessKey: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
              secret: process.env.NEXT_PUBLIC_AWS_SECRET,
              bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
              region: process.env.NEXT_PUBLIC_AWS_REGION,
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCloudRecordingId(data.egressId);
        setIsCloudRecording(true);
      }
    } catch (error) {
      console.error("Failed to start cloud recording:", error);
    }
  };

  const handleStopCloudRecording = async () => {
    if (!cloudRecordingId) return;

    try {
      await fetch('/api/livekit/egress/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ egressId: cloudRecordingId }),
      });

      setIsCloudRecording(false);
      setCloudRecordingId(null);
    } catch (error) {
      console.error("Failed to stop cloud recording:", error);
    }
  };

  const handleToggleCamera = useCallback(async () => {
    // Toggle not implemented in new architecture
    console.warn("toggleCamera not implemented in new architecture");
  }, [isCameraEnabled]);

  const handleToggleMic = useCallback(async () => {
    // Toggle not implemented in new architecture
    console.warn("toggleMute not implemented in new architecture");
  }, [isMicEnabled]);

  const handleToggleScreenShare = useCallback(async () => {
    // Screen share not implemented in new architecture
    console.warn("Screen share not implemented in new architecture");
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

  const handleStartAllOutputs = async () => {
    setDestinations(
      destinations.map((d) => (d.enabled ? { ...d, status: "CONNECTING" } : d))
    );
    
    // Real connection logic will be implemented with LiveKit Egress
    // For now, this is a placeholder for the actual streaming logic
    console.log("Starting outputs:", destinations.filter(d => d.enabled));
  };

  const handleStopAllOutputs = () => {
    setDestinations(
      destinations.map((d) => ({ ...d, status: "OFFLINE" }))
    );
  };

  // LiveKit integration
  const handleLocalStreamChange = useCallback((stream: MediaStream | null) => {
    setPreviewStream(stream);
    // Don't auto-set program stream - let user use Take button
    if (!programStream) {
      setProgramStream(stream); // Only set initially
    }
  }, [programStream]);

  const handleCameraEnabledChange = useCallback((enabled: boolean) => {
    setIsCameraEnabled(enabled);
  }, []);

  const handleMicEnabledChange = useCallback((enabled: boolean) => {
    setIsMicEnabled(enabled);
  }, []);

  const handleDevicesAvailable = useCallback((devices: { cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[] }) => {
    setAvailableDevices(devices);
  }, []);

  // LiveKit connection handlers
  const handleConnected = useCallback(() => {
    console.log("Studio connected to LiveKit");
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log("Studio disconnected from LiveKit");
  }, []);

  // Guest management
  const [participants, setParticipants] = useState<any[]>([]);

  const handleParticipantJoined = useCallback((participant: any) => {
    setParticipants((prev) => [...prev, participant]);
  }, []);

  const handleParticipantLeft = useCallback((participant: any) => {
    setParticipants((prev) => prev.filter((p) => p !== participant));
  }, []);

  const handleMuteParticipant = useCallback((participantId: string) => {
    console.log("Muting participant:", participantId);
    // Will be implemented with LiveKit room API
  }, []);

  const handleUnmuteParticipant = useCallback((participantId: string) => {
    console.log("Unmuting participant:", participantId);
    // Will be implemented with LiveKit room API
  }, []);

  const handleDisableVideo = useCallback((participantId: string) => {
    console.log("Disabling video for:", participantId);
    // Will be implemented with LiveKit room API
  }, []);

  const handleEnableVideo = useCallback((participantId: string) => {
    console.log("Enabling video for:", participantId);
    // Will be implemented with LiveKit room API
  }, []);

  const handleRemoveParticipant = useCallback((participantId: string) => {
    console.log("Removing participant:", participantId);
    // Will be implemented with LiveKit room API
  }, []);

  // Overlay handlers
  const handleOverlayAdd = (overlay: any) => {
    setOverlays([...overlays, overlay]);
  };

  const handleOverlayUpdate = (overlayId: string, updates: any) => {
    setOverlays(overlays.map(o => o.id === overlayId ? { ...o, ...updates } : o));
  };

  const handleOverlayDelete = (overlayId: string) => {
    setOverlays(overlays.filter(o => o.id !== overlayId));
  };

  // Media library handlers
  const handleMediaSelect = (item: any) => {
    console.log("Selected media:", item);
    // Will be implemented to add as source
  };

  const handleMediaDelete = (itemId: string) => {
    setMediaItems(mediaItems.filter(item => item.id !== itemId));
  };

  const handleMediaUpload = async (files: File[]) => {
    await uploadFiles(files);
    
    // Add uploaded files to media library
    uploads.forEach((upload) => {
      if (upload.status === "completed" && upload.url) {
        const newMediaItem = {
          id: Date.now().toString() + Math.random(),
          type: files.find(f => f.name === upload.fileName)?.type?.startsWith("video") ? "VIDEO" : 
                files.find(f => f.name === upload.fileName)?.type?.startsWith("audio") ? "AUDIO" : "IMAGE",
          name: upload.fileName,
          url: upload.url,
          size: files.find(f => f.name === upload.fileName)?.size || 0,
          createdAt: new Date(),
        };
        setMediaItems((prev) => [...prev, newMediaItem]);
      }
    });
    
    clearCompleted();
  };

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
      errorHandler.deviceError(
        "Permission refusée",
        "Impossible d'accéder à la caméra ou au microphone",
        true
      );
    }
  };

  // Create camera preview before adding as source
  const handleCreateCameraPreview = async (deviceId?: string) => {
    // Camera preview is now handled automatically by LiveKit
    // This function is kept for compatibility but does nothing
    console.log("[Camera] Camera preview is now automatic via LiveKit");
    return null;
  };

  // Stop camera preview
  const handleStopCameraPreview = () => {
    if (cameraPreviewTrack) {
      cameraPreviewTrack.stop();
      cameraPreviewTrack.detach();
      setCameraPreviewTrack(null);
    }
    setShowCameraPreview(false);
  };

  // Add camera source after preview validation
  const handleAddCameraSource = async (deviceId?: string) => {
    try {
      console.log("[Camera] Adding camera source with device:", deviceId || "default");
      
      // Create preview first
      const track = await handleCreateCameraPreview(deviceId);
      
      // Show preview for user validation
      setShowCameraPreview(true);
      
      // Note: User will validate preview, then we'll publish to LiveKit
      // The actual source creation happens after user confirms
    } catch (error) {
      console.error("[Camera] Failed to add camera source:", error);
      errorHandler.deviceError(
        "Impossible d'ajouter la source caméra",
        (error as Error).message,
        false
      );
    }
  };

  // Confirm and add camera source (camera is already published by LiveKit)
  const handleConfirmCameraSource = async () => {
    // Camera is now automatically enabled by LiveKit startStudio
    // Just add it to sources list for UI management
    try {
      console.log("[Camera] Adding camera source to list");
      
      const participant = liveKitService.getLocalParticipant();
      if (!participant) {
        console.error("[Camera] No participant available");
        return;
      }
      
      // Get camera track from LiveKit participant
      const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
      if (!cameraPublication) {
        console.error("[Camera] No camera publication found");
        return;
      }
      
      // Add to sources list
      const newSource: StudioSource = {
        id: `camera-${Date.now()}`,
        type: "CAMERA",
        name: `Caméra ${sources.filter(s => s.type === "CAMERA").length + 1}`,
        settings: {},
        order: sources.length,
        isVisible: true,
        volume: 100,
        muted: false,
      };
      
      setSources([...sources, newSource]);
      
      // Add to canvas sources with required CanvasSource properties
      const newCanvasSource: CanvasSource = {
        ...newSource,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        zIndex: 0,
        isLocked: false,
      };
      
      setCanvasSources([...canvasSources, newCanvasSource]);
      
      console.log("[Camera] Source added successfully");
    } catch (error) {
      console.error("[Camera] Failed to add source:", error);
      errorHandler.deviceError(
        "Impossible d'ajouter la source caméra",
        (error as Error).message,
        false
      );
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
              <div className="h-full bg-[#0a0a0f] rounded-lg overflow-hidden border border-gray-800">
                <div className="bg-[#16161f] px-3 py-2 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-white text-sm font-semibold">Preview</span>
                  <span className="text-gray-400 text-xs">PREPARATION</span>
                </div>
                <div className="h-[calc(100%-40px)]">
                  <StudioPreview 
                    stream={previewStream}
                    className="h-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <StudioProgram 
                stream={programStream} 
                isLive={isLive} 
                isTransitioning={isTransitioning}
                transitionType={transitionType}
                className="h-full" 
              />
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

          {/* Guests Panel */}
          <div className="h-64">
            <StudioGuests
              participants={participants}
              onMuteParticipant={handleMuteParticipant}
              onUnmuteParticipant={handleUnmuteParticipant}
              onDisableVideo={handleDisableVideo}
              onEnableVideo={handleEnableVideo}
              onRemoveParticipant={handleRemoveParticipant}
            />
          </div>

          {/* Chat Panel */}
          {broadcastId && (
            <div className="h-96">
              <StudioChat
                broadcastId={broadcastId}
                userId={userId || "current-user"}
                userName={userName || "Studio Host"}
                isModerator={true}
              />
            </div>
          )}

          {/* Overlays Panel */}
          <div className="h-96">
            <StudioOverlays
              overlays={overlays}
              onOverlayAdd={handleOverlayAdd}
              onOverlayUpdate={handleOverlayUpdate}
              onOverlayDelete={handleOverlayDelete}
            />
          </div>

          {/* Media Library Panel */}
          <div className="h-96">
            <StudioMediaLibrary
              mediaItems={mediaItems}
              onMediaSelect={handleMediaSelect}
              onMediaDelete={handleMediaDelete}
              onMediaUpload={handleMediaUpload}
              uploads={uploads}
              isUploading={isUploading}
              onCancelUpload={cancelUpload}
            />
          </div>

          {/* Stats Panel */}
          {broadcastId && <StudioStats broadcastId={broadcastId} isLive={isLive} />}

          {/* Monitoring Panel */}
          <StudioMonitoring />

          {/* Sermons Panel */}
          <div className="h-96">
            <StudioSermons churchId="default-church" onSermonSelect={handleSermonSelect} />
          </div>
        </div>
      </div>

      {/* Error Display */}
      <StudioErrorDisplay />

      {/* LiveKit Room (hidden, manages connection) */}
      {livekitToken && livekitUrl && roomName && (
        <StudioLiveKitRoom
          ref={liveKitRoomRef}
          token={livekitToken}
          serverUrl={livekitUrl}
          roomName={roomName}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
          onLocalStreamChange={handleLocalStreamChange}
          onParticipantJoined={handleParticipantJoined}
          onParticipantLeft={handleParticipantLeft}
          onCameraEnabledChange={handleCameraEnabledChange}
          onMicEnabledChange={handleMicEnabledChange}
          onDevicesAvailable={handleDevicesAvailable}
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
          liveKitReady={liveKitRoomRef.current?.isLiveKitReady() || false}
        />
      )}

      {/* Camera Preview Modal */}
      {showCameraPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#16161f] rounded-xl w-full max-w-2xl mx-4 border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Camera size={20} className="text-emerald-400" />
                <div>
                  <h3 className="text-white font-semibold">Aperçu Caméra</h3>
                  <p className="text-gray-400 text-sm">Vérifiez l'image avant d'ajouter</p>
                </div>
              </div>
              <button
                onClick={handleStopCameraPreview}
                className="p-2 hover:bg-[#252535] rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-4">
              <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
                <video
                  ref={cameraPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStopCameraPreview}
                  className="flex-1 px-4 py-2 bg-[#252535] text-gray-300 rounded-lg hover:bg-[#353545] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmCameraSource}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  Ajouter la source
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
