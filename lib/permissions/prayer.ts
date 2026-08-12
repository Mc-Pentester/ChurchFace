/**
 * Service de permissions pour le module Prières
 * Gère les rôles et les autorisations d'accès
 */

export const PRAYER_ROLES = {
  PARTICIPANT: "PARTICIPANT",
  INTERCESSOR: "INTERCESSOR",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;

export const PRAYER_VISIBILITY = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  CHURCH_ONLY: "CHURCH_ONLY",
} as const;

export type PrayerRole = typeof PRAYER_ROLES[keyof typeof PRAYER_ROLES];
export type PrayerVisibility = typeof PRAYER_VISIBILITY[keyof typeof PRAYER_VISIBILITY];

/**
 * Définit les permissions pour chaque rôle
 */
const ROLE_PERMISSIONS: Record<PrayerRole, string[]> = {
  [PRAYER_ROLES.PARTICIPANT]: [
    "view_chain",
    "view_participants",
    "add_engagement",
    "join_room",
    "send_chat_message",
  ],
  [PRAYER_ROLES.INTERCESSOR]: [
    "view_chain",
    "view_participants",
    "add_engagement",
    "join_room",
    "send_chat_message",
    "create_schedule",
    "invite_participants",
  ],
  [PRAYER_ROLES.MODERATOR]: [
    "view_chain",
    "view_participants",
    "add_engagement",
    "join_room",
    "send_chat_message",
    "create_schedule",
    "invite_participants",
    "mute_participants",
    "remove_participants",
    "edit_chain",
    "manage_room",
  ],
  [PRAYER_ROLES.ADMIN]: [
    "view_chain",
    "view_participants",
    "add_engagement",
    "join_room",
    "send_chat_message",
    "create_schedule",
    "invite_participants",
    "mute_participants",
    "remove_participants",
    "edit_chain",
    "manage_room",
    "delete_chain",
    "change_visibility",
    "assign_roles",
  ],
};

/**
 * Vérifie si un rôle a une permission spécifique
 */
export function hasPermission(role: PrayerRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Vérifie si un utilisateur peut accéder à une chaîne de prière
 * basé sur la visibilité et l'appartenance à l'église
 */
export function canAccessChain({
  visibility,
  userChurchId,
  chainChurchId,
  isMember,
}: {
  visibility: PrayerVisibility;
  userChurchId?: string;
  chainChurchId?: string;
  isMember?: boolean;
}): boolean {
  switch (visibility) {
    case PRAYER_VISIBILITY.PUBLIC:
      return true;
    case PRAYER_VISIBILITY.CHURCH_ONLY:
      return userChurchId === chainChurchId;
    case PRAYER_VISIBILITY.PRIVATE:
      return isMember === true;
    default:
      return false;
  }
}

/**
 * Vérifie si un utilisateur peut modifier une chaîne de prière
 */
export function canEditChain({
  role,
  isOwner,
  isModerator,
}: {
  role: PrayerRole;
  isOwner?: boolean;
  isModerator?: boolean;
}): boolean {
  if (isOwner) return true;
  return hasPermission(role, "edit_chain");
}

/**
 * Vérifie si un utilisateur peut supprimer une chaîne de prière
 */
export function canDeleteChain({ role, isOwner }: { role: PrayerRole; isOwner?: boolean }): boolean {
  if (isOwner) return true;
  return hasPermission(role, "delete_chain");
}

/**
 * Vérifie si un utilisateur peut gérer une salle de prière
 */
export function canManageRoom({ role, isModerator }: { role: PrayerRole; isModerator?: boolean }): boolean {
  if (isModerator) return true;
  return hasPermission(role, "manage_room");
}

/**
 * Vérifie si un utilisateur peut muter un participant
 */
export function canMuteParticipant({ role, isModerator }: { role: PrayerRole; isModerator?: boolean }): boolean {
  if (isModerator) return true;
  return hasPermission(role, "mute_participants");
}

/**
 * Vérifie si un utilisateur peut retirer un participant
 */
export function canRemoveParticipant({ role, isModerator }: { role: PrayerRole; isModerator?: boolean }): boolean {
  if (isModerator) return true;
  return hasPermission(role, "remove_participants");
}

/**
 * Vérifie si un utilisateur peut assigner des rôles
 */
export function canAssignRoles({ role, isOwner }: { role: PrayerRole; isOwner?: boolean }): boolean {
  if (isOwner) return true;
  return hasPermission(role, "assign_roles");
}

/**
 * Obtient le rôle le plus élevé d'un utilisateur dans une chaîne
 */
export function getHighestRole(roles: PrayerRole[]): PrayerRole {
  const roleHierarchy = [
    PRAYER_ROLES.PARTICIPANT,
    PRAYER_ROLES.INTERCESSOR,
    PRAYER_ROLES.MODERATOR,
    PRAYER_ROLES.ADMIN,
  ];

  for (const role of roleHierarchy.reverse()) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return PRAYER_ROLES.PARTICIPANT;
}

/**
 * Vérifie si un rôle peut promouvoir un autre rôle
 */
export function canPromoteRole(fromRole: PrayerRole, toRole: PrayerRole): boolean {
  const roleHierarchy = [
    PRAYER_ROLES.PARTICIPANT,
    PRAYER_ROLES.INTERCESSOR,
    PRAYER_ROLES.MODERATOR,
    PRAYER_ROLES.ADMIN,
  ];

  const fromIndex = roleHierarchy.indexOf(fromRole);
  const toIndex = roleHierarchy.indexOf(toRole);

  // Un rôle ne peut promouvoir que vers un rôle inférieur ou égal
  return fromIndex >= toIndex && fromRole !== PRAYER_ROLES.PARTICIPANT;
}
