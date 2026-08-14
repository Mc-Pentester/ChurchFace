"use client";

import { useState } from "react";
import { PrayerParticipant } from "@/types/prayer";
import { Users, Shield, User, Crown, MoreVertical, Bell, BellOff, Heart } from "lucide-react";

interface ParticipantManagementProps {
  participants: PrayerParticipant[];
  currentUserId?: string;
  currentUserRole?: "PARTICIPANT" | "INTERCESSOR" | "MODERATOR" | "ADMIN";
  onPromote?: (participantId: string, newRole: "INTERCESSOR" | "MODERATOR" | "ADMIN") => void;
  onDemote?: (participantId: string, newRole: "PARTICIPANT" | "INTERCESSOR" | "MODERATOR") => void;
  onRemove?: (participantId: string) => void;
  onToggleNotification?: (participantId: string, enabled: boolean) => void;
}

const ROLE_ICONS = {
  ADMIN: Crown,
  MODERATOR: Shield,
  INTERCESSOR: Heart,
  PARTICIPANT: User,
};

const ROLE_LABELS = {
  ADMIN: "Admin",
  MODERATOR: "Modérateur",
  INTERCESSOR: "Intercesseur",
  PARTICIPANT: "Participant",
};

const ROLE_COLORS = {
  ADMIN: "bg-purple-100 text-purple-700",
  MODERATOR: "bg-blue-100 text-blue-700",
  INTERCESSOR: "bg-pink-100 text-pink-700",
  PARTICIPANT: "bg-gray-100 text-gray-700",
};

export function ParticipantManagement({
  participants,
  currentUserId,
  currentUserRole = "PARTICIPANT",
  onPromote,
  onDemote,
  onRemove,
  onToggleNotification,
}: ParticipantManagementProps) {
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const canManage = currentUserRole === "ADMIN" || currentUserRole === "MODERATOR";

  const handlePromote = (participant: PrayerParticipant) => {
    if (onPromote) {
      const newRole = participant.role === "PARTICIPANT" ? "MODERATOR" : "ADMIN";
      onPromote(participant.id, newRole);
    }
    setActionMenu(null);
  };

  const handleDemote = (participant: PrayerParticipant) => {
    if (onDemote) {
      const newRole = participant.role === "ADMIN" ? "MODERATOR" : "PARTICIPANT";
      onDemote(participant.id, newRole);
    }
    setActionMenu(null);
  };

  const handleRemove = (participantId: string) => {
    if (onRemove) {
      onRemove(participantId);
    }
    setActionMenu(null);
  };

  const handleToggleNotification = (participant: PrayerParticipant) => {
    if (onToggleNotification) {
      onToggleNotification(participant.id, !participant.notificationEnabled);
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    const roleOrder = { ADMIN: 0, MODERATOR: 1, INTERCESSOR: 2, PARTICIPANT: 3 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Participants</h2>
              <p className="text-sm text-gray-600">
                {participants.length} participant{participants.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                {ROLE_LABELS[currentUserRole]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Participants List */}
      <div className="divide-y divide-gray-100">
        {sortedParticipants.map((participant) => {
          const RoleIcon = ROLE_ICONS[participant.role];
          const isCurrentUser = participant.userId === currentUserId;
          const canManageThisUser = canManage && !isCurrentUser;

          return (
            <div
              key={participant.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {participant.user.image ? (
                    <img
                      src={participant.user.image}
                      alt={participant.user.name || "Participant"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {participant.user.name?.[0] || "U"}
                    </div>
                  )}

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {participant.user.name}
                        {isCurrentUser && <span className="text-sm text-gray-500">(Vous)</span>}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[participant.role]}`}>
                        {ROLE_LABELS[participant.role]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{participant.prayerCount} prière{participant.prayerCount !== 1 ? "s" : ""}</span>
                      {participant.lastPrayedAt && (
                        <span>Dernière prière: {new Date(participant.lastPrayedAt).toLocaleDateString()}</span>
                      )}
                      <span>Rejoint: {new Date(participant.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Notification Toggle */}
                  {canManageThisUser && onToggleNotification && (
                    <button
                      onClick={() => handleToggleNotification(participant)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={participant.notificationEnabled ? "Désactiver notifications" : "Activer notifications"}
                    >
                      {participant.notificationEnabled ? (
                        <Bell className="w-5 h-5 text-gray-600" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}

                  {/* Action Menu */}
                  {canManageThisUser && (
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === participant.id ? null : participant.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {actionMenu === participant.id && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-10">
                          {participant.role !== "ADMIN" && (
                            <button
                              onClick={() => handlePromote(participant)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              Promouvoir
                            </button>
                          )}
                          {participant.role !== "PARTICIPANT" && (
                            <button
                              onClick={() => handleDemote(participant)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                              <User className="w-4 h-4" />
                              Rétrograder
                            </button>
                          )}
                          <button
                            onClick={() => handleRemove(participant.id)}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Retirer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {participants.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun participant pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
