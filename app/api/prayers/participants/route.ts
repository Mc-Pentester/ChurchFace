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

    // Utiliser PrayerParticipant comme source principale
    const where: any = {};
    if (prayerChainId) where.prayerChainId = prayerChainId;

    const [participants, total] = await Promise.all([
      prisma.prayerParticipant.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { joinedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.prayerParticipant.count({ where }),
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
    const { prayerChainId, role = "PARTICIPANT" } = body;

    if (!prayerChainId) {
      return NextResponse.json({ error: "Missing prayerChainId" }, { status: 400 });
    }

    try {
      const participant = await prisma.prayerParticipant.create({
        data: {
          prayerChainId,
          userId: session.user.id,
          role: "PARTICIPANT",
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

      // Maintenir la compatibilité avec PrayerChainLink
      await prisma.prayerChainLink.create({
        data: {
          chainId: prayerChainId,
          userId: session.user.id,
        },
      }).catch(() => {
        // Ignore si existe déjà
      });

      return NextResponse.json({ participant });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint violation - already joined
        return NextResponse.json({ error: "Already joined" }, { status: 409 });
      }
      throw error;
    }
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

    // Supprimer de PrayerParticipant
    await prisma.prayerParticipant.delete({
      where: { id },
    });

    // Maintenir la compatibilité avec PrayerChainLink
    // Supprimer le lien correspondant si existe
    const participant = await prisma.prayerParticipant.findUnique({
      where: { id },
      select: { prayerChainId: true, userId: true },
    });

    if (participant) {
      await prisma.prayerChainLink.deleteMany({
        where: {
          chainId: participant.prayerChainId,
          userId: participant.userId,
        },
      }).catch(() => {
        // Ignore si n'existe pas
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression participant:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
