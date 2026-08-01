"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSceneEngine, Scene, SceneSource } from "@/hooks/useSceneEngine";
import { useAudioEngine, AudioChannel } from "@/hooks/useAudioEngine";
import { useOverlayEngine, Overlay } from "@/hooks/useOverlayEngine";
import { liveKitService } from "@/lib/livekit/LiveKitService";
import { rtmpRelayService, RelayDestination } from "@/lib/rtmp/RtmpRelayService";
import { egressService, EgressRecording } from "@/lib/livekit/EgressService";
import { 
  Layout, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MonitorUp, 
  Settings, 
  Users, 
  MessageSquare, 
  Layers, 
  Radio, 
  Circle, 
  Square, 
  Play, 
  Pause,
  Volume2,
  MoreHorizontal,
  X
} from "lucide-react";

export type StudioMode = "VIDEO" | "RADIO" | "CHURCH" | "TRAINING" | "PODCAST" | "CONFERENCE";

export type StudioPanel = 
  | "production" 
  | "scenes" 
  | "sources" 
  | "audio" 
  | "guests" 
  | "chat" 
  | "overlays" 
  | "broadcast" 
  | "recording" 
  | "destinations" 
  | "stats" 
  | "settings";

interface StudioLiveUnifiedProps {
  broadcastId?: string;
  mode?: StudioMode;
  churchId?: string;
  churchSlug?: string;
}

export default function StudioLiveUnified({
  broadcastId,
  mode = "VIDEO",
  churchId,
  churchSlug,
}: StudioLiveUnifiedProps) {
  const { data: session } = useSession();
  
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

  // Overlay Engine
  const overlayEngine = useOverlayEngine({
    canvasWidth: 1920,
    canvasHeight: 1080,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
  });

  // Studio State
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activePanel, setActivePanel] = useState<StudioPanel>("production");
  const [broadcastData, setBroadcastData] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [relayDestinations, setRelayDestinations] = useState<RelayDestination[]>([]);
  const [recordings, setRecordings] = useState<EgressRecording[]>([]);
  const [liveKitConnected, setLiveKitConnected] = useState(false);

  // Device State
  const [cameraEnabled, setCameraEnabled] = useState(mode !== "RADIO");
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const channelsInitializedRef = useRef(false);
  const sceneInitializedRef = useRef(false);
  const elapsedTimeRef = useRef(elapsedTime);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const programVideoRef = useRef<HTMLVideoElement>(null);
  const screenElementRef = useRef<HTMLVideoElement>(null);

  // Keep elapsedTimeRef in sync with elapsedTime
  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  // Initialize audio channels based on mode
  useEffect(() => {
    if (channelsInitializedRef.current) return;

    if (mode === "RADIO") {
      // Radio mode: only audio channels
      audioEngine.addChannel({
        name: "Microphone",
        type: "MICROPHONE",
        volume: 100,
        muted: false,
        solo: false,
        balance: 0,
        color: "#3b82f6",
        icon: "Mic",
      });
      audioEngine.addChannel({
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
      // Video mode: audio + video sources
      audioEngine.addChannel({
        name: "Microphone",
        type: "MICROPHONE",
        volume: 100,
        muted: false,
        solo: false,
        balance: 0,
        color: "#3b82f6",
        icon: "Mic",
      });
      audioEngine.addChannel({
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

    channelsInitializedRef.current = true;
  }, [mode]);

  // Initialize media stream (camera/microphone)
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        let stream: MediaStream | null = null;

        if (mode === "RADIO") {
          // Radio mode: audio only
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
        } else {
          // Video mode: video + audio
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        }

        setMediaStream(stream);

        // Connect audio to audio engine after channels are initialized
        setTimeout(async () => {
          const audioChannel = audioEngine.channels.find(c => c.type === "MICROPHONE");
          if (audioChannel && stream) {
            await audioEngine.connectSource(audioChannel.id, stream);
          }
        }, 100);
      } catch (error) {
        console.error("Error accessing media devices:", error);
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
  }, [mode]);

  // Timer for elapsed time
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

  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Go Live
  const handleGoLive = async () => {
    if (!broadcastId || !broadcastData) {
      console.error("No broadcast ID or data provided");
      return;
    }

    try {
      setIsLive(true);
      
      // Connect to LiveKit for both VIDEO and RADIO modes
      if (mediaStream) {
        await liveKitService.connect({
          serverUrl: broadcastData.livekitUrl || "wss://livekit.churchface.com",
          token: broadcastData.livekitToken || "",
          roomName: broadcastData.livekitRoom || broadcastId,
          initialCameraEnabled: mode !== "RADIO" && cameraEnabled,
          initialMicEnabled: microphoneEnabled,
        });
        setLiveKitConnected(true);
      }

      // Start RTMP relays
      const enabledDestinations = relayDestinations.filter(d => d.enabled);
      await Promise.all(
        enabledDestinations.map(dest => 
          rtmpRelayService.startRelay(dest.id, broadcastData?.ingestUrl || "")
        )
      );

      // Update broadcast status
      await fetch(`/api/live/${broadcastId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LIVE" }),
      });
    } catch (error) {
      console.error("Error going live:", error);
      setIsLive(false);
      setLiveKitConnected(false);
    }
  };

  // Stop Live
  const handleStopLive = async () => {
    if (!broadcastId) return;

    try {
      setIsLive(false);
      
      // Stop all RTMP relays
      await rtmpRelayService.stopAllRelays();

      // Update broadcast status
      await fetch(`/api/live/${broadcastId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });
    } catch (error) {
      console.error("Error stopping live:", error);
    }
  };

  // Toggle Recording
  const handleToggleRecording = async () => {
    if (!broadcastId || !broadcastData) return;

    try {
      if (isRecording) {
        // Stop recording
        const activeRecording = recordings.find(r => r.status === "ACTIVE");
        if (activeRecording) {
          await egressService.stopRecording(activeRecording.id);
          setRecordings(prev => prev.map(r => 
            r.id === activeRecording.id ? { ...r, status: "COMPLETED" as const } : r
          ));
        }
        setIsRecording(false);
      } else {
        // Start recording using LiveKit Egress
        const config = egressService.createFileRecordingConfig(broadcastData.livekitRoom || broadcastId);
        const recording = await egressService.startRecording(config);
        setRecordings(prev => [...prev, recording]);
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Error toggling recording:", error);
    }
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
  };

  // Toggle Microphone
  const handleToggleMicrophone = () => {
    setMicrophoneEnabled(!microphoneEnabled);
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    try {
      if (screenSharing) {
        // Stop screen sharing
        setScreenSharing(false);
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenSharing(true);
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  // Panel configurations based on mode
  const getAvailablePanels = (): StudioPanel[] => {
    if (mode === "RADIO") {
      // Radio mode: audio-focused panels
      return [
        "production",
        "audio",
        "broadcast",
        "recording",
        "destinations",
        "stats",
        "settings",
      ];
    }

    // Video mode: full OBS-like experience
    return [
      "production",
      "scenes",
      "sources",
      "audio",
      "guests",
      "chat",
      "overlays",
      "broadcast",
      "recording",
      "destinations",
      "stats",
      "settings",
    ];
  };

  const availablePanels = getAvailablePanels();

  return (
    <div className="h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <div className="h-14 bg-[#16162a] border-b border-[#2a2a4a] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-semibold text-lg">
            Studio {mode === "CHURCH" ? "Église" : mode === "RADIO" ? "Radio" : mode}
          </h1>
          {broadcastData && (
            <span className="text-gray-400 text-sm">{broadcastData.title}</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Elapsed Time */}
          {isLive && (
            <div className="text-white font-mono">
              {formatElapsedTime(elapsedTime)}
            </div>
          )}

          {/* Viewer Count */}
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={16} />
            <span>{viewerCount}</span>
          </div>

          {/* Live Status */}
          {isLive && (
            <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-semibold">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Panels */}
        <div className="w-80 bg-[#16162a] border-r border-[#2a2a4a] flex flex-col">
          {/* Panel Tabs */}
          <div className="flex overflow-x-auto border-b border-[#2a2a4a] p-2 gap-1">
            {availablePanels.map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`px-3 py-2 rounded-lg text-sm capitalize transition ${
                  activePanel === panel
                    ? "bg-emerald-600 text-white"
                    : "text-gray-400 hover:bg-[#2a2a4a] hover:text-white"
                }`}
              >
                {panel}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === "production" && (
              <div className="text-gray-400">
                <h3 className="text-white font-semibold mb-4">Production</h3>
                <p className="text-sm">Select a panel to configure your studio.</p>
              </div>
            )}

            {activePanel === "scenes" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Scènes</h3>
                <div className="space-y-2">
                  {sceneEngine.scenes.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => sceneEngine.setActiveScene(scene.id)}
                      className={`w-full p-3 rounded-lg text-left transition ${
                        scene.isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a]"
                      }`}
                    >
                      <div className="font-medium">{scene.name}</div>
                      {scene.description && (
                        <div className="text-xs opacity-70">{scene.description}</div>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => sceneEngine.createScene(`Scene ${sceneEngine.scenes.length + 1}`)}
                    className="w-full p-3 rounded-lg bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a] transition"
                  >
                    + Add Scene
                  </button>
                </div>
              </div>
            )}

            {activePanel === "audio" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Mixeur Audio</h3>
                <div className="space-y-4">
                  {audioEngine.channels.map((channel) => (
                    <div key={channel.id} className="bg-[#2a2a4a] p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm">{channel.name}</span>
                        <button
                          onClick={() => audioEngine.toggleMute(channel.id)}
                          className={`p-1 rounded ${
                            channel.muted ? "bg-red-600" : "bg-gray-600"
                          }`}
                        >
                          {channel.muted ? <MicOff size={14} /> : <Mic size={14} />}
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={channel.volume}
                        onChange={(e) => audioEngine.setVolume(channel.id, parseInt(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{channel.volume}%</span>
                        <span>{Math.round(channel.peak * 100)} dB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePanel === "broadcast" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Diffusion</h3>
                <div className="space-y-4">
                  <div className="bg-[#2a2a4a] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Statut</div>
                    <div className={`text-lg font-semibold ${isLive ? "text-red-500" : "text-gray-400"}`}>
                      {isLive ? "EN DIRECT" : "HORS LIGNE"}
                    </div>
                  </div>
                  
                  {broadcastData && (
                    <>
                      <div className="bg-[#2a2a4a] p-4 rounded-lg">
                        <div className="text-gray-400 text-sm mb-2">Stream Key</div>
                        <div className="text-white font-mono text-sm break-all">
                          {broadcastData.streamKey}
                        </div>
                      </div>
                      <div className="bg-[#2a2a4a] p-4 rounded-lg">
                        <div className="text-gray-400 text-sm mb-2">RTMP URL</div>
                        <div className="text-white font-mono text-sm break-all">
                          {broadcastData.rtmpUrl}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activePanel === "recording" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Enregistrement</h3>
                <div className="space-y-4">
                  <div className="bg-[#2a2a4a] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Statut</div>
                    <div className={`text-lg font-semibold ${isRecording ? "text-red-500" : "text-gray-400"}`}>
                      {isRecording ? "ENREGISTREMENT" : "ARRÊTÉ"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {recordings.map((recording) => (
                      <div key={recording.id} className="bg-[#2a2a4a] p-3 rounded-lg">
                        <div className="text-white text-sm">{recording.filename}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {formatElapsedTime(recording.duration)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activePanel === "destinations" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Destinations RTMP</h3>
                <div className="space-y-2">
                  {relayDestinations.map((dest) => (
                    <div key={dest.id} className="bg-[#2a2a4a] p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm">{dest.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          dest.status === "LIVE" ? "bg-green-600" :
                          dest.status === "ERROR" ? "bg-red-600" :
                          "bg-gray-600"
                        }`}>
                          {dest.status}
                        </span>
                      </div>
                      {dest.bitrate && (
                        <div className="text-gray-400 text-xs">
                          {dest.bitrate} kbps
                        </div>
                      )}
                    </div>
                  ))}
                  <button className="w-full p-3 rounded-lg bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a] transition">
                    + Add Destination
                  </button>
                </div>
              </div>
            )}

            {activePanel === "stats" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="bg-[#2a2a4a] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Viewers</div>
                    <div className="text-white text-2xl font-semibold">{viewerCount}</div>
                  </div>
                  <div className="bg-[#2a2a4a] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Durée</div>
                    <div className="text-white text-2xl font-semibold">
                      {formatElapsedTime(elapsedTime)}
                    </div>
                  </div>
                  <div className="bg-[#2a2a4a] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Connexion</div>
                    <div className={`text-2xl font-semibold ${liveKitConnected ? "text-green-500" : "text-gray-400"}`}>
                      {liveKitConnected ? "Connecté" : "Déconnecté"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePanel === "settings" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Paramètres</h3>
                <div className="space-y-4">
                  <div className="bg-[#2a2a4a] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Mode</div>
                    <div className="text-white">{mode}</div>
                  </div>
                  {churchId && (
                    <div className="bg-[#2a2a4a] p-4 rounded-lg">
                      <div className="text-gray-400 text-sm mb-2">Église</div>
                      <div className="text-white">{churchSlug}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePanel === "sources" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Sources</h3>
                <div className="space-y-2">
                  {sceneEngine.activeScene?.sources.map((source) => (
                    <div key={source.id} className="bg-[#2a2a4a] p-3 rounded-lg">
                      <div className="text-white text-sm">{source.name}</div>
                      <div className="text-gray-400 text-xs mt-1">{source.type}</div>
                    </div>
                  ))}
                  <button className="w-full p-3 rounded-lg bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a] transition">
                    + Add Source
                  </button>
                </div>
              </div>
            )}

            {activePanel === "guests" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Participants</h3>
                <div className="text-gray-400 text-sm">
                  Participants LiveKit will be displayed here.
                </div>
              </div>
            )}

            {activePanel === "chat" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Chat Studio</h3>
                <div className="text-gray-400 text-sm">
                  Studio chat will be displayed here.
                </div>
              </div>
            )}

            {activePanel === "overlays" && (
              <div>
                <h3 className="text-white font-semibold mb-4">Overlays</h3>
                <div className="space-y-2">
                  {overlayEngine.overlays.map((overlay) => (
                    <div key={overlay.id} className="bg-[#2a2a4a] p-3 rounded-lg">
                      <div className="text-white text-sm">{overlay.name}</div>
                      <div className="text-gray-400 text-xs mt-1">{overlay.type}</div>
                    </div>
                  ))}
                  <button className="w-full p-3 rounded-lg bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a] transition">
                    + Add Overlay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col">
          {mode === "RADIO" ? (
            // Radio mode: Audio-focused interface
            <div className="flex-1 bg-black flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <Radio size={64} className="mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Mode Radio</h2>
                <p className="text-sm">Audio Only Broadcasting</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
                  <span>{isLive ? "ON AIR" : "OFF AIR"}</span>
                </div>
              </div>
            </div>
          ) : (
            // Video mode: OBS-like Preview/Program
            <div className="flex-1 bg-black flex">
              {/* Preview */}
              <div className="flex-1 border-r border-[#2a2a4a] flex flex-col">
                <div className="h-8 bg-[#16162a] flex items-center justify-between px-4">
                  <span className="text-gray-400 text-sm">Preview</span>
                </div>
                <div className="flex-1 flex items-center justify-center bg-[#0a0a14]">
                  {mediaStream ? (
                    <video
                      ref={videoElementRef}
                      autoPlay
                      muted
                      playsInline
                      className="max-w-full max-h-full object-contain"
                      onLoadedMetadata={() => {
                        if (videoElementRef.current) {
                          videoElementRef.current.srcObject = mediaStream;
                        }
                      }}
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Layout size={48} className="mx-auto mb-2" />
                      <p>Preview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Program */}
              <div className="flex-1 flex flex-col">
                <div className="h-8 bg-[#16162a] flex items-center justify-between px-4">
                  <span className="text-gray-400 text-sm">Program</span>
                </div>
                <div className="flex-1 flex items-center justify-center bg-[#0a0a14]">
                  {mediaStream ? (
                    <video
                      ref={programVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="max-w-full max-h-full object-contain"
                      onLoadedMetadata={() => {
                        if (programVideoRef.current) {
                          programVideoRef.current.srcObject = mediaStream;
                        }
                      }}
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Layout size={48} className="mx-auto mb-2" />
                      <p>Program</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Control Bar */}
          <div className="h-16 bg-[#16162a] border-t border-[#2a2a4a] flex items-center justify-center gap-4">
            {/* Camera Toggle */}
            {mode !== "RADIO" && (
              <button
                onClick={handleToggleCamera}
                className={`p-3 rounded-lg transition ${
                  cameraEnabled ? "bg-emerald-600 text-white" : "bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a]"
                }`}
              >
                {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            )}

            {/* Microphone Toggle */}
            <button
              onClick={handleToggleMicrophone}
              className={`p-3 rounded-lg transition ${
                microphoneEnabled ? "bg-emerald-600 text-white" : "bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a]"
              }`}
            >
              {microphoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            {/* Screen Share Toggle */}
            {mode !== "RADIO" && (
              <button
                onClick={handleToggleScreenShare}
                className={`p-3 rounded-lg transition ${
                  screenSharing ? "bg-emerald-600 text-white" : "bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a]"
                }`}
              >
                <MonitorUp size={20} />
              </button>
            )}

            {/* Volume */}
            <div className="flex items-center gap-2 bg-[#2a2a4a] px-3 py-2 rounded-lg">
              <Volume2 size={20} className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={audioEngine.config.outputVolume}
                onChange={(e) => audioEngine.setOutputVolume(parseInt(e.target.value))}
                className="w-24 accent-emerald-500"
              />
            </div>

            {/* Recording Toggle */}
            <button
              onClick={handleToggleRecording}
              className={`p-3 rounded-lg transition ${
                isRecording ? "bg-red-600 text-white" : "bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a]"
              }`}
            >
              {isRecording ? <Square size={20} /> : <Circle size={20} />}
            </button>

            {/* Go Live / Stop Live */}
            {isLive ? (
              <button
                onClick={handleStopLive}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Stop Live
              </button>
            ) : (
              <button
                onClick={handleGoLive}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
              >
                Go Live
              </button>
            )}

            {/* Settings */}
            <button className="p-3 rounded-lg bg-[#2a2a4a] text-gray-400 hover:bg-[#3a3a5a] transition">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
