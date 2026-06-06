"use client";

import { BookOpen, Mic, Users, Link2 } from "lucide-react";
import type { PrayerChainWithLinks, PrayerLiveRoomWithCount } from "@/types/prayer";

interface Props {
  chains: PrayerChainWithLinks[];
  rooms: PrayerLiveRoomWithCount[];
}

export default function PrayerSidebarRight({ chains, rooms }: Props) {
  return (
    <aside className="space-y-6">
      {/* Verset du jour */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} />
          <h3 className="font-bold text-sm">Verset du jour</h3>
        </div>
        <p className="text-sm italic leading-relaxed opacity-90">
          "Demandez, et l'on vous donnera ; cherchez, et vous trouverez ; frappez, et l'on vous ouvrira."
        </p>
        <p className="text-xs mt-2 opacity-70">Matthieu 7:7</p>
      </div>

      {/* Salles de prière en direct */}
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h3 className="font-bold text-gray-800 text-sm">Salles de prière</h3>
        </div>
        {rooms.length === 0 ? (
          <p className="text-xs text-gray-400">Aucune salle active pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {rooms.slice(0, 3).map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-medium text-sm text-gray-800">{room.title}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} /> {room._count?.participants || 0} participants
                  </p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition">
                  Rejoindre
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chaînes de prière */}
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={18} className="text-emerald-600" />
          <h3 className="font-bold text-gray-800 text-sm">Chaînes actives</h3>
        </div>
        {chains.length === 0 ? (
          <p className="text-xs text-gray-400">Aucune chaîne active.</p>
        ) : (
          <div className="space-y-3">
            {chains.slice(0, 3).map((chain) => (
              <div
                key={chain.id}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="font-medium text-sm text-gray-800">{chain.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex -space-x-1.5">
                    {chain.links?.slice(0, 3).map((link) => (
                      <div
                        key={link.id}
                        className="w-5 h-5 rounded-full bg-emerald-200 border border-white flex items-center justify-center text-[8px] text-emerald-700 font-bold"
                        title={link.user.name || ""}
                      >
                        {(link.user.name || "?")[0]?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">
                    {chain._count?.links || 0} prient
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
