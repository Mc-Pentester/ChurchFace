import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === "true";

    const rooms = await prisma.prayerLiveRoom.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { PrayerLiveRoomMember: true } },
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Erreur récupération salles:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, roomType, isPublic, maxParticipants, scheduledStart, scheduledEnd } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const room = await prisma.prayerLiveRoom.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        isPublic: isPublic ?? true,
        moderatorId: session.user.id,
        isActive: true,
      },
      include: {
        _count: { select: { PrayerLiveRoomMember: true } },
      },
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Erreur création salle:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
