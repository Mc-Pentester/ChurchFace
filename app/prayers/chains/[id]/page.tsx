"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PrayerChainWithLinks, PrayerParticipant, PrayerSchedule, PrayerRoom } from "@/types/prayer";
import { usePrayerParticipants, usePrayerSchedule, usePrayerRooms } from "@/hooks/usePrayers";
import { Users, Calendar, Lock, Globe, ArrowLeft, Settings, Share2, Video, Mic, MessageSquare } from "lucide-react";

export default function PrayerChainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chainId = params.id as string;

  const [chain, setChain] = useState<PrayerChainWithLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"participants" | "schedule" | "rooms">("participants");

  const { participants, loading: participantsLoading, fetchParticipants } = usePrayerParticipants(chainId);
  const { schedules, loading: schedulesLoading } = usePrayerSchedule(chainId);
  const { rooms, loading: roomsLoading } = usePrayerRooms({ prayerChainId: chainId });

  useEffect(() => {
    fetchChain();
    fetchParticipants();
  }, [chainId, fetchParticipants]);

  const fetchChain = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prayers/chain`);
      const data = await res.json();
      const foundChain = data.chains?.find((c: PrayerChainWithLinks) => c.id === chainId);
      setChain(foundChain || null);
    } catch (error) {
      console.error("Erreur récupération chaîne:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Chaîne non trouvée</h1>
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

  const visibilityIcon = chain.visibility === "PRIVATE" ? Lock : Globe;
  const visibilityLabel = chain.visibility === "PRIVATE" ? "Privé" : "Public";

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

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{chain.title}</h1>
              <div className="flex items-center gap-1 text-gray-500">
                {chain.visibility === "PRIVATE" ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                <span className="text-sm">{visibilityLabel}</span>
              </div>
            </div>
            {chain.description && (
              <p className="text-gray-600 mt-2">{chain.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
              Partager
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
              <p className="text-sm text-gray-600">Participants</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
              <p className="text-sm text-gray-600">Horaires</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              <p className="text-sm text-gray-600">Salles</p>
            </div>
          </div>
        </div>

        {chain.scheduledStart && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(chain.scheduledStart).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Début programmé</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-4">
            <button
              onClick={() => setActiveTab("participants")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "participants"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Participants
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "schedule"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Horaires
            </button>
            <button
              onClick={() => setActiveTab("rooms")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === "rooms"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Salles de prière
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "participants" && (
            <div>
              {participantsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              ) : participants.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Aucun participant pour le moment</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {participant.user.image && (
                          <img
                            src={participant.user.image}
                            alt={participant.user.name || "Participant"}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{participant.user.name}</p>
                          <p className="text-sm text-gray-600">{participant.role}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {participant.prayerCount} prière{participant.prayerCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "schedule" && (
            <div>
              {schedulesLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              ) : schedules.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Aucun horaire programmé</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{schedule.hour}:00</p>
                        <p className="text-sm text-gray-600">
                          {schedule.dayOfWeek !== null ? `Jour ${schedule.dayOfWeek}` : "Tous les jours"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        schedule.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {schedule.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "rooms" && (
            <div>
              {roomsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              ) : rooms.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Aucune salle de prière</p>
              ) : (
                <div className="space-y-2">
                  {rooms.map((room) => {
                    const RoomIcon = room.roomType === "VIDEO" ? Video : room.roomType === "AUDIO" ? Mic : MessageSquare;
                    return (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => router.push(`/prayers/rooms/${room.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <RoomIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">{room.title}</p>
                            <p className="text-sm text-gray-600">{room.roomType}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          room.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {room.isActive ? "Actif" : "Terminé"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
