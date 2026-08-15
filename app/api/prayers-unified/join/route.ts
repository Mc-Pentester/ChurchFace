import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { prayerId } = body;

    if (!prayerId) {
      return NextResponse.json({ error: "Missing prayerId" }, { status: 400 });
    }

    // Récupérer la prière pour vérifier le type
    const prayer = await prisma.prayer.findUnique({
      where: { id: prayerId },
    });

    if (!prayer) {
      return NextResponse.json({ error: "Prayer not found" }, { status: 404 });
    }

    // Vérifier si l'utilisateur a déjà rejoint (pour COLLABORATIVE_CHAIN)
    if (prayer.type === "COLLABORATIVE_CHAIN") {
      const existing = await prisma.prayerParticipant.findUnique({
        where: {
          prayerChainId_userId: {
            prayerChainId: prayerId,
            userId: session.user.id
          }
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Already joined" }, { status: 409 });
      }

      // Créer le participant
      const participant = await prisma.prayerParticipant.create({
        data: {
          prayerChainId: prayerId,
          userId: session.user.id,
          role: "PARTICIPANT",
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      return NextResponse.json({ participant }, { status: 201 });
    }

    // Pour LIVE_ROOM, créer un participant dans PrayerLiveRoom
    if (prayer.type === "LIVE_ROOM") {
      const existing = await prisma.prayerParticipant.findFirst({
        where: {
          prayerLiveRoomId: prayerId,
          userId: session.user.id
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Already joined" }, { status: 409 });
      }

      const participant = await prisma.prayerParticipant.create({
        data: {
          prayerLiveRoomId: prayerId,
          userId: session.user.id,
          role: "PARTICIPANT",
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      return NextResponse.json({ participant }, { status: 201 });
    }

    // Pour les autres types, retourner une erreur
    return NextResponse.json({ error: "Cannot join this prayer type" }, { status: 400 });

  } catch (error) {
    console.error("Erreur rejoindre prière:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
