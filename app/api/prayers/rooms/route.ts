import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les salles de prière actives
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const prayerChainId = searchParams.get("prayerChainId");
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (prayerChainId) where.prayerChainId = prayerChainId;
    if (isActive !== null) where.isActive = isActive === "true";

    const rooms = await prisma.prayerRoom.findMany({
      where,
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        prayerChain: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Erreur récupération salles:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer une salle de prière
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      roomType = "TEXT",
      isPublic = true,
      prayerChainId,
      maxParticipants,
      scheduledStart,
      scheduledEnd,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "titre requis" },
        { status: 400 }
      );
    }

    // Valider le type de salle
    const validRoomTypes = ["TEXT", "AUDIO", "VIDEO"];
    if (!validRoomTypes.includes(roomType)) {
      return NextResponse.json(
        { error: "Type de salle invalide" },
        { status: 400 }
      );
    }

    // Créer la salle
    const room = await prisma.prayerRoom.create({
      data: {
        title,
        description,
        roomType,
        isPublic,
        moderatorId: userId,
        prayerChainId,
        maxParticipants,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        isActive: true,
      },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        prayerChain: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("Erreur création salle:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
