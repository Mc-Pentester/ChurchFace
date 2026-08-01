"use client";

import { useState, useEffect } from "react";
import { BookOpen, Play, Plus, Search, Clock, Calendar } from "lucide-react";

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: Date;
  duration?: number;
  thumbnail?: string;
  description?: string;
}

interface StudioSermonsProps {
  churchId: string;
  onSermonSelect: (sermon: Sermon) => void;
}

export default function StudioSermons({ churchId, onSermonSelect }: StudioSermonsProps) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);

  useEffect(() => {
    // Fetch sermons from API
    const fetchSermons = async () => {
      try {
        const response = await fetch("/api/sermons");
        if (response.ok) {
          const data = await response.json();
          setSermons(data);
        }
      } catch (error) {
        console.error("Failed to fetch sermons:", error);
      }
    };

    fetchSermons();
  }, []);

  const filteredSermons = sermons.filter((sermon) =>
    sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSermonClick = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    onSermonSelect(sermon);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Prédications</h3>
        <button className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
          <Plus size={14} />
          <span>Nouvelle</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une prédication..."
          className="w-full bg-[#252535] text-white placeholder-gray-500 pl-8 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {/* Sermon List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredSermons.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
            <p>Aucune prédication disponible</p>
          </div>
        ) : (
          filteredSermons.map((sermon) => {
            const isSelected = selectedSermon?.id === sermon.id;

            return (
              <div
                key={sermon.id}
                className={`bg-[#252535] rounded-lg p-3 cursor-pointer transition ${
                  isSelected ? "ring-2 ring-violet-500" : "hover:bg-[#353545]"
                }`}
                onClick={() => handleSermonClick(sermon)}
              >
                <div className="flex gap-3">
                  {sermon.thumbnail ? (
                    <img
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-[#1a1a24] rounded flex items-center justify-center">
                      <BookOpen size={20} className="text-gray-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{sermon.title}</p>
                    <p className="text-gray-400 text-xs truncate">{sermon.speaker}</p>
                    <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{formatDate(sermon.date)}</span>
                      </div>
                      {sermon.duration && (
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>{formatDuration(sermon.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSermonClick(sermon);
                    }}
                    className="self-center bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 p-2 rounded-lg transition"
                  >
                    <Play size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Sermon Info */}
      {selectedSermon && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="bg-[#252535] rounded-lg p-3">
            <p className="text-white text-sm font-medium mb-1">{selectedSermon.title}</p>
            <p className="text-gray-400 text-xs mb-2">{selectedSermon.speaker}</p>
            {selectedSermon.description && (
              <p className="text-gray-500 text-xs line-clamp-2">{selectedSermon.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
