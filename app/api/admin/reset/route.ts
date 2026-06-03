// app/api/admin/reset/route.ts

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin) return new Response("Forbidden", { status: 403 });

  await prisma.post.deleteMany();

  return Response.json({ ok: true });
}