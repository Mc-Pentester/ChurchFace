import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  const role = (session.user as any).role;

  if (role !== "ADMIN") return null;

  return session.user;
}