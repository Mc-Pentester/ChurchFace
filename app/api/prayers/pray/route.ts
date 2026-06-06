import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { prayerRequestId, type = "PRAY" } = body;

  if (!prayerRequestId) {
    return NextResponse.json({ error: "Missing prayerRequestId" }, { status: 400 });
  }

  const existing = await prisma.prayerReaction.findUnique({
    where: {
      userId_prayerRequestId_type: {
        userId: session.user.id,
        prayerRequestId,
        type,
      },
    },
  });

  if (existing) {
    await prisma.prayerReaction.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ prayed: false });
  }

  const reaction = await prisma.prayerReaction.create({
    data: {
      prayerRequestId,
      userId: session.user.id,
      type,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({ prayed: true, reaction }, { status: 201 });
}
