import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");
    const churchId = searchParams.get("churchId");
    const type = searchParams.get("type");

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === "true";
    if (churchId) where.churchId = churchId;
    if (type && type !== "ALL") where.type = type;

    // Utiliser PrayerCampaign comme source principale
    const campaigns = await prisma.prayerCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Erreur récupération campagnes:", error);
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
    const { title, description, imageUrl, type, startDate, endDate, churchId } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    if (!type || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields: type, startDate, endDate" }, { status: 400 });
    }

    // Créer dans PrayerCampaign
    const campaign = await prisma.prayerCampaign.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        churchId: churchId || null,
        createdBy: session.user.id,
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Erreur création campagne:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
