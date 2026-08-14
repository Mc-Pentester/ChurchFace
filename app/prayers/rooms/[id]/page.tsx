"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PrayerRoom } from "@/types/prayer";
import { ArrowLeft, Users, Video, Mic, MessageSquare, Lock, Globe, Share2, Check } from "lucide-react";
import LiveKitRoom from "@/components/livekit/LiveKitRoom";
import { ShareModal } from "@/components/prayer/modals/ShareModal";
import { useRevalidateOnMount } from "@/hooks/useRevalidateOnMount";

export default function PrayerRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  // Revalider les données quand le composant est monté (navigation arrière)
  useRevalidateOnMount();

  const [room, setRoom] = useState<PrayerRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [joined, setJoined] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchRoom();
    fetchParticipants();
    // Récupérer le nom d'utilisateur depuis la session
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.user?.name) {
          setUserName(data.user.name);
        }
      } catch (error) {
        console.error("Erreur récupération utilisateur:", error);
      }
    };
    fetchUser();

    // Écouter l'événement de revalidation (navigation arrière)
    const handleRevalidate = () => {
      fetchRoom();
      fetchParticipants();
    };

    window.addEventListener('revalidate-data', handleRevalidate);

    return () => {
      window.removeEventListener('revalidate-data', handleRevalidate);
    };
  }, [roomId]);

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`/api/prayers/rooms/${roomId}/participants`);
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error("Erreur récupération participants:", error);
    }
  };

  const fetchRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prayers/rooms?prayerChainId=${roomId}`);
      const data = await res.json();
      const foundRoom = data.rooms?.find((r: PrayerRoom) => r.id === roomId);
      setRoom(foundRoom || null);
      setParticipantCount(foundRoom?._count?.participants || 0);
    } catch (error) {
      console.error("Erreur récupération salle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setTokenLoading(true);
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomId,
          participantName: userName,
          isPublisher: true,
        }),
      });
      const data = await res.json();
      setToken(data.token);
      setUrl(data.url);
      setJoined(true);
      setParticipantCount(prev => prev + 1);
    } catch (error) {
      console.error("Erreur rejoindre salle:", error);
    } finally {
      setTokenLoading(false);
    }
  };

  const handleLeave = () => {
    setJoined(false);
    setToken(null);
    setUrl(null);
    setParticipantCount(prev => Math.max(0, prev - 1));
  };

  const handleShareRoom = () => {
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Salle non trouvée</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const RoomIcon = room.roomType === "VIDEO" ? Video : room.roomType === "AUDIO" ? Mic : MessageSquare;
  const isActive = room.isActive;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{room.title}</h1>
              <div className="flex items-center gap-2">
                <RoomIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">{room.roomType}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {isActive ? "Actif" : "Terminé"}
                </span>
              </div>
            </div>
            {room.description && (
              <p className="text-gray-600 mt-2">{room.description}</p>
            )}
          </div>

          {!joined && isActive && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleShareRoom}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 flex-1 sm:flex-none"
              >
                <Share2 className="w-5 h-5" />
                Partager
              </button>
              <button
                onClick={handleJoin}
                disabled={tokenLoading}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex-1 sm:flex-none"
              >
                {tokenLoading ? "Chargement..." : "Rejoindre"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{participantCount}</p>
              <p className="text-sm text-gray-600">Participants</p>
            </div>
          </div>
        </div>

        {room.maxParticipants && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{room.maxParticipants}</p>
                <p className="text-sm text-gray-600">Capacité max</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            {room.isPublic ? (
              <Globe className="w-8 h-8 text-purple-600" />
            ) : (
              <Lock className="w-8 h-8 text-purple-600" />
            )}
            <div>
              <p className="text-sm font-bold text-gray-900">{room.isPublic ? "Public" : "Privé"}</p>
              <p className="text-sm text-gray-600">Visibilité</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {joined && token && url ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="aspect-video">
            <LiveKitRoom
              token={token}
              serverUrl={url}
              roomName={roomId}
              onConnected={() => console.log("LiveKit connected")}
              onDisconnected={() => {
                setJoined(false);
                setToken(null);
                setUrl(null);
                setParticipantCount(prev => Math.max(0, prev - 1));
              }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <RoomIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isActive ? "Rejoignez la salle de prière" : "Cette salle est terminée"}
          </h2>
          <p className="text-gray-600 mb-4">
            {isActive
              ? "Cliquez sur le bouton ci-dessus pour rejoindre la session en temps réel"
              : "Cette session de prière est terminée. Consultez l'historique pour voir les enregistrements."}
          </p>
        </div>
      )}

      {/* Participants List */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants actuels ({participants.length})</h3>
        <div className="space-y-2">
          {participants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun participant pour le moment</p>
          ) : (
            participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {participant.user.image ? (
                  <img
                    src={participant.user.image}
                    alt={participant.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {participant.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{participant.user.name}</p>
                  <p className="text-sm text-gray-600">Rejoint le {new Date(participant.joinedAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={`${window.location.origin}/prayers/rooms/${roomId}`}
        title={room?.title || "Salle de prière"}
      />
    </div>
  );
}
