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
  | "STUDIO_BROADCAST_UPDATE";

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
