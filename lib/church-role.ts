export function normalizeChurchRole(
  role?: string | null
) {
  if (!role) return null;

  switch (role) {

    case "OWNER":
      return "CHURCH_OWNER";

    case "ADMIN":
      return "CHURCH_ADMIN";

    default:
      return role;
  }
}