import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { requireChurchRoleOrThrow } from "@/lib/church-perms";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();
  const { newOwnerUserId } = body;

  if (!newOwnerUserId) return NextResponse.json({ error: "newOwnerUserId is required" }, { status: 400 });

  const church = await prisma.church.findUnique({ where: { slug }, select: { id: true } });
  if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });

  try {
    // Only current owner can transfer
    await requireChurchRoleOrThrow(church.id, session.user.id, ["CHURCH_OWNER"]);

    // Ensure target user exists
    const target = await prisma.user.findUnique({ where: { id: newOwnerUserId } });
    if (!target) return NextResponse.json({ error: "Target user not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // downgrade existing owners to CHURCH_ADMIN
      await tx.churchAdmin.updateMany({
        where: { churchId: church.id, role: "CHURCH_OWNER" },
        data: { role: "CHURCH_ADMIN" },
      });

      // upsert new owner
      await tx.churchAdmin.upsert({
        where: { churchId_userId: { churchId: church.id, userId: newOwnerUserId } },
        update: { role: "CHURCH_OWNER", appointedAt: new Date() },
        create: { churchId: church.id, userId: newOwnerUserId, role: "CHURCH_OWNER", appointedAt: new Date() },
      });

      // ensure target is a member — must succeed so the new owner is a valid member.
      // Any failure here should roll back the whole transfer transaction.
      await tx.churchMember.upsert({
        where: { churchId_userId: { churchId: church.id, userId: newOwnerUserId } },
        update: { role: "ADMIN", isActive: true },
        create: { churchId: church.id, userId: newOwnerUserId, role: "ADMIN", isActive: true },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("Transfer owner error:", err);
    return NextResponse.json({ error: "Failed to transfer ownership" }, { status: 500 });
  }
}
