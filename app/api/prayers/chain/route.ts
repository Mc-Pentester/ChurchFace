import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const visibility = searchParams.get("visibility");
  const status = searchParams.get("status");

  const where: any = { isActive: true };
  if (visibility && visibility !== "ALL") {
    where.visibility = visibility;
  }
  if (status && status !== "ALL") {
    where.status = status;
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
      campaignChains: {
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              type: true,
              startDate: true,
              endDate: true,
              isActive: true,
            },
          },
        },
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

    // Create chain with prayerCampaignId for backward compatibility
    const chain = await prisma.prayerChain.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        prayerRequestId: prayerRequestId || null,
        prayerCampaignId: prayerCampaignId || null, // @deprecated: kept for backward compatibility
        visibility: body.visibility || "PUBLIC",
      },
      include: {
        _count: { select: { participants: true } },
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        campaignChains: {
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // If prayerCampaignId is provided, also create PrayerCampaignChain association
    if (prayerCampaignId) {
      await prisma.prayerCampaignChain.create({
        data: {
          campaignId: prayerCampaignId,
          chainId: chain.id,
        },
      }).catch(() => {
        // Ignore if association already exists
      });
    }

    // Create notification for church members if church is associated
    if (body.churchId) {
      const churchMembers = await prisma.churchMember.findMany({
        where: { churchId: body.churchId },
        select: { userId: true },
      });

      for (const member of churchMembers) {
        if (member.userId !== session.user.id) {
          await createNotification({
            userId: member.userId,
            senderId: session.user.id,
            type: "PRAYER_CHAIN_CREATED",
            message: `${session.user.name || "Someone"} created a new prayer chain`,
            entityId: chain.id,
            entityType: "prayerChain",
            metadata: { chainId: chain.id, churchId: body.churchId },
          });
        }
      }
    }

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

    // Create notification for chain creator (first participant with ADMIN/CREATOR role)
    const chainCreator = await prisma.prayerParticipant.findFirst({
      where: {
        prayerChainId: chainId,
        role: { in: ["ADMIN", "CREATOR", "MODERATOR"] },
      },
      select: { userId: true },
    });

    if (chainCreator && chainCreator.userId !== session.user.id) {
      await createNotification({
        userId: chainCreator.userId,
        senderId: session.user.id,
        type: "PRAYER_CHAIN_JOINED",
        message: `${session.user.name || "Someone"} joined your prayer chain`,
        entityId: participant.id,
        entityType: "prayerParticipant",
        metadata: { chainId },
      });
    }

    // Create notifications for other participants about new participant
    const otherParticipants = await prisma.prayerParticipant.findMany({
      where: {
        prayerChainId: chainId,
        userId: { not: session.user.id },
      },
      select: { userId: true },
    });

    for (const otherParticipant of otherParticipants) {
      if (otherParticipant.userId !== chainCreator?.userId) {
        await createNotification({
          userId: otherParticipant.userId,
          senderId: session.user.id,
          type: "CHAIN_NEW_PARTICIPANT",
          message: `${session.user.name || "Someone"} joined the prayer chain`,
          entityId: participant.id,
          entityType: "prayerParticipant",
          metadata: { chainId },
        });
      }
    }

    return NextResponse.json({ participant }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
