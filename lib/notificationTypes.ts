/**
 * Types d'événements de notification centralisés
 * 
 * Ce fichier définit tous les codes d'événements de notification
 * utilisés dans ChurchFace pour garantir la cohérence et éviter
 * les incohérences de chaînes de caractères.
 */

export enum NotificationType {
  // --- AMITIÉ / RELATIONS ---
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_ACCEPTED = "FRIEND_ACCEPTED",
  USER_FOLLOWED = "USER_FOLLOWED",

  // --- POSTS ---
  POST_CREATED = "POST_CREATED",
  POST_MENTIONED = "POST_MENTIONED",
  POST_LIKED = "POST_LIKED",
  COMMENT_CREATED = "COMMENT_CREATED",
  COMMENT_REPLIED = "COMMENT_REPLIED",
  COMMENT_MENTIONED = "COMMENT_MENTIONED",
  COMMENT_LIKED = "COMMENT_LIKED",

  // --- ÉGLISES ---
  CHURCH_FOLLOWED = "CHURCH_FOLLOWED",
  CHURCH_POST_CREATED = "CHURCH_POST_CREATED",
  CHURCH_EVENT_CREATED = "CHURCH_EVENT_CREATED",
  CHURCH_LIVE_STARTED = "CHURCH_LIVE_STARTED",
  CHURCH_MEMBER_INVITED = "CHURCH_MEMBER_INVITED",

  // --- PRIÈRES ---
  PRAYER_CHAIN_CREATED = "PRAYER_CHAIN_CREATED",
  PRAYER_CHAIN_JOINED = "PRAYER_CHAIN_JOINED",
  PRAYER_CAMPAIGN_CREATED = "PRAYER_CAMPAIGN_CREATED",
  PRAYER_CAMPAIGN_CHAIN_MOBILIZED = "PRAYER_CAMPAIGN_CHAIN_MOBILIZED",
  PRAYER_LIVE_STARTED = "PRAYER_LIVE_STARTED",
  PRAYER_REQUEST_PRAYED_FOR = "PRAYER_REQUEST_PRAYED_FOR",
  PRAYER_RESPONDED = "PRAYER_RESPONDED",
  PRAYER_ROOM_CREATED = "PRAYER_ROOM_CREATED",
  PRAYER_ROOM_JOINED = "PRAYER_ROOM_JOINED",
  PRAYER_TESTIMONY_CREATED = "PRAYER_TESTIMONY_CREATED",

  // --- LIVE / STREAMING ---
  LIVE_STARTED = "LIVE_STARTED",
  LIVE_INVITATION = "LIVE_INVITATION",
  LIVE_MENTION = "LIVE_MENTION",
  LIVE_MODERATION_WARNING = "LIVE_MODERATION_WARNING",
  LIVE_FORCE_STOPPED = "LIVE_FORCE_STOPPED",

  // --- MESSAGERIE ---
  MESSAGE_SENT = "MESSAGE_SENT",
  MESSAGE_REPLIED = "MESSAGE_REPLIED",
  MESSAGE_MENTIONED = "MESSAGE_MENTIONED",
  CONVERSATION_INVITATION = "CONVERSATION_INVITATION",
  USER_ADDED_TO_CONVERSATION = "USER_ADDED_TO_CONVERSATION",

  // --- APPELS ---
  CALL_INCOMING = "CALL_INCOMING",
  CALL_MISSED = "CALL_MISSED",
  CALL_ENDED = "CALL_ENDED",

  // --- SÉCURITÉ / COMPTE ---
  NEW_LOGIN = "NEW_LOGIN",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
}

/**
 * Catégories de notification pour le regroupement
 */
export enum NotificationCategory {
  SOCIAL = "SOCIAL",
  POST = "POST",
  CHURCH = "CHURCH",
  PRAYER = "PRAYER",
  LIVE = "LIVE",
  MESSAGING = "MESSAGING",
  CALL = "CALL",
  SECURITY = "SECURITY",
}

/**
 * Mapping des types vers les catégories
 */
export const NOTIFICATION_TYPE_CATEGORIES: Record<NotificationType, NotificationCategory> = {
  // Social
  [NotificationType.FRIEND_REQUEST]: NotificationCategory.SOCIAL,
  [NotificationType.FRIEND_ACCEPTED]: NotificationCategory.SOCIAL,
  [NotificationType.USER_FOLLOWED]: NotificationCategory.SOCIAL,

  // Posts
  [NotificationType.POST_CREATED]: NotificationCategory.POST,
  [NotificationType.POST_MENTIONED]: NotificationCategory.POST,
  [NotificationType.POST_LIKED]: NotificationCategory.POST,
  [NotificationType.COMMENT_CREATED]: NotificationCategory.POST,
  [NotificationType.COMMENT_REPLIED]: NotificationCategory.POST,
  [NotificationType.COMMENT_MENTIONED]: NotificationCategory.POST,
  [NotificationType.COMMENT_LIKED]: NotificationCategory.POST,

  // Church
  [NotificationType.CHURCH_FOLLOWED]: NotificationCategory.CHURCH,
  [NotificationType.CHURCH_POST_CREATED]: NotificationCategory.CHURCH,
  [NotificationType.CHURCH_EVENT_CREATED]: NotificationCategory.CHURCH,
  [NotificationType.CHURCH_LIVE_STARTED]: NotificationCategory.CHURCH,
  [NotificationType.CHURCH_MEMBER_INVITED]: NotificationCategory.CHURCH,

  // Prayer
  [NotificationType.PRAYER_CHAIN_CREATED]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_CHAIN_JOINED]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_CAMPAIGN_CREATED]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_CAMPAIGN_CHAIN_MOBILIZED]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_LIVE_STARTED]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_REQUEST_PRAYED_FOR]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_RESPONDED]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_ROOM_CREATED]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_ROOM_JOINED]: NotificationCategory.PRAYER,
  [NotificationType.PRAYER_TESTIMONY_CREATED]: NotificationCategory.PRAYER,

  // Live
  [NotificationType.LIVE_STARTED]: NotificationCategory.LIVE,
  [NotificationType.LIVE_INVITATION]: NotificationCategory.LIVE,
  [NotificationType.LIVE_MENTION]: NotificationCategory.LIVE,
  [NotificationType.LIVE_MODERATION_WARNING]: NotificationCategory.LIVE,
  [NotificationType.LIVE_FORCE_STOPPED]: NotificationCategory.LIVE,

  // Messaging
  [NotificationType.MESSAGE_SENT]: NotificationCategory.MESSAGING,
  [NotificationType.MESSAGE_REPLIED]: NotificationCategory.MESSAGING,
  [NotificationType.MESSAGE_MENTIONED]: NotificationCategory.MESSAGING,
  [NotificationType.CONVERSATION_INVITATION]: NotificationCategory.MESSAGING,
  [NotificationType.USER_ADDED_TO_CONVERSATION]: NotificationCategory.MESSAGING,

  // Call
  [NotificationType.CALL_INCOMING]: NotificationCategory.CALL,
  [NotificationType.CALL_MISSED]: NotificationCategory.CALL,
  [NotificationType.CALL_ENDED]: NotificationCategory.CALL,

  // Security
  [NotificationType.NEW_LOGIN]: NotificationCategory.SECURITY,
  [NotificationType.PASSWORD_CHANGED]: NotificationCategory.SECURITY,
};

/**
 * Types d'entités pour les deep links
 */
export enum EntityType {
  POST = "Post",
  COMMENT = "Comment",
  CHURCH = "Church",
  PRAYER_CHAIN = "PrayerChain",
  PRAYER_REQUEST = "PrayerRequest",
  PRAYER_ROOM = "PrayerRoom",
  PRAYER_CAMPAIGN = "PrayerCampaign",
  LIVE_BROADCAST = "LiveBroadcast",
  CHAT = "Chat",
  USER = "User",
}

/**
 * Mapping des types d'entités vers les routes
 */
export const ENTITY_TYPE_ROUTES: Record<EntityType, (id: string) => string> = {
  [EntityType.POST]: (id) => `/post/${id}`,
  [EntityType.COMMENT]: (id) => `/post/${id}`, // Comments link to their post
  [EntityType.CHURCH]: (id) => `/church/${id}`,
  [EntityType.PRAYER_CHAIN]: (id) => `/prayers/chain/${id}`,
  [EntityType.PRAYER_REQUEST]: (id) => `/prayers/request/${id}`,
  [EntityType.PRAYER_ROOM]: (id) => `/prayers/room/${id}`,
  [EntityType.PRAYER_CAMPAIGN]: (id) => `/prayers/campaign/${id}`,
  [EntityType.LIVE_BROADCAST]: (id) => `/live/${id}`,
  [EntityType.CHAT]: (id) => `/messages/${id}`,
  [EntityType.USER]: (id) => `/profile/${id}`,
};

/**
 * Fonction utilitaire pour obtenir l'URL d'une entité
 */
export function getEntityUrl(entityType: string, entityId?: string): string {
  if (!entityId) return "/";
  
  const routeBuilder = ENTITY_TYPE_ROUTES[entityType as EntityType];
  if (routeBuilder) {
    return routeBuilder(entityId);
  }
  
  // Fallback pour les types non mappés
  return "/";
}

/**
 * Fonction utilitaire pour obtenir la catégorie d'un type de notification
 */
export function getNotificationCategory(type: string): NotificationCategory {
  return NOTIFICATION_TYPE_CATEGORIES[type as NotificationType] || NotificationCategory.SOCIAL;
}
