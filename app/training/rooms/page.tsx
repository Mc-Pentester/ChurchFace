"use client";

import { useState, useEffect } from "react";
import { TrainingRoom } from "@/types/training";
import { TrainingRoomCard } from "@/components/training/TrainingRoomCard";
import { CreateTrainingRoomModal } from "@/components/training/modals/CreateTrainingRoomModal";
import { Plus, Filter } from "lucide-react";

export default function TrainingRoomsPage() {
  const [rooms, setRooms] = useState<TrainingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ENDED">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [filter, typeFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/training/rooms");
      const data = await res.json();
      
      let filteredRooms = data.rooms || [];
      if (filter === "ACTIVE") {
        filteredRooms = filteredRooms.filter((r: TrainingRoom) => r.isActive);
      } else if (filter === "ENDED") {
        filteredRooms = filteredRooms.filter((r: TrainingRoom) => !r.isActive);
      }
      
      if (typeFilter !== "ALL") {
        filteredRooms = filteredRooms.filter((r: TrainingRoom) => r.roomType === typeFilter);
      }
      
      setRooms(filteredRooms);
    } catch (error) {
      console.error("Erreur récupération formations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (data: any) => {
    try {
      const res = await fetch("/api/training/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        fetchRooms();
      }
    } catch (error) {
      console.error("Erreur création formation:", error);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    window.location.href = `/training/rooms/${roomId}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Formations en ligne</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-5 h-5" />
          Créer une formation
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Toutes</option>
            <option value="ACTIVE">Actives</option>
            <option value="ENDED">Terminées</option>
          </select>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">Tous types</option>
          <option value="VIDEO">Vidéo</option>
          <option value="AUDIO">Audio</option>
          <option value="TEXT">Texte</option>
        </select>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune formation disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <TrainingRoomCard
              key={room.id}
              room={room}
              onJoin={handleJoinRoom}
            />
          ))}
        </div>
      )}

      <CreateTrainingRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
      />
    </div>
  );
}
