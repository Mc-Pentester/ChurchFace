import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les salles de prière
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const prayerChainId = searchParams.get("prayerChainId");
    const isActive = searchParams.get("isActive");
    const roomType = searchParams.get("roomType");

    const where: {
      prayerChainId?: string;
      isActive?: boolean;
      roomType?: "TEXT" | "AUDIO" | "VIDEO";
    } = {};

    if (prayerChainId) {
      where.prayerChainId = prayerChainId;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (
      roomType === "TEXT" ||
      roomType === "AUDIO" ||
      roomType === "VIDEO"
    ) {
      where.roomType = roomType;
    }

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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      rooms,
    });
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
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
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

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Le titre est requis" },
        { status: 400 }
      );
    }

    const validRoomTypes = ["TEXT", "AUDIO", "VIDEO"];

    if (!validRoomTypes.includes(roomType)) {
      return NextResponse.json(
        { error: "Type de salle invalide" },
        { status: 400 }
      );
    }

    if (
      maxParticipants !== undefined &&
      maxParticipants !== null &&
      (!Number.isInteger(maxParticipants) || maxParticipants < 1)
    ) {
      return NextResponse.json(
        { error: "maxParticipants doit être un entier positif" },
        { status: 400 }
      );
    }

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (scheduledStart) {
      startDate = new Date(scheduledStart);

      if (Number.isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "scheduledStart invalide" },
          { status: 400 }
        );
      }
    }

    if (scheduledEnd) {
      endDate = new Date(scheduledEnd);

      if (Number.isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: "scheduledEnd invalide" },
          { status: 400 }
        );
      }
    }

    if (startDate && endDate && endDate <= startDate) {
      return NextResponse.json(
        {
          error:
            "La date de fin doit être après la date de début",
        },
        { status: 400 }
      );
    }

    if (prayerChainId) {
      const chain = await prisma.prayerChain.findUnique({
        where: {
          id: prayerChainId,
        },
        select: {
          id: true,
        },
      });

      if (!chain) {
        return NextResponse.json(
          { error: "Chaîne de prière introuvable" },
          { status: 404 }
        );
      }
    }

    const room = await prisma.prayerRoom.create({
      data: {
        title: title.trim(),
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        roomType,
        isPublic: Boolean(isPublic),
        moderatorId: userId,
        prayerChainId: prayerChainId || null,
        maxParticipants:
          maxParticipants !== undefined && maxParticipants !== null
            ? maxParticipants
            : null,
        scheduledStart: startDate,
        scheduledEnd: endDate,
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
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return NextResponse.json(room, {
      status: 201,
    });
  } catch (error) {
    console.error("Erreur création salle:", error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}