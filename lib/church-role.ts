export function normalizeChurchRole(
  role?: string | null
) {
  if (!role) return null;

  switch (role) {

    case "OWNER":
      return "CHURCH_OWNER";

    case "ADMIN":
      return "CHURCH_ADMIN";

    case "BROADCAST_MANAGER":
      return "BROADCAST_MANAGER";

    case "STUDIO_OPERATOR":
      return "STUDIO_OPERATOR";

    default:
      return role;
  }
}