import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roomId = resolvedParams.id;

    const participants = await prisma.prayerLiveRoomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json({ participants });
  } catch (error) {
    console.error("Erreur récupération participants salle:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
