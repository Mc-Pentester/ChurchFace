import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prayerChainId = searchParams.get("prayerChainId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Utiliser PrayerChainLink pour récupérer les participants (liens)
    const where: any = {};
    if (prayerChainId) where.chainId = prayerChainId;

    const [participants, total] = await Promise.all([
      prisma.prayerChainLink.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.prayerChainLink.count({ where }),
    ]);

    return NextResponse.json({ 
      participants, 
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Erreur récupération participants:", error);
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
    const { prayerChainId, message } = body;

    if (!prayerChainId) {
      return NextResponse.json({ error: "Missing prayerChainId" }, { status: 400 });
    }

    const participant = await prisma.prayerChainLink.create({
      data: {
        chainId: prayerChainId,
        userId: session.user.id,
        message: message || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ participant });
  } catch (error) {
    console.error("Erreur création participant:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.prayerChainLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression participant:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
