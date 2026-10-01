import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { publishPrayerCampaign } from "@/lib/feedPublisher";

// GET - Récupérer les campagnes de prière
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");
    const isActive = searchParams.get("isActive");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};

    if (churchId) {
      const authorization = await authorize({ actorId: userId, action: "PRAYER_CAMPAIGN_CREATE", churchId });
      if (authorization.status !== 200) return NextResponse.json({ error: "Forbidden" }, { status: authorization.status });
      where.churchId = churchId;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    const campaigns = await prisma.prayerCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            chains: true,
          },
        },
        campaignChains: {
          include: {
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
        },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Erreur récupération campagnes:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer une campagne de prière
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      title,
      description,
      imageUrl,
      type,
      startDate,
      endDate,
      churchId,
    } = body;

    if (!title || !type || !startDate || !endDate) {
      return NextResponse.json(
        {
          error:
            "title, type, startDate et endDate requis",
        },
        { status: 400 }
      );
    }

    const validTypes = [
      "FAST",
      "PRAYER",
      "VIGIL",
      "NATIONAL",
      "GLOBAL",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type de campagne invalide" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        { error: "Dates invalides" },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        {
          error:
            "La date de fin doit être après la date de début",
        },
        { status: 400 }
      );
    }

    const authorization = await authorize({ actorId: userId, action: "PRAYER_CAMPAIGN_CREATE", churchId: churchId || null });
    if (authorization.status !== 200) return NextResponse.json({ error: authorization.status === 401 ? "Unauthorized" : "Forbidden" }, { status: authorization.status });

    if (churchId) {
      const church = await prisma.church.findUnique({
        where: { id: churchId },
        select: { id: true },
      });

      if (!church) {
        return NextResponse.json(
          { error: "Église introuvable" },
          { status: 404 }
        );
      }
    }
    const campaign = await prisma.prayerCampaign.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        type,
        startDate: start,
        endDate: end,
        isActive: true,
        churchId: churchId || null,
        createdBy: userId,
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            chains: true,
          },
        },
        campaignChains: {
          include: {
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
        },
      },
    });

    // Create notification for church members if church is associated
    if (churchId) {
      const churchMembers = await prisma.churchMember.findMany({
        where: { churchId },
        select: { userId: true },
      });

      for (const member of churchMembers) {
        if (member.userId !== userId) {
          await createNotification({
            userId: member.userId,
            senderId: userId,
            type: "PRAYER_CAMPAIGN_CREATED",
            message: `Nouvelle campagne de prière créée`,
            entityId: campaign.id,
            entityType: "prayerCampaign",
            metadata: { campaignId: campaign.id, churchId },
          });
        }
      }

      // Publish to Feed if church is associated
      await publishPrayerCampaign({
        prayerCampaignId: campaign.id,
        churchId,
        authorId: userId,
      });
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Erreur création campagne:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}