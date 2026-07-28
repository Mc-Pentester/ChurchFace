import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * =========================
 * UPDATE LIVE STATUS
 * =========================
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["LIVE", "OFFLINE", "SCHEDULED"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Find the church
    const church = await prisma.church.findUnique({
      where: { slug },
    });

    if (!church) {
      return NextResponse.json({ error: "Église non trouvée" }, { status: 404 });
    }

    // Check if user is admin of this church
    const isAdmin = await prisma.churchAdmin.findFirst({
      where: {
        churchId: church.id,
        userId,
      },
    });

    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Find or create ChurchLive
    let churchLive = await prisma.churchLive.findFirst({
      where: { churchId: church.id },
    });

    if (!churchLive) {
      churchLive = await prisma.churchLive.create({
        data: {
          churchId: church.id,
          status,
          startedAt: status === "LIVE" ? new Date() : null,
        },
      });
    } else {
      churchLive = await prisma.churchLive.update({
        where: { id: churchLive.id },
        data: {
          status,
          startedAt: status === "LIVE" ? new Date() : null,
          endedAt: status === "OFFLINE" ? new Date() : null,
        },
      });
    }

    // Find associated LiveBroadcast
    const liveBroadcast = await prisma.liveBroadcast.findFirst({
      where: { churchLives: { some: { id: churchLive.id } } },
    });

    if (liveBroadcast) {
      await prisma.liveBroadcast.update({
        where: { id: liveBroadcast.id },
        data: {
          status,
          startedAt: status === "LIVE" ? new Date() : liveBroadcast.startedAt,
          endedAt: status === "OFFLINE" ? new Date() : liveBroadcast.endedAt,
        },
      });
    }

    return NextResponse.json({ success: true, churchLive });
  } catch (error) {
    console.error("UPDATE LIVE STATUS ERROR:", error);
    return NextResponse.json(
      { error: "Erreur mise à jour statut live" },
      { status: 500 }
    );
  }
}
