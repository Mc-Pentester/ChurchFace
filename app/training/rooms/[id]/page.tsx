"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TrainingRoom } from "@/types/training";
import TrainingLiveKitRoom from "@/components/training/TrainingLiveKitRoom";
import { ArrowLeft, Users, Video, Mic, MessageSquare, Lock, Globe } from "lucide-react";

export default function TrainingRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<TrainingRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetchRoom();
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
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/training/rooms/${roomId}`);
      const data = await res.json();
      setRoom(data.room);
    } catch (error) {
      console.error("Erreur récupération formation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    setJoined(true);
  };

  const handleLeave = () => {
    setJoined(false);
  };

  const ROOM_TYPE_ICONS = {
    TEXT: MessageSquare,
    AUDIO: Mic,
    VIDEO: Video,
  };

  const ROOM_TYPE_LABELS = {
    TEXT: "Texte",
    AUDIO: "Audio",
    VIDEO: "Vidéo",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Formation non trouvée</p>
      </div>
    );
  }

  const Icon = ROOM_TYPE_ICONS[room.roomType as keyof typeof ROOM_TYPE_ICONS] || Video;
  const typeLabel = ROOM_TYPE_LABELS[room.roomType as keyof typeof ROOM_TYPE_LABELS] || "Vidéo";

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
              {room.description && (
                <p className="text-gray-600 mb-4">{room.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{typeLabel}</span>
                </div>
                {room.isPublic ? (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Privé</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{room._count?.participants || 0} participant(s)</span>
                </div>
              </div>
            </div>

            {!joined && room.isActive && (
              <button
                onClick={handleJoin}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                Rejoindre la formation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Room */}
      {joined && room.isActive && (
        <TrainingLiveKitRoom
          room={room}
          userName={userName}
        />
      )}

      {!joined && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600">
            Cliquez sur "Rejoindre la formation" pour participer à cette session en direct.
          </p>
        </div>
      )}

      {!room.isActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">
            Cette formation est terminée.
          </p>
        </div>
      )}
    </div>
  );
}
