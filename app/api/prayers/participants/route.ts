import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les participants d'une chaîne de prière
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const prayerChainId = searchParams.get("prayerChainId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!prayerChainId) {
      return NextResponse.json(
        { error: "prayerChainId requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à cette chaîne
    const chain = await prisma.prayerChain.findUnique({
      where: { id: prayerChainId },
    });

    if (!chain) {
      return NextResponse.json(
        { error: "Chaîne de prière introuvable" },
        { status: 404 }
      );
    }

    // Vérifier les permissions (public ou membre)
    if (chain.visibility === "PRIVATE") {
      const isMember = await prisma.prayerParticipant.findFirst({
        where: {
          prayerChainId,
          userId,
        },
      });

      if (!isMember) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }
    }

    const participants = await prisma.prayerParticipant.findMany({
      where: { prayerChainId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
      skip,
      take: limit,
    });

    const total = await prisma.prayerParticipant.count({
      where: { prayerChainId },
    });

    return NextResponse.json({
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération participants:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Rejoindre une chaîne de prière
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { prayerChainId, role = "PARTICIPANT" } = body;

    if (!prayerChainId) {
      return NextResponse.json(
        { error: "prayerChainId requis" },
        { status: 400 }
      );
    }

    // Vérifier que la chaîne existe
    const chain = await prisma.prayerChain.findUnique({
      where: { id: prayerChainId },
    });

    if (!chain) {
      return NextResponse.json(
        { error: "Chaîne de prière introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà participant
    const existingParticipant = await prisma.prayerParticipant.findFirst({
      where: {
        prayerChainId,
        userId,
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Vous êtes déjà participant" },
        { status: 400 }
      );
    }

    // Créer le participant
    const participant = await prisma.prayerParticipant.create({
      data: {
        prayerChainId,
        userId,
        role,
        joinedAt: new Date(),
        notificationEnabled: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error("Erreur création participant:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
