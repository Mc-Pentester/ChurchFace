"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Video, Mic, MicOff, VideoOff, Settings, Users, Share2, MessageSquare, MonitorUp, Radio, StopCircle, Play, Square } from "lucide-react";

interface ChurchStudioLiveProps {
  live: any;
  isLive: boolean;
  setIsLive: (v: boolean) => void;
  onLiveUpdate?: (live: any) => void;
  churchSlug: string;
}

export default function ChurchStudioLive({
  live,
  isLive,
  setIsLive,
  onLiveUpdate,
  churchSlug,
}: ChurchStudioLiveProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [viewerCount, setViewerCount] = useState(live?.viewerCount || 0);
  const [elapsed, setElapsed] = useState(0);
  const [showGoLiveConfirm, setShowGoLiveConfirm] = useState(false);
  const [streamUrl, setStreamUrl] = useState(live?.streamUrl || "");
  const [title, setTitle] = useState(live?.title || "");
  const [description, setDescription] = useState(live?.description || "");
  const [thumbnail, setThumbnail] = useState(live?.thumbnail || "");
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setViewerCount(live?.viewerCount || 0);
    setStreamUrl(live?.streamUrl || "");
    setTitle(live?.title || "");
    setDescription(live?.description || "");
    setThumbnail(live?.thumbnail || "");
  }, [live]);

  // Accès à la caméra
  useEffect(() => {
    async function setupCamera() {
      if (!videoRef.current || !isVideoEnabled) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isAudioEnabled,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    }

    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isVideoEnabled, isAudioEnabled]);

  useEffect(() => {
    if (isLive && !timerRef.current) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else if (!isLive && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isLive]);

  function formatTime(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  async function toggleLive() {
    if (!isLive) {
      setShowGoLiveConfirm(true);
      return;
    }
    await updateLive({ status: "ENDED", endedAt: new Date() });
    setIsLive(false);
  }

  async function confirmGoLive() {
    setShowGoLiveConfirm(false);
    await updateLive({ status: "LIVE", startedAt: new Date() });
    setIsLive(true);
  }

  async function updateLive(data: any) {
    const churchLiveId = live?.id;
    
    if (!churchLiveId) return;
    
    const payload = {
      id: churchLiveId,
      ...data,
    };
    
    const res = await fetch(`/api/church/${churchSlug}/studio/live`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.churchLive) {
      onLiveUpdate?.(json.churchLive);
    }
  }

  async function saveSettings() {
    await updateLive({
      title,
      description,
      thumbnail,
      streamUrl,
    });
    setShowSettings(false);
  }

  function toggleVideo() {
    setIsVideoEnabled(!isVideoEnabled);
  }

  function toggleAudio() {
    setIsAudioEnabled(!isAudioEnabled);
  }

  function toggleScreenShare() {
    setIsScreenSharing(!isScreenSharing);
  }

  return (
    <main className="flex-1 min-w-0 bg-[#0a0a0f] overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* ── Video Preview / Stream ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Main Video Area */}
          <div className="xl:col-span-2 bg-[#16161f] rounded-xl overflow-hidden">
            <div className="relative aspect-video bg-black">
              {isVideoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <VideoOff size={48} className="text-gray-600" />
                </div>
              )}
              
              {/* Live Indicator */}
              {isLive && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              )}

              {/* Timer */}
              {isLive && (
                <div className="absolute top-4 right-4 bg-black/70 px-3 py-1.5 rounded-full">
                  <span className="text-white text-xs font-mono">{formatTime(elapsed)}</span>
                </div>
              )}

              {/* Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleVideo}
                      className={`p-2 rounded-lg ${isVideoEnabled ? "bg-emerald-600/80 text-white" : "bg-red-600/80 text-white"}`}
                    >
                      {isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                    </button>
                    <button
                      onClick={toggleAudio}
                      className={`p-2 rounded-lg ${isAudioEnabled ? "bg-emerald-600/80 text-white" : "bg-red-600/80 text-white"}`}
                    >
                      {isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                    <button
                      onClick={toggleScreenShare}
                      className={`p-2 rounded-lg ${isScreenSharing ? "bg-blue-600/80 text-white" : "bg-gray-700/80 text-white"}`}
                    >
                      <MonitorUp size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 rounded-lg bg-gray-700/80 text-white hover:bg-gray-600/80"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stream Info */}
          <div className="bg-[#16161f] rounded-xl p-4 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Informations du stream</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1e1e2d] rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="Titre de la diffusion"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1e1e2d] rounded-lg px-3 py-2 text-sm text-white h-20 resize-none"
                  placeholder="Description de la diffusion"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">URL du stream (RTMP/RTMPS)</label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full bg-[#1e1e2d] rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="rtmp://..."
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Miniature (URL)</label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full bg-[#1e1e2d] rounded-lg px-3 py-2 text-sm text-white"
                  placeholder="https://..."
                />
              </div>
            </div>

            <button
              onClick={saveSettings}
              className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition"
            >
              Enregistrer
            </button>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="bg-[#16161f] rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Contrôles de diffusion</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {!isLive ? (
              <button
                onClick={() => setShowGoLiveConfirm(true)}
                className="col-span-2 md:col-span-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <Radio size={16} /> Démarrer le Direct
              </button>
            ) : (
              <>
                <button
                  onClick={toggleLive}
                  className="py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  <StopCircle size={16} /> Arrêter
                </button>
                <button
                  onClick={toggleVideo}
                  className={`py-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${isVideoEnabled ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                >
                  {isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />} {isVideoEnabled ? "Caméra ON" : "Caméra OFF"}
                </button>
                <button
                  onClick={toggleAudio}
                  className={`py-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${isAudioEnabled ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                >
                  {isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />} {isAudioEnabled ? "Micro ON" : "Micro OFF"}
                </button>
                <button
                  onClick={toggleScreenShare}
                  className={`py-3 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2 ${isScreenSharing ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                >
                  <MonitorUp size={16} /> {isScreenSharing ? "Partage ON" : "Partage OFF"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#16161f] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-violet-400" />
              <span className="text-xs text-gray-400">Spectateurs</span>
            </div>
            <div className="text-2xl font-bold text-white">{viewerCount}</div>
          </div>
          
          <div className="bg-[#16161f] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio size={16} className={isLive ? "text-red-400" : "text-gray-400"} />
              <span className="text-xs text-gray-400">Statut</span>
            </div>
            <div className={`text-sm font-bold ${isLive ? "text-red-400" : "text-gray-400"}`}>
              {isLive ? "EN DIRECT" : "HORS LIGNE"}
            </div>
          </div>
          
          <div className="bg-[#16161f] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Play size={16} className="text-emerald-400" />
              <span className="text-xs text-gray-400">Durée</span>
            </div>
            <div className="text-lg font-bold text-white">{formatTime(elapsed)}</div>
          </div>
          
          <div className="bg-[#16161f] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Share2 size={16} className="text-blue-400" />
              <span className="text-xs text-gray-400">Partage</span>
            </div>
            <button className="text-sm text-violet-400 hover:text-violet-300">
              Copier le lien
            </button>
          </div>
        </div>

        {/* ── Chat / Comments ── */}
        <div className="bg-[#16161f] rounded-xl p-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <MessageSquare size={12} /> Chat en direct
          </h3>
          <div className="bg-[#1e1e2d] rounded-lg p-3 h-40 overflow-y-auto">
            <p className="text-xs text-gray-500 text-center">Le chat sera disponible pendant la diffusion</p>
          </div>
        </div>
      </div>

      {/* ── Go Live Confirm Modal ── */}
      {showGoLiveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <Radio size={20} /> Démarrer le Direct ?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Vous allez démarrer la diffusion en direct. Les spectateurs pourront voir votre vidéo en temps réel.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGoLiveConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmGoLive}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition"
              >
                ▶ Diffuser
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
