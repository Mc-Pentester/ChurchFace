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

    // Utiliser PrayerChain avec un champ type personnalisé pour simuler les campagnes
    const campaigns = await prisma.prayerChain.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { links: true } },
      },
    });

    return NextResponse.json(campaigns);
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
    const { title, description, imageUrl } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    // Créer une chaîne de prière pour simuler une campagne
    const campaign = await prisma.prayerChain.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        isActive: true,
        visibility: "PUBLIC",
      },
      include: {
        _count: { select: { links: true } },
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Erreur création campagne:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
