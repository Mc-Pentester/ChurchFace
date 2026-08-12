"use client";

import { useState } from "react";
import { PrayerSchedule } from "@/types/prayer";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";

interface PrayerScheduleCalendarProps {
  schedules: PrayerSchedule[];
  onCreateSchedule?: (data: { hour: number; dayOfWeek?: number }) => void;
  onDeleteSchedule?: (scheduleId: string) => void;
  prayerChainId: string;
}

const DAYS_OF_WEEK = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export function PrayerScheduleCalendar({
  schedules,
  onCreateSchedule,
  onDeleteSchedule,
  prayerChainId,
}: PrayerScheduleCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Organiser les horaires par jour
  const schedulesByDay: Record<number, PrayerSchedule[]> = {};
  schedules.forEach((schedule) => {
    const day = schedule.dayOfWeek ?? -1; // -1 pour "tous les jours"
    if (!schedulesByDay[day]) {
      schedulesByDay[day] = [];
    }
    schedulesByDay[day].push(schedule);
  });

  const handleAddSchedule = () => {
    if (selectedHour !== null) {
      onCreateSchedule?.({
        hour: selectedHour,
        dayOfWeek: selectedDay ?? undefined,
      });
      setShowAddDialog(false);
      setSelectedHour(null);
      setSelectedDay(null);
    }
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Calendrier d'intercession
        </h2>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un horaire
        </button>
      </div>

      {/* Grille hebdomadaire */}
      <div className="space-y-4">
        {/* Tous les jours */}
        {schedulesByDay[-1] && schedulesByDay[-1].length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Tous les jours</h3>
            <div className="flex flex-wrap gap-2">
              {schedulesByDay[-1].map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200"
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{formatHour(schedule.hour)}</span>
                  <button
                    onClick={() => onDeleteSchedule?.(schedule.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jours spécifiques */}
        {DAYS_OF_WEEK.map((day, index) => {
          const daySchedules = schedulesByDay[index] || [];
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{day}</h3>
                {daySchedules.length === 0 && (
                  <button
                    onClick={() => {
                      setSelectedDay(index);
                      setShowAddDialog(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Ajouter
                  </button>
                )}
              </div>
              {daySchedules.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{formatHour(schedule.hour)}</span>
                      <button
                        onClick={() => onDeleteSchedule?.(schedule.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Aucun horaire programmé</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialog d'ajout */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Ajouter un horaire</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour de la semaine
                </label>
                <select
                  value={selectedDay ?? ""}
                  onChange={(e) => setSelectedDay(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Tous les jours</option>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure
                </label>
                <select
                  value={selectedHour ?? ""}
                  onChange={(e) => setSelectedHour(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Sélectionner une heure</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {formatHour(i)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={selectedHour === null}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
