import { createNotification } from "../notifications";

/**
 * Notifications pour le module Prières
 * Réutilise la fonction createNotification existante pour éviter la duplication
 */

// Types de notifications prières
export const PRAYER_NOTIFICATION_TYPES = {
  NEW_PARTICIPANT: "prayer_new_participant",
  PARTICIPANT_LEFT: "prayer_participant_left",
  NEW_ENGAGEMENT: "prayer_new_engagement",
  ROOM_OPENED: "prayer_room_opened",
  ROOM_CLOSED: "prayer_room_closed",
  CAMPAIGN_STARTED: "prayer_campaign_started",
  CAMPAIGN_ENDED: "prayer_campaign_ended",
  CHAIN_INVITE: "prayer_chain_invite",
  SCHEDULE_REMINDER: "prayer_schedule_reminder",
} as const;

/**
 * Notification quand un participant rejoint une chaîne de prière
 */
export async function notifyParticipantJoined({
  toUserId,
  fromUserId,
  chainId,
  chainTitle,
  participantName,
}: {
  toUserId: string;
  fromUserId: string;
  chainId: string;
  chainTitle: string;
  participantName: string;
}) {
  return createNotification({
    toUserId,
    fromUserId,
    type: PRAYER_NOTIFICATION_TYPES.NEW_PARTICIPANT,
    message: `${participantName} a rejoint la chaîne de prière "${chainTitle}"`,
    entityId: chainId,
    entityType: "PrayerChain",
    data: { chainId, chainTitle, participantName },
  });
}

/**
 * Notification quand un participant quitte une chaîne de prière
 */
export async function notifyParticipantLeft({
  toUserId,
  fromUserId,
  chainId,
  chainTitle,
  participantName,
}: {
  toUserId: string;
  fromUserId: string;
  chainId: string;
  chainTitle: string;
  participantName: string;
}) {
  return createNotification({
    toUserId,
    fromUserId,
    type: PRAYER_NOTIFICATION_TYPES.PARTICIPANT_LEFT,
    message: `${participantName} a quitté la chaîne de prière "${chainTitle}"`,
    entityId: chainId,
    entityType: "PrayerChain",
    data: { chainId, chainTitle, participantName },
  });
}

/**
 * Notification d'un nouvel engagement sur une prière
 */
export async function notifyNewEngagement({
  toUserId,
  fromUserId,
  prayerRequestId,
  prayerTitle,
  engagementType,
  userName,
}: {
  toUserId: string;
  fromUserId: string;
  prayerRequestId: string;
  prayerTitle: string;
  engagementType: "PRAYED" | "CONTINUING" | "SHARED_VERSE" | "ENCOURAGED";
  userName: string;
}) {
  const engagementLabels = {
    PRAYED: "a prié pour",
    CONTINUING: "continue de prier pour",
    SHARED_VERSE: "a partagé un verset pour",
    ENCOURAGED: "a encouragé",
  };

  return createNotification({
    toUserId,
    fromUserId,
    type: PRAYER_NOTIFICATION_TYPES.NEW_ENGAGEMENT,
    message: `${userName} ${engagementLabels[engagementType]} "${prayerTitle}"`,
    entityId: prayerRequestId,
    entityType: "PrayerRequest",
    data: { prayerRequestId, prayerTitle, engagementType, userName },
  });
}

/**
 * Notification quand une salle de prière s'ouvre
 */
export async function notifyRoomOpened({
  toUserId,
  roomId,
  roomTitle,
  roomType,
}: {
  toUserId: string;
  roomId: string;
  roomTitle: string;
  roomType: "TEXT" | "AUDIO" | "VIDEO";
}) {
  const typeLabels = {
    TEXT: "texte",
    AUDIO: "audio",
    VIDEO: "vidéo",
  };

  return createNotification({
    toUserId,
    type: PRAYER_NOTIFICATION_TYPES.ROOM_OPENED,
    message: `La salle de prière "${roomTitle}" (${typeLabels[roomType]}) est maintenant ouverte`,
    entityId: roomId,
    entityType: "PrayerRoom",
    data: { roomId, roomTitle, roomType },
  });
}

/**
 * Notification quand une salle de prière se ferme
 */
export async function notifyRoomClosed({
  toUserId,
  roomId,
  roomTitle,
}: {
  toUserId: string;
  roomId: string;
  roomTitle: string;
}) {
  return createNotification({
    toUserId,
    type: PRAYER_NOTIFICATION_TYPES.ROOM_CLOSED,
    message: `La salle de prière "${roomTitle}" est maintenant fermée`,
    entityId: roomId,
    entityType: "PrayerRoom",
    data: { roomId, roomTitle },
  });
}

/**
 * Notification quand une campagne de prière commence
 */
export async function notifyCampaignStarted({
  toUserId,
  campaignId,
  campaignTitle,
  campaignType,
}: {
  toUserId: string;
  campaignId: string;
  campaignTitle: string;
  campaignType: "FAST" | "PRAYER" | "VIGIL" | "NATIONAL" | "GLOBAL";
}) {
  const typeLabels = {
    FAST: "jeûne",
    PRAYER: "prière",
    VIGIL: "veillée",
    NATIONAL: "nationale",
    GLOBAL: "globale",
  };

  return createNotification({
    toUserId,
    type: PRAYER_NOTIFICATION_TYPES.CAMPAIGN_STARTED,
    message: `La campagne de ${typeLabels[campaignType]} "${campaignTitle}" a commencé`,
    entityId: campaignId,
    entityType: "PrayerCampaign",
    data: { campaignId, campaignTitle, campaignType },
  });
}

/**
 * Notification quand une campagne de prière se termine
 */
export async function notifyCampaignEnded({
  toUserId,
  campaignId,
  campaignTitle,
}: {
  toUserId: string;
  campaignId: string;
  campaignTitle: string;
}) {
  return createNotification({
    toUserId,
    type: PRAYER_NOTIFICATION_TYPES.CAMPAIGN_ENDED,
    message: `La campagne de prière "${campaignTitle}" est terminée`,
    entityId: campaignId,
    entityType: "PrayerCampaign",
    data: { campaignId, campaignTitle },
  });
}

/**
 * Notification d'invitation à rejoindre une chaîne de prière
 */
export async function notifyChainInvite({
  toUserId,
  fromUserId,
  chainId,
  chainTitle,
  inviterName,
}: {
  toUserId: string;
  fromUserId: string;
  chainId: string;
  chainTitle: string;
  inviterName: string;
}) {
  return createNotification({
    toUserId,
    fromUserId,
    type: PRAYER_NOTIFICATION_TYPES.CHAIN_INVITE,
    message: `${inviterName} vous invite à rejoindre la chaîne de prière "${chainTitle}"`,
    entityId: chainId,
    entityType: "PrayerChain",
    data: { chainId, chainTitle, inviterName },
  });
}

/**
 * Notification de rappel pour un horaire de prière programmé
 */
export async function notifyScheduleReminder({
  toUserId,
  chainId,
  chainTitle,
  scheduledTime,
}: {
  toUserId: string;
  chainId: string;
  chainTitle: string;
  scheduledTime: Date;
}) {
  const timeStr = new Date(scheduledTime).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return createNotification({
    toUserId,
    type: PRAYER_NOTIFICATION_TYPES.SCHEDULE_REMINDER,
    message: `Rappel : Prière programmée pour "${chainTitle}" à ${timeStr}`,
    entityId: chainId,
    entityType: "PrayerChain",
    data: { chainId, chainTitle, scheduledTime },
  });
}
