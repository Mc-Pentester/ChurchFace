import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// GET - List all campaign-chain associations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const chainId = searchParams.get("chainId");

    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (chainId) where.chainId = chainId;

    const campaignChains = await prisma.prayerCampaignChain.findMany({
      where,
      include: {
        campaign: {
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
        },
        chain: {
          include: {
            _count: {
              select: {
                participants: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json({ campaignChains });
  } catch (error) {
    console.error("Erreur récupération associations campagne-chaîne:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Associate a chain with a campaign (mobilize chain)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { campaignId, chainId } = body;

    if (!campaignId || !chainId) {
      return NextResponse.json({ error: "Missing campaignId or chainId" }, { status: 400 });
    }

    // Check if association already exists
    const existing = await prisma.prayerCampaignChain.findUnique({
      where: {
        campaignId_chainId: {
          campaignId,
          chainId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Association already exists" }, { status: 409 });
    }

    // Verify campaign exists and user has permission
    const campaign = await prisma.prayerCampaign.findUnique({
      where: { id: campaignId },
      include: {
        church: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verify chain exists
    const chain = await prisma.prayerChain.findUnique({
      where: { id: chainId },
    });

    if (!chain) {
      return NextResponse.json({ error: "Chain not found" }, { status: 404 });
    }

    // Check permission: user must be campaign creator or church admin
    const isCreator = campaign.createdBy === session.user.id;
    const isChurchAdmin = campaign.churchId
      ? await prisma.churchMember.findFirst({
          where: {
            churchId: campaign.churchId,
            userId: session.user.id,
            role: { in: ["ADMIN", "MODERATOR"] },
          },
        })
      : false;

    if (!isCreator && !isChurchAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create association
    const campaignChain = await prisma.prayerCampaignChain.create({
      data: {
        campaignId,
        chainId,
      },
      include: {
        campaign: {
          include: {
            church: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        chain: true,
      },
    });

    // Notify chain participants about mobilization
    const chainParticipants = await prisma.prayerParticipant.findMany({
      where: { prayerChainId: chainId },
      select: { userId: true },
    });

    for (const participant of chainParticipants) {
      if (participant.userId !== session.user.id) {
        await createNotification({
          userId: participant.userId,
          senderId: session.user.id,
          type: "CAMPAIGN_MOBILIZES_CHAIN",
          message: `La campagne "${campaign.title}" mobilise votre chaîne de prière`,
          entityId: campaign.id,
          entityType: "prayerCampaign",
          metadata: { campaignId, chainId },
        });
      }
    }

    return NextResponse.json({ campaignChain }, { status: 201 });
  } catch (error) {
    console.error("Erreur création association campagne-chaîne:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Remove association between campaign and chain
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const chainId = searchParams.get("chainId");

    if (!campaignId || !chainId) {
      return NextResponse.json({ error: "Missing campaignId or chainId" }, { status: 400 });
    }

    // Get association for permission check
    const association = await prisma.prayerCampaignChain.findUnique({
      where: {
        campaignId_chainId: {
          campaignId,
          chainId,
        },
      },
      include: {
        campaign: {
          include: {
            church: true,
          },
        },
      },
    });

    if (!association) {
      return NextResponse.json({ error: "Association not found" }, { status: 404 });
    }

    // Check permission
    const isCreator = association.campaign.createdBy === session.user.id;
    const isChurchAdmin = association.campaign.churchId
      ? await prisma.churchMember.findFirst({
          where: {
            churchId: association.campaign.churchId,
            userId: session.user.id,
            role: { in: ["ADMIN", "MODERATOR"] },
          },
        })
      : false;

    if (!isCreator && !isChurchAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete association
    await prisma.prayerCampaignChain.delete({
      where: {
        campaignId_chainId: {
          campaignId,
          chainId,
        },
      },
    });

    // Notify chain participants about removal
    const chainParticipants = await prisma.prayerParticipant.findMany({
      where: { prayerChainId: chainId },
      select: { userId: true },
    });

    for (const participant of chainParticipants) {
      if (participant.userId !== session.user.id) {
        await createNotification({
          userId: participant.userId,
          senderId: session.user.id,
          type: "CAMPAIGN_CHAIN_REMOVED",
          message: `La chaîne de prière a été retirée de la campagne`,
          entityId: campaignId,
          entityType: "prayerCampaign",
          metadata: { campaignId, chainId },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression association campagne-chaîne:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
