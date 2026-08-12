"use client";

import { PrayerRoom } from "@/types/prayer";
import { PrayerRoomCard } from "./PrayerRoomCard";

interface PrayerRoomListProps {
  rooms: PrayerRoom[];
  onJoin?: (roomId: string) => void;
  onView?: (roomId: string) => void;
  loading?: boolean;
}

export function PrayerRoomList({ rooms, onJoin, onView, loading = false }: PrayerRoomListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-56 animate-pulse" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune salle de prière disponible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <PrayerRoomCard
          key={room.id}
          room={room}
          onJoin={onJoin}
          onView={onView}
        />
      ))}
    </div>
  );
}
