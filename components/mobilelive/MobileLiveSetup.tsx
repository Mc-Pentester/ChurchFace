/**
 * Composant de configuration pour Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 * Interface de préparation avant le live (caméra, micro, paramètres)
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  FlipHorizontal, 
  X, 
  Video,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useMobileLive } from "@/hooks/useMobileLive";
import { MobileLiveContext, MobileLiveConfig, MobileLiveCamera } from "@/lib/mobilelive/MobileLiveTypes";

interface MobileLiveSetupProps {
  context: MobileLiveContext;
  ownerId: string;
  ownerType: "USER" | "CHURCH";
  ownerName: string;
  onClose: () => void;
  onStart: (sessionId: string) => void;
}

export default function MobileLiveSetup({
  context,
  ownerId,
  ownerType,
  ownerName,
  onClose,
  onStart,
}: MobileLiveSetupProps) {
  const { createSession, startLive, isLoading, error } = useMobileLive();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [currentCamera, setCurrentCamera] = useState<MobileLiveCamera>("front");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "SUBSCRIBERS" | "PRIVATE">("PUBLIC");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [enableRecording, setEnableRecording] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMultiStream, setShowMultiStream] = useState(false);
  const [externalDestinations, setExternalDestinations] = useState<Array<{
    type: "YOUTUBE" | "FACEBOOK" | "TWITCH" | "CUSTOM";
    rtmpUrl?: string;
    streamKey?: string;
    enabled: boolean;
  }>>([]);

  const categories = ["", "Culte", "Louange", "Prédication", "Témoignage", "Actualités", "Autre"];

  // Initialiser la caméra
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [currentCamera]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: currentCamera === "front" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: microphoneEnabled,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    setCurrentCamera(prev => prev === "front" ? "back" : "front");
  };

  const toggleCameraEnabled = () => {
    setCameraEnabled(prev => !prev);
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled;
      }
    }
  };

  const toggleMicrophone = () => {
    setMicrophoneEnabled(prev => !prev);
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !microphoneEnabled;
      }
    }
  };

  const handleStartLive = async () => {
    if (!title.trim()) {
      alert("Veuillez entrer un titre pour votre live");
      return;
    }

    const config: MobileLiveConfig = {
      title: title.trim(),
      description: description.trim() || undefined,
      category: category || undefined,
      visibility,
      enableRecording,
      enableChat: true,
      enableReactions: true,
      externalDestinations: externalDestinations.filter(d => d.enabled),
    };

    const session = await createSession({
      context,
      ownerId,
      ownerType,
      config,
    });

    if (session) {
      const startedSession = await startLive(session.id);
      if (startedSession) {
        onStart(startedSession.id);
      }
    }
  };

  const getContextLabel = () => {
    return context === "PERSONAL" ? "Votre profil" : `Église : ${ownerName}`;
  };

  const getVisibilityLabel = () => {
    switch (visibility) {
      case "PUBLIC": return "Public";
      case "SUBSCRIBERS": return "Abonnés uniquement";
      case "PRIVATE": return "Privé";
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={onClose}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-white text-center">
          <p className="text-sm font-medium">Nouveau live</p>
          <p className="text-xs text-white/70">{getContextLabel()}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!cameraEnabled ? 'hidden' : ''}`}
        />
        
        {!cameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <CameraOff className="w-16 h-16 text-gray-600" />
          </div>
        )}

        {/* Camera Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={toggleCameraEnabled}
            className={`p-3 rounded-full transition ${
              cameraEnabled 
                ? "bg-white/20 backdrop-blur-sm text-white" 
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {cameraEnabled ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleCamera}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white transition hover:bg-white/30"
          >
            <FlipHorizontal className="w-6 h-6" />
          </button>

          <button
            onClick={toggleMicrophone}
            className={`p-3 rounded-full transition ${
              microphoneEnabled 
                ? "bg-white/20 backdrop-blur-sm text-white" 
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {microphoneEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Setup Form */}
      <div className="bg-white rounded-t-3xl p-6 space-y-4 max-h-[50vh] overflow-y-auto">
        {/* Title */}
        <input
          type="text"
          placeholder="Titre de votre live..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          maxLength={100}
        />

        {/* Description */}
        <textarea
          placeholder="Description (optionnel)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          rows={2}
          maxLength={500}
        />

        {/* Category */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <span>{category || "Catégorie (optionnel)"}</span>
            {showCategoryDropdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showCategoryDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition first:rounded-t-xl last:rounded-b-xl"
                >
                  {cat || "Aucune"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Visibility */}
        <div className="relative">
          <button
            onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-900 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <span>Visibilité : {getVisibilityLabel()}</span>
            {showVisibilityDropdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showVisibilityDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
              {(["PUBLIC", "SUBSCRIBERS", "PRIVATE"] as const).map((vis) => (
                <button
                  key={vis}
                  onClick={() => {
                    setVisibility(vis);
                    setShowVisibilityDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition first:rounded-t-xl last:rounded-b-xl"
                >
                  {vis === "PUBLIC" ? "Public" : vis === "SUBSCRIBERS" ? "Abonnés uniquement" : "Privé"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recording Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-gray-900">Enregistrer le live</span>
          <button
            onClick={() => setEnableRecording(!enableRecording)}
            className={`w-12 h-7 rounded-full transition ${
              enableRecording ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition transform ${
                enableRecording ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Multi-Stream Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-gray-900">Multi-stream (YouTube, Facebook, etc.)</span>
          <button
            onClick={() => setShowMultiStream(!showMultiStream)}
            className={`w-12 h-7 rounded-full transition ${
              showMultiStream ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition transform ${
                showMultiStream ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* External Destinations */}
        {showMultiStream && (
          <div className="space-y-3 pt-3 border-t">
            <button
              onClick={() => {
                setExternalDestinations([...externalDestinations, {
                  type: "YOUTUBE",
                  enabled: true,
                }]);
              }}
              className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition"
            >
              + Ajouter une destination
            </button>

            {externalDestinations.map((dest, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <select
                    value={dest.type}
                    onChange={(e) => {
                      const newDest = [...externalDestinations];
                      newDest[index].type = e.target.value as any;
                      setExternalDestinations(newDest);
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="YOUTUBE">YouTube</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="TWITCH">Twitch</option>
                    <option value="CUSTOM">Custom RTMP</option>
                  </select>
                  <button
                    onClick={() => {
                      setExternalDestinations(externalDestinations.filter((_, i) => i !== index));
                    }}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="URL RTMP"
                  value={dest.rtmpUrl || ""}
                  onChange={(e) => {
                    const newDest = [...externalDestinations];
                    newDest[index].rtmpUrl = e.target.value;
                    setExternalDestinations(newDest);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />

                <input
                  type="text"
                  placeholder="Clé de stream"
                  value={dest.streamKey || ""}
                  onChange={(e) => {
                    const newDest = [...externalDestinations];
                    newDest[index].streamKey = e.target.value;
                    setExternalDestinations(newDest);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Activer</span>
                  <button
                    onClick={() => {
                      const newDest = [...externalDestinations];
                      newDest[index].enabled = !newDest[index].enabled;
                      setExternalDestinations(newDest);
                    }}
                    className={`w-10 h-6 rounded-full transition ${
                      dest.enabled ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition transform ${
                        dest.enabled ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStartLive}
          disabled={isLoading || !title.trim()}
          className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Démarrage...</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span>Démarrer le direct</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
