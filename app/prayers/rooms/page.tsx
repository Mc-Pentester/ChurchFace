"use client";

import { useState, useEffect } from "react";
import { PrayerRoom } from "@/types/prayer";
import { PrayerRoomList } from "@/components/prayer/rooms/PrayerRoomList";
import { usePrayerRooms } from "@/hooks/usePrayers";
import { Plus, Filter, Video, Mic, MessageSquare } from "lucide-react";

export default function PrayerRoomsPage() {
  const [rooms, setRooms] = useState<PrayerRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ACTIVE");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const { createRoom, joinRoom } = usePrayerRooms();

  useEffect(() => {
    fetchRooms();
  }, [filter, typeFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "ACTIVE") params.isActive = true;
      if (filter === "INACTIVE") params.isActive = false;

      const res = await fetch(`/api/prayers/rooms?${new URLSearchParams(params)}`);
      const data = await res.json();
      
      let filteredRooms = data;
      if (typeFilter !== "ALL") {
        filteredRooms = data.filter((room: PrayerRoom) => room.roomType === typeFilter);
      }
      
      setRooms(filteredRooms);
    } catch (error) {
      console.error("Erreur récupération salles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (roomId: string) => {
    try {
      await joinRoom(roomId);
      window.location.href = `/prayers/rooms/${roomId}`;
    } catch (error) {
      console.error("Erreur rejoindre salle:", error);
    }
  };

  const handleView = (roomId: string) => {
    window.location.href = `/prayers/rooms/${roomId}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salles de prière</h1>
          <p className="text-gray-600 mt-1">Rejoignez des salles de prière en temps réel</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Créer une salle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "ACTIVE"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilter("INACTIVE")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "INACTIVE"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Terminées
            </button>
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toutes
            </button>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                typeFilter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setTypeFilter("TEXT")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                typeFilter === "TEXT"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Texte
            </button>
            <button
              onClick={() => setTypeFilter("AUDIO")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                typeFilter === "AUDIO"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Mic className="w-4 h-4" />
              Audio
            </button>
            <button
              onClick={() => setTypeFilter("VIDEO")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                typeFilter === "VIDEO"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Video className="w-4 h-4" />
              Vidéo
            </button>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      <PrayerRoomList
        rooms={rooms}
        onJoin={handleJoin}
        onView={handleView}
        loading={loading}
      />
    </div>
  );
}
