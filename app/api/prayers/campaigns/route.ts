import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les campagnes de prière
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");
    const isActive = searchParams.get("isActive");
    const type = searchParams.get("type");

    const where: any = {};
    if (churchId) where.churchId = churchId;
    if (isActive !== null) where.isActive = isActive === "true";
    if (type) where.type = type;

    const campaigns = await prisma.prayerCampaign.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        type: true,
        startDate: true,
        endDate: true,
        isActive: true,
        churchId: true,
        createdBy: true,
        createdAt: true,
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            chains: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Erreur récupération campagnes:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer une campagne de prière
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
      imageUrl,
      type,
      startDate,
      endDate,
      churchId,
    } = body;

    if (!title || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: "title, type, startDate et endDate requis" },
        { status: 400 }
      );
    }

    // Valider le type de campagne
    const validTypes = ["FAST", "PRAYER", "VIGIL", "NATIONAL", "GLOBAL"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type de campagne invalide" },
        { status: 400 }
      );
    }

    // Valider les dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return NextResponse.json(
        { error: "La date de fin doit être après la date de début" },
        { status: 400 }
      );
    }

    // Vérifier que l'église existe si spécifiée
    if (churchId) {
      const church = await prisma.church.findUnique({
        where: { id: churchId },
      });
      if (!church) {
        return NextResponse.json(
          { error: "Église introuvable" },
          { status: 404 }
        );
      }
    }

    // Créer la campagne
    const campaign = await prisma.prayerCampaign.create({
      data: {
        title,
        description,
        imageUrl,
        type,
        startDate: start,
        endDate: end,
        churchId,
        createdBy: userId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        type: true,
        startDate: true,
        endDate: true,
        isActive: true,
        churchId: true,
        createdBy: true,
        createdAt: true,
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Erreur création campagne:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
