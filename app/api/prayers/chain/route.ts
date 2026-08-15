import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const visibility = searchParams.get("visibility");
  
  const where: any = { isActive: true };
  if (visibility && visibility !== "ALL") {
    where.visibility = visibility;
  }
  
  const chains = await prisma.prayerChain.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      _count: { select: { participants: true } },
      participants: {
        take: 5,
        orderBy: { joinedAt: "asc" },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });
  return NextResponse.json({ chains });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action, chainId, prayerRequestId, prayerCampaignId, title, description, message } = body;

  if (action === "create") {
    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }
    const chain = await prisma.prayerChain.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        prayerRequestId: prayerRequestId || null,
        prayerCampaignId: prayerCampaignId || null,
        visibility: body.visibility || "PUBLIC",
      },
      include: {
        _count: { select: { participants: true } },
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        prayerCampaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    return NextResponse.json({ chain }, { status: 201 });
  }

  if (action === "join") {
    if (!chainId) return NextResponse.json({ error: "Missing chainId" }, { status: 400 });

    // Utiliser PrayerParticipant comme modèle principal
    const existing = await prisma.prayerParticipant.findUnique({
      where: {
        prayerChainId_userId: {
          prayerChainId: chainId,
          userId: session.user.id
        }
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already joined" }, { status: 409 });
    }

    const participant = await prisma.prayerParticipant.create({
      data: {
        prayerChainId: chainId,
        userId: session.user.id,
        role: "PARTICIPANT",
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        prayerChain: {
          include: {
            _count: { select: { participants: true } },
          },
        },
      },
    });

    // Maintenir la compatibilité avec PrayerChainLink
    await prisma.prayerChainLink.create({
      data: {
        chainId,
        userId: session.user.id,
        message: message?.trim() || null,
      },
    }).catch(() => {
      // Ignore si existe déjà
    });

    return NextResponse.json({ participant }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
