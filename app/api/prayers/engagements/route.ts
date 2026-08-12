import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Ajouter un engagement de prière
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { prayerRequestId, type } = body;

    if (!prayerRequestId || !type) {
      return NextResponse.json(
        { error: "prayerRequestId et type requis" },
        { status: 400 }
      );
    }

    // Valider le type d'engagement
    const validTypes = ["PRAYED", "CONTINUING", "SHARED_VERSE", "ENCOURAGED"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type d'engagement invalide" },
        { status: 400 }
      );
    }

    // Vérifier que la demande de prière existe
    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id: prayerRequestId },
    });

    if (!prayerRequest) {
      return NextResponse.json(
        { error: "Demande de prière introuvable" },
        { status: 404 }
      );
    }

    // Créer l'engagement
    const engagement = await prisma.prayerEngagement.create({
      data: {
        prayerRequestId,
        userId,
        type,
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

    // Si le type est PRAYED, mettre à jour le compteur de prières du participant
    if (type === "PRAYED" && prayerRequest.prayerChainId) {
      await prisma.prayerParticipant.updateMany({
        where: {
          prayerChainId: prayerRequest.prayerChainId,
          userId,
        },
        data: {
          prayerCount: { increment: 1 },
          lastPrayedAt: new Date(),
        },
      });
    }

    return NextResponse.json(engagement, { status: 201 });
  } catch (error) {
    console.error("Erreur création engagement:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// GET - Récupérer les engagements d'une demande de prière
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const prayerRequestId = searchParams.get("prayerRequestId");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!prayerRequestId) {
      return NextResponse.json(
        { error: "prayerRequestId requis" },
        { status: 400 }
      );
    }

    const where: any = { prayerRequestId };
    if (type) where.type = type;

    const engagements = await prisma.prayerEngagement.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.prayerEngagement.count({
      where,
    });

    return NextResponse.json({
      engagements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur récupération engagements:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
