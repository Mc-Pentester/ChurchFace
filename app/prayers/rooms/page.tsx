"use client";

import { useState, useEffect } from "react";
import { PrayerRoom } from "@/types/prayer";
import { PrayerRoomCard } from "@/components/prayer/rooms/PrayerRoomCard";
import { CreatePrayerRoomModal } from "@/components/prayer/modals/CreatePrayerRoomModal";
import { Plus, Filter } from "lucide-react";
import { useRevalidateOnMount } from "@/hooks/useRevalidateOnMount";

export default function PrayerRoomsPage() {
  // Revalider les données quand le composant est monté (navigation arrière)
  useRevalidateOnMount();

  const [rooms, setRooms] = useState<PrayerRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ENDED">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [filter, typeFilter]);

  // Écouter l'événement de revalidation (navigation arrière)
  useEffect(() => {
    const handleRevalidate = () => {
      fetchRooms();
    };

    window.addEventListener('revalidate-data', handleRevalidate);

    return () => {
      window.removeEventListener('revalidate-data', handleRevalidate);
    };
  }, [filter, typeFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prayers/rooms");
      const data = await res.json();

      let filteredRooms = data.rooms || [];
      if (filter === "ACTIVE") {
        filteredRooms = filteredRooms.filter((r: PrayerRoom) => r.isActive);
      } else if (filter === "ENDED") {
        filteredRooms = filteredRooms.filter((r: PrayerRoom) => !r.isActive);
      }
      if (typeFilter !== "ALL") {
        filteredRooms = filteredRooms.filter((r: PrayerRoom) => r.roomType === typeFilter);
      }

      setRooms(filteredRooms);
    } catch (error) {
      console.error("Erreur récupération salles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (roomId: string) => {
    window.location.href = `/prayers/rooms/${roomId}`;
  };

  const handleView = (roomId: string) => {
    window.location.href = `/prayers/rooms/${roomId}`;
  };

  const handleShare = async (roomId: string) => {
    const shareUrl = `${window.location.origin}/prayers/rooms/${roomId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (error) {
      console.error("Erreur copie lien:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Salles de prière</h1>
          <p className="text-gray-600 mt-1">Rejoignez des salles de prière en temps réel (texte, audio, vidéo)</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          Créer une salle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "ALL"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter("ACTIVE")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Actives
              </button>
              <button
                onClick={() => setFilter("ENDED")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "ENDED"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Terminées
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white w-full"
            >
              <option value="ALL">Tous types</option>
              <option value="TEXT">Texte</option>
              <option value="AUDIO">Audio</option>
              <option value="VIDEO">Vidéo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune salle trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <PrayerRoomCard
              key={room.id}
              room={room}
              onJoin={handleJoin}
              onView={handleView}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePrayerRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            try {
              const res = await fetch("/api/prayers/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              if (res.ok) {
                await fetchRooms();
              }
            } catch (error) {
              console.error("Erreur création salle:", error);
            }
          }}
        />
      )}
    </div>
  );
}
