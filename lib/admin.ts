import { requireAdmin as requireCanonicalAdmin } from "@/lib/auth";

export async function requireAdmin() {
  return requireCanonicalAdmin();
}
