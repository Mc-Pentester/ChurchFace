import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");
    const prayerChainId = searchParams.get("prayerChainId");
    const churchId = searchParams.get("churchId");
    const roomType = searchParams.get("roomType");

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === "true";
    if (prayerChainId) where.prayerChainId = prayerChainId;
    if (churchId) where.churchId = churchId;
    if (roomType && roomType !== "ALL") where.roomType = roomType;

    // Utiliser PrayerRoom comme source principale
    const rooms = await prisma.prayerRoom.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { participants: true } },
        prayerChain: {
          select: {
            id: true,
            title: true,
          },
        },
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        moderator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
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
    const { title, description, roomType = "TEXT", isPublic = true, maxParticipants, scheduledStart, scheduledEnd, prayerChainId, churchId } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    // Créer dans PrayerRoom
    const room = await prisma.prayerRoom.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        roomType,
        isPublic,
        moderatorId: session.user.id,
        maxParticipants: maxParticipants || null,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        prayerChainId: prayerChainId || null,
        churchId: churchId || null,
        isActive: true,
      },
      include: {
        _count: { select: { participants: true } },
        prayerChain: {
          select: {
            id: true,
            title: true,
          },
        },
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        moderator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Erreur création salle:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
