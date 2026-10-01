import type { GlobalRole } from "./types";

export const GLOBAL_ADMIN_ROLES: readonly GlobalRole[] = [
  "ADMIN",
  "SUPER_ADMIN",
];

export const STUDIO_GLOBAL_ROLES: readonly GlobalRole[] = [
  "ADMIN",
  "SUPER_ADMIN",
  "RADIO_HOST",
];

export function isGlobalAdminRole(role?: string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function hasStudioGlobalRole(role?: string | null): boolean {
  return (
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "RADIO_HOST"
  );
}
