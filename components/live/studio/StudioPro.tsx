"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Track, createLocalVideoTrack } from "livekit-client";
import StudioTopBar, { StudioMode } from "./StudioTopBar";
import StudioScenesPanel from "./StudioScenesPanel";
import StudioSourcesPanel from "./StudioSourcesPanel";
import StudioPreview from "./StudioPreview";
import StudioProgram from "./StudioProgram";
import StudioTransitions from "./StudioTransitions";
import StudioAudioMixer from "./StudioAudioMixer";
import StudioChat from "./StudioChat";
import StudioStats from "./StudioStats";
import StudioOutputs from "./StudioOutputs";
import StudioControls from "./StudioControls";
import StudioMonitoring from "./StudioMonitoring";
import StudioOverlays from "./StudioOverlays";
import { TransitionType, getTransitionEffect, TransitionConfig } from "@/lib/transitions/TransitionTypes";
import { useStudioLayout } from "@/hooks/useStudioLayout";
import { useSceneEngine } from "@/hooks/useSceneEngine";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useOverlayEngine } from "@/hooks/useOverlayEngine";
import { liveKitService } from "@/lib/livekit/LiveKitService";
import { egressService } from "@/lib/livekit/EgressService";
import { rtmpRelayService } from "@/lib/rtmp/RtmpRelayService";
import { monitoringService } from "@/lib/livekit/MonitoringService";
import { Mic, Music, MonitorUp } from "lucide-react";
import { OwnerType } from "@/types/broadcast";

interface StudioProProps {
  // Props existants (dépréciés mais conservés pour compatibilité)
  /** @deprecated Use ownerId instead */
  churchId?: string;
  /** @deprecated Use ownerType instead */
  churchSlug?: string;
  /** @deprecated Use ownerName instead */
  churchName?: string;
  
  // Nouveaux props génériques
  ownerId?: string;
  ownerType?: OwnerType;
  ownerName?: string;
  
  // Props inchangés
  broadcastId?: string;
  broadcastName?: string;
  livekitToken?: string;
  livekitUrl?: string;
  roomName?: string;
  userId?: string;
  userName?: string;
}

export default function StudioPro({
  broadcastId,
  churchId,
  churchSlug,
  churchName,
  ownerId,
  ownerType,
  ownerName,
  broadcastName,
  livekitToken,
  livekitUrl,
  roomName,
  userId,
  userName,
}: StudioProProps) {
  const { data: session } = useSession();
  
  // Mapping de compatibilité pour les anciens props
  const effectiveOwnerId = ownerId || churchId;
  const effectiveOwnerType = ownerType || (churchId ? "CHURCH" : "USER");
  const effectiveOwnerName = ownerName || churchName;
  
  // Warnings pour props dépréciés
  if (churchId && !ownerId) {
    console.warn("StudioPro: 'churchId' prop is deprecated. Use 'ownerId' instead.");
  }
  if (churchSlug && !ownerType) {
    console.warn("StudioPro: 'churchSlug' prop is deprecated. Use 'ownerType' instead.");
  }
  if (churchName && !ownerName) {
    console.warn("StudioPro: 'churchName' prop is deprecated. Use 'ownerName' instead.");
  }
  
  // Studio State
  const [mode, setMode] = useState<StudioMode>("VIDEO");
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [networkQuality, setNetworkQuality] = useState<"EXCELLENT" | "GOOD" | "POOR" | "DISCONNECTED">("EXCELLENT");
  const [liveKitStatus, setLiveKitStatus] = useState<"CONNECTED" | "CONNECTING" | "DISCONNECTED" | "ERROR">("DISCONNECTED");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [currentTransition, setCurrentTransition] = useState<TransitionType>("CUT");
  const [transitionDuration, setTransitionDuration] = useState(500);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previewSceneId, setPreviewSceneId] = useState<string | null>(null);
  const [programSceneId, setProgramSceneId] = useState<string | null>(null);

  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef(elapsedTime);
  const audioChannelsInitializedRef = useRef(false);
  const sceneInitializedRef = useRef(false);
  const liveKitRoomRef = useRef<any>(null);
  const rtmpRelayRef = useRef(rtmpRelayService);

  // Layout
  const { layout, updatePanel, togglePanelVisibility, togglePanelCollapsed, resetLayout, switchMode } = useStudioLayout(effectiveOwnerId, mode);

  // Scene Engine
  const sceneEngine = useSceneEngine({
    canvasWidth: 1920,
    canvasHeight: 1080,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
  });

  // Audio Engine
  const audioEngine = useAudioEngine({
    sampleRate: 48000,
    bufferSize: 512,
    outputVolume: 100,
    outputMuted: false,
  });

  // Additional refs after hooks are initialized
  const audioEngineRef = useRef(audioEngine);
  const switchModeRef = useRef(switchMode);

  // Keep refs in sync
  useEffect(() => {
    audioEngineRef.current = audioEngine;
  }, [audioEngine]);

  useEffect(() => {
    switchModeRef.current = switchMode;
  }, [switchMode]);

  // Overlay Engine
  const overlayEngine = useOverlayEngine({
    canvasWidth: 1920,
    canvasHeight: 1080,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
  });

  // Keep elapsedTimeRef in sync
  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  // Set broadcastId for monitoring service
  useEffect(() => {
    if (broadcastId) {
      monitoringService.setBroadcastId(broadcastId);
    }
  }, [broadcastId]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: StudioMode) => {
    setMode(newMode);
    switchModeRef.current(newMode);
    // Reset initialization flags to reinitialize for new mode
    audioChannelsInitializedRef.current = false;
    sceneInitializedRef.current = false;
  }, []);

  // Initialize audio channels based on mode
  useEffect(() => {
    if (audioChannelsInitializedRef.current) return;
    
    if (mode === "RADIO") {
      audioEngineRef.current.addChannel({
        name: "Microphone",
        type: "MICROPHONE",
        volume: 100,
        muted: false,
        solo: false,
        balance: 0,
        color: "#3b82f6",
        icon: "Mic",
      });
      audioEngineRef.current.addChannel({
        name: "Music",
        type: "MUSIC",
        volume: 80,
        muted: false,
        solo: false,
        balance: 0,
        color: "#10b981",
        icon: "Music",
      });
    } else {
      audioEngineRef.current.addChannel({
        name: "Microphone",
        type: "MICROPHONE",
        volume: 100,
        muted: false,
        solo: false,
        balance: 0,
        color: "#3b82f6",
        icon: "Mic",
      });
      audioEngineRef.current.addChannel({
        name: "Desktop Audio",
        type: "DESKTOP_AUDIO",
        volume: 50,
        muted: false,
        solo: false,
        balance: 0,
        color: "#8b5cf6",
        icon: "MonitorUp",
      });
    }
    
    audioChannelsInitializedRef.current = true;
  }, [mode]);

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        let stream: MediaStream | null = null;

        if (mode === "RADIO") {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        }

        setMediaStream(stream);

        setTimeout(async () => {
          const audioChannel = audioEngineRef.current.channels.find(c => c.type === "MICROPHONE");
          if (audioChannel && stream) {
            await audioEngineRef.current.connectSource(audioChannel.id, stream);
          }
        }, 100);
      } catch (error) {
        // Silently handle error
      }
    };

    initializeMedia();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  // Initialize default scene
  useEffect(() => {
    if (sceneInitializedRef.current) return;
    
    const defaultScene = sceneEngine.createScene("Scene 1", "Default scene");
    if (mode !== "RADIO") {
      sceneEngine.addSource(defaultScene.id, {
        type: "CAMERA",
        name: "Camera",
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        isVisible: true,
        isLocked: false,
        volume: 100,
        muted: false,
      });
    }
    sceneEngine.setActiveScene(defaultScene.id);
    
    sceneInitializedRef.current = true;
  }, []);

  // Timer
  useEffect(() => {
    if (isLive && !timerRef.current) {
      startTimeRef.current = Date.now() - elapsedTimeRef.current * 1000;
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else if (!isLive && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLive]);

  // Handle transition execution
  const handleTransitionExecute = useCallback(async () => {
    if (!previewSceneId || !programSceneId || isTransitioning) return;

    setIsTransitioning(true);

    try {
      const transitionEffect = getTransitionEffect(currentTransition);
      const startTime = Date.now();
      const duration = transitionDuration;

      // For CUT transition, instant switch
      if (currentTransition === "CUT") {
        setProgramSceneId(previewSceneId);
        setIsTransitioning(false);
        return;
      }

      // Animation loop for other transitions
      const animateTransition = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          // Apply transition effect using the canvas-based rendering
          // Note: This requires canvas elements from preview and program
          // For now, we'll use a simplified timeout approach
          requestAnimationFrame(animateTransition);
        } else {
          // Transition complete
          setProgramSceneId(previewSceneId);
          setIsTransitioning(false);
        }
      };

      animateTransition();
    } catch (error) {
      console.error("Transition error:", error);
      setIsTransitioning(false);
    }
  }, [previewSceneId, programSceneId, isTransitioning, currentTransition, transitionDuration]);

  // Handle scene selection for preview
  const handleSceneSelect = useCallback((sceneId: string) => {
    setPreviewSceneId(sceneId);
    sceneEngine.setActiveScene(sceneId);
  }, [sceneEngine]);

  // Handle take to program
  const handleTakeToProgram = useCallback(() => {
    if (previewSceneId) {
      handleTransitionExecute();
    }
  }, [previewSceneId, handleTransitionExecute]);

  // Handle streaming start
  const handleStartStreaming = useCallback(async () => {
    if (!livekitToken || !livekitUrl || !roomName) {
      console.error("Missing LiveKit credentials:", {
        hasToken: !!livekitToken,
        hasUrl: !!livekitUrl,
        hasRoomName: !!roomName,
      });
      return;
    }

    try {
      setLiveKitStatus("CONNECTING");

      console.log("Attempting LiveKit connection:", {
        url: livekitUrl,
        room: roomName,
        tokenLength: livekitToken.length,
      });

      // Connect to LiveKit room
      const room = await liveKitService.connect({
        token: livekitToken,
        serverUrl: livekitUrl,
        roomName: roomName,
        initialCameraEnabled: true,
        initialMicEnabled: true,
      });

      liveKitRoomRef.current = room;

      // Publish tracks using LiveKit service
      await liveKitService.startStudio({
        token: livekitToken,
        serverUrl: livekitUrl,
        roomName: roomName,
      });

      setLiveKitStatus("CONNECTED");
      setIsLive(true);
      setElapsedTime(0);
    } catch (error) {
      console.error("Failed to start streaming:", error);
      setLiveKitStatus("ERROR");
    }
  }, [livekitToken, livekitUrl, roomName]);

  // Handle streaming stop
  const handleStopStreaming = useCallback(async () => {
    try {
      await liveKitService.disconnect();
      
      setLiveKitStatus("DISCONNECTED");
      setIsLive(false);
      setElapsedTime(0);
      
      liveKitRoomRef.current = null;
    } catch (error) {
      console.error("Failed to stop streaming:", error);
    }
  }, []);

  // Handle camera toggle
  const handleToggleCamera = useCallback(async () => {
    try {
      const room = liveKitService.getRoom();
      if (room) {
        const participant = room.localParticipant;
        const videoTrack = participant.getTrackPublication(Track.Source.Camera);
        if (videoTrack) {
          if (videoTrack.isMuted) {
            await videoTrack.unmute();
          } else {
            await videoTrack.mute();
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  }, []);

  // Handle microphone toggle
  const handleToggleMic = useCallback(async () => {
    try {
      const room = liveKitService.getRoom();
      if (room) {
        const participant = room.localParticipant;
        const audioTrack = participant.getTrackPublication(Track.Source.Microphone);
        if (audioTrack) {
          if (audioTrack.isMuted) {
            await audioTrack.unmute();
          } else {
            await audioTrack.mute();
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
    }
  }, []);

  // Handle screen share toggle
  const handleToggleScreenShare = useCallback(async () => {
    try {
      const room = liveKitService.getRoom();
      if (room) {
        const participant = room.localParticipant;
        const screenTrack = participant.getTrackPublication(Track.Source.ScreenShare);
        
        if (screenTrack && screenTrack.track) {
          // Stop screen share
          await screenTrack.track.stop();
          await participant.unpublishTrack(screenTrack.track);
        } else {
          // Start screen share
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 1920, height: 1080 },
            audio: false,
          });
          
          const screenTrack = await createLocalVideoTrack();
          await participant.publishTrack(screenTrack, {
            name: "screen_share",
            source: Track.Source.ScreenShare,
          });
        }
      }
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
    }
  }, []);

  // Handle settings open
  const handleOpenSettings = useCallback(() => {
    // TODO: Implement settings modal
    console.log("Open settings");
  }, []);

  // Handle recording toggle
  const handleToggleRecording = useCallback(async () => {
    if (!broadcastId || !roomName) return;

    try {
      if (isRecording) {
        // Stop recording
        await egressService.stopRecording(broadcastId);
        setIsRecording(false);
      } else {
        // Start recording
        const config = egressService.createFileRecordingConfig(roomName);
        await egressService.startRecording(config);
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Failed to toggle recording:", error);
    }
  }, [broadcastId, roomName, isRecording]);

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  return (
    <div className="h-screen bg-[#0a0a14] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <StudioTopBar
        mode={mode}
        onModeChange={handleModeChange}
        broadcastName={broadcastName}
        churchName={churchName}
        churchSlug={churchSlug}
        ownerName={effectiveOwnerName}
        ownerType={effectiveOwnerType}
        ownerId={ownerId}
        broadcastId={broadcastId}
        isLive={isLive}
        elapsedTime={elapsedTime}
        viewerCount={viewerCount}
        networkQuality={networkQuality}
        liveKitStatus={liveKitStatus}
        onStartStreaming={handleStartStreaming}
        onStopStreaming={handleStopStreaming}
        onStartRecording={handleToggleRecording}
        onStopRecording={handleToggleRecording}
        isRecording={isRecording}
        onOpenSettings={handleOpenSettings}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* VIDEO Mode Panels */}
        {mode === "VIDEO" && (
          <div className="grid grid-cols-[250px_1fr_210px_300px] gap-4 h-full p-4 overflow-hidden">
            {/* Column 1: Empty or future use */}
            <div className="flex flex-col gap-4 overflow-hidden">
              <div className="bg-[#16161f] rounded-lg shadow-xl flex-1 flex items-center justify-center text-gray-500 text-sm">
                <div className="text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <p>Colonne disponible</p>
                </div>
              </div>
            </div>

            {/* Column 2: Preview, Program, Transitions, Scenes, Sources, Audio Mixer */}
            <div className="flex flex-col gap-4 overflow-hidden flex-1">
              {/* Preview and Program side by side with transitions in middle */}
              <div className="flex gap-2 h-80">
                {/* Preview Panel */}
                <div className="flex-1 bg-[#16161f] rounded-lg shadow-xl overflow-hidden">
                  <StudioPreview stream={mediaStream} muted={true} className="w-full h-full" />
                </div>

                {/* Transitions Panel */}
                <div className="bg-[#16161f] rounded-lg shadow-xl flex flex-col items-center justify-start gap-2 px-2 py-3 w-24 overflow-hidden">
                  <StudioTransitions
                    currentTransition={currentTransition}
                    onTransitionChange={setCurrentTransition}
                    onTransitionExecute={handleTransitionExecute}
                    transitionDuration={transitionDuration}
                    onDurationChange={setTransitionDuration}
                  />
                </div>

                {/* Program Panel */}
                <div className="flex-1 bg-[#16161f] rounded-lg shadow-xl overflow-hidden">
                  <StudioProgram stream={mediaStream} muted={true} isLive={isLive} className="w-full h-full" />
                </div>
              </div>

              {/* Scenes and Sources side by side */}
              <div className="flex gap-2 h-48">
                {/* Scenes Panel */}
                <div className="flex-1 bg-[#16161f] rounded-lg shadow-xl overflow-hidden">
                  <StudioScenesPanel
                    scenes={sceneEngine.scenes}
                    onSceneSelect={handleSceneSelect}
                    onSceneAdd={() => sceneEngine.createScene(`Scene ${sceneEngine.scenes.length + 1}`)}
                    onSceneDelete={(sceneId) => sceneEngine.deleteScene(sceneId)}
                    onSceneRename={(sceneId, name) => sceneEngine.updateScene(sceneId, { name })}
                    onSceneReorder={(fromIndex, toIndex) => sceneEngine.reorderScenes(fromIndex, toIndex)}
                  />
                </div>

                {/* Sources Panel */}
                {sceneEngine.activeScene && (
                  <div className="flex-1 bg-[#16161f] rounded-lg shadow-xl overflow-hidden">
                    <StudioSourcesPanel
                      sources={sceneEngine.activeScene.sources.map(s => ({
                        ...s,
                        order: 0,
                      })) as any}
                      onSourceAdd={(type) => sceneEngine.addSource(sceneEngine.activeScene!.id, type as any)}
                      onSourceDelete={(sourceId) => sceneEngine.deleteSource(sceneEngine.activeScene!.id, sourceId)}
                      onSourceToggleVisibility={(sourceId) => {
                        const source = sceneEngine.activeScene?.sources.find(s => s.id === sourceId);
                        if (source) {
                          sceneEngine.updateSource(sceneEngine.activeScene!.id, sourceId, { isVisible: !source.isVisible });
                        }
                      }}
                      onSourceToggleMute={(sourceId) => {
                        const source = sceneEngine.activeScene?.sources.find(s => s.id === sourceId);
                        if (source) {
                          sceneEngine.updateSource(sceneEngine.activeScene!.id, sourceId, { muted: !source.muted });
                        }
                      }}
                      onSourceVolumeChange={(sourceId, volume) => {
                        if (sceneEngine.activeScene) {
                          sceneEngine.updateSource(sceneEngine.activeScene.id, sourceId, { volume });
                        }
                      }}
                      onSourceSettings={(sourceId) => {
                        const source = sceneEngine.activeScene?.sources.find(s => s.id === sourceId);
                        if (source) {
                          console.log('Open settings for source:', source);
                          // TODO: Implement source settings modal
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Audio Mixer and Overlays side by side */}
              <div className="flex gap-2 flex-1 min-h-0">
                {/* Audio Mixer Panel */}
                <div className="flex-1 bg-[#16161f] rounded-lg shadow-xl overflow-hidden flex flex-col">
                  <StudioAudioMixer
                    channels={audioEngine.channels.map(c => ({
                      id: c.id,
                      name: c.name,
                      volume: c.volume,
                      muted: c.muted,
                      solo: c.solo,
                      peak: c.peak * 100,
                      color: c.color,
                      icon: c.icon === "Mic" ? Mic : c.icon === "Music" ? Music : MonitorUp,
                    }))}
                    onChannelUpdate={(channelId, updates) => {
                      const { icon, ...rest } = updates;
                      audioEngine.updateChannel(channelId, rest);
                    }}
                  />
                </div>

                {/* Overlays Panel */}
                <div className="flex-1 bg-[#16161f] rounded-lg shadow-xl overflow-hidden flex flex-col">
                  <StudioOverlays
                    overlays={overlayEngine.overlays}
                    onOverlayAdd={(overlay) => overlayEngine.addOverlay(overlay)}
                    onOverlayUpdate={(overlayId, updates) => overlayEngine.updateOverlay(overlayId, updates)}
                    onOverlayDelete={(overlayId) => overlayEngine.deleteOverlay(overlayId)}
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Controls, Monitoring */}
            <div className="flex flex-col gap-4 overflow-hidden w-[210px]">
              {/* Controls Panel */}
              <div className="bg-[#16161f] rounded-lg shadow-xl p-4 flex flex-col gap-3 overflow-hidden">
                <StudioControls
                  isLive={isLive}
                  isRecording={isRecording}
                  isCameraEnabled={false}
                  isMicEnabled={false}
                  isScreenSharing={false}
                  onStartLive={handleStartStreaming}
                  onStopLive={handleStopStreaming}
                  onToggleRecording={() => setIsRecording(!isRecording)}
                  onToggleCamera={() => {}}
                  onToggleMic={() => {}}
                  onToggleScreenShare={() => {}}
                  onOpenSettings={handleOpenSettings}
                />
              </div>

              {/* Monitoring Panel */}
              <div className="bg-[#16161f] rounded-lg shadow-xl flex-1 min-h-48 overflow-hidden">
                <StudioMonitoring />
              </div>
            </div>

            {/* Column 4: Chat & Multistreaming */}
            <div className="flex flex-col gap-4 overflow-hidden w-80">
              {/* Chat Panel */}
              <div className="bg-[#16161f] rounded-lg shadow-xl flex-1 min-h-64 overflow-hidden">
                <StudioChat
                  broadcastId={broadcastId || ""}
                  userId={userId || ""}
                  userName={userName || ""}
                  onMessageDelete={(messageId) => console.log('Delete message:', messageId)}
                  onUserBan={(userId) => console.log('Ban user:', userId)}
                  isModerator={true}
                />
              </div>

              {/* Stats Panel */}
              <div className="bg-[#16161f] rounded-lg shadow-xl flex-1 min-h-32 overflow-hidden">
                <StudioStats broadcastId={broadcastId || ""} isLive={isLive} />
              </div>

              {/* Outputs Panel */}
              <div className="bg-[#16161f] rounded-lg shadow-xl flex-1 min-h-64 overflow-hidden">
                <StudioOutputs broadcastId={broadcastId || ""} />
              </div>
            </div>
          </div>
        )}

        {/* RADIO Mode Panels */}
        {mode === "RADIO" && (
          <div className="grid grid-cols-4 gap-4 h-full p-4">
            {/* Audio Sources Panel */}
            <div className="bg-[#16161f] rounded-lg shadow-xl h-96">
              <StudioSourcesPanel
                sources={audioEngine.channels
                  .filter(c => c.type === "MICROPHONE" || c.type === "MUSIC")
                  .map(c => ({
                    id: c.id,
                    type: "AUDIO" as any,
                    name: c.name,
                    url: undefined,
                    settings: undefined,
                    order: 0,
                    isVisible: true,
                    volume: c.volume,
                    muted: c.muted,
                  }))}
                onSourceAdd={(type) => {
                  // Add audio source logic
                }}
                onSourceDelete={(sourceId) => {
                  // TODO: Implement delete channel in audio engine
                  // audioEngine.deleteChannel(sourceId);
                }}
                onSourceToggleVisibility={() => {}}
                onSourceToggleMute={(sourceId) => {
                  const channel = audioEngine.channels.find(c => c.id === sourceId);
                  if (channel) {
                    audioEngine.updateChannel(sourceId, { muted: !channel.muted });
                  }
                }}
                onSourceVolumeChange={(sourceId, volume) => {
                  audioEngine.updateChannel(sourceId, { volume });
                }}
              />
            </div>

            {/* Playlist Panel - Placeholder */}
            <div className="bg-[#16161f] rounded-lg shadow-xl h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-3xl mb-2">🎵</div>
                <p className="text-sm">Playlist</p>
                <p className="text-xs mt-1">À implémenter</p>
              </div>
            </div>

            {/* Audio Mixer Panel */}
            <div className="bg-[#16161f] rounded-lg shadow-xl h-96">
              <StudioAudioMixer
                channels={audioEngine.channels.map(c => ({
                  id: c.id,
                  name: c.name,
                  volume: c.volume,
                  muted: c.muted,
                  solo: c.solo,
                  peak: c.peak * 100,
                  color: c.color,
                  icon: c.icon === "Mic" ? Mic : c.icon === "Music" ? Music : MonitorUp,
                }))}
                onChannelUpdate={(channelId, updates) => {
                  const { icon, ...rest } = updates;
                  audioEngine.updateChannel(channelId, rest);
                }}
              />
            </div>

            {/* Controls Panel */}
            <div className="bg-[#16161f] rounded-lg shadow-xl h-96 p-4">
              <StudioControls
                isLive={isLive}
                isRecording={isRecording}
                isCameraEnabled={false}
                isMicEnabled={false}
                isScreenSharing={false}
                onStartLive={handleStartStreaming}
                onStopLive={handleStopStreaming}
                onToggleRecording={() => setIsRecording(!isRecording)}
                onToggleCamera={() => {}}
                onToggleMic={() => {}}
                onToggleScreenShare={() => {}}
                onOpenSettings={handleOpenSettings}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
