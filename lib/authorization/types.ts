export type GlobalRole =
  | "USER"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "MODERATOR"
  | "RADIO_HOST"
  | "CHURCH_ADMIN"
  | "CHURCH_OWNER"
  | "BROADCAST_MANAGER"
  | "STUDIO_OPERATOR";

export type AuthorizationAction =
  | "GLOBAL_ADMIN"
  | "STUDIO_ACCESS"
  | "STUDIO_BROADCAST_UPDATE"
  | "MOBILELIVE_START"
  | "MOBILELIVE_STOP"
  | "MOBILELIVE_MODERATE"
  | "MOBILELIVE_VIEW"
  | "MOBILELIVE_STATS_UPDATE"
  | "PRAYER_CREATE"
  | "PRAYER_ROOM_CREATE"
  | "PRAYER_CAMPAIGN_CREATE"
  | "PRAYER_ROOM_VIEW"
  | "PRAYER_ROOM_JOIN"
  | "PRAYER_DELETE"
  | "PRAYER_VIEW"
  | "PRAYER_CHAIN_CREATE"
  | "PRAYER_CHAIN_VIEW"
  | "PRAYER_CHAIN_JOIN"
  | "PRAYER_CHAIN_LEAVE"
  | "PRAYER_CAMPAIGN_CHAIN_MANAGE"
  | "PRAYER_ENGAGEMENT_CREATE"
  | "PRAYER_ENGAGEMENT_VIEW"
  | "PRAYER_ENGAGEMENT_DELETE"
  | "PRAYER_SCHEDULE_VIEW"
  | "PRAYER_SCHEDULE_CREATE"
  | "PRAYER_SCHEDULE_DELETE";

export type AuthorizationDecision =
  | "ALLOW"
  | "DENY_UNAUTHENTICATED"
  | "DENY_ACCOUNT_STATE"
  | "DENY_FORBIDDEN"
  | "DENY_UNSUPPORTED";

export interface AuthorizationResult {
  decision: AuthorizationDecision;
  status: 200 | 401 | 403;
  actorId: string | null;
  role: GlobalRole | string | null;
  reason?: string;
}

export interface AuthorizationActor {
  id: string;
  role: GlobalRole | string;
  isBanned: boolean;
  isSuspended: boolean;
  churchId: string | null;
}
