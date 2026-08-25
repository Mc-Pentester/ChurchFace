import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: campaignId } = await params;
    
    // Get chains associated with this campaign
    const chains = await prisma.prayerChain.findMany({
      where: {
        prayerCampaignId: campaignId,
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return NextResponse.json({ chains });
  } catch (error) {
    console.error("Erreur récupération chaînes campagne:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: campaignId } = await params;
    const body = await req.json();
    const { chainIds } = body;

    // Update all chains to either link or unlink from this campaign
    // First, unlink all chains from this campaign
    await prisma.prayerChain.updateMany({
      where: {
        prayerCampaignId: campaignId,
      },
      data: {
        prayerCampaignId: null,
      },
    });

    // Then, link the selected chains
    if (chainIds && chainIds.length > 0) {
      await prisma.prayerChain.updateMany({
        where: {
          id: {
            in: chainIds,
          },
        },
        data: {
          prayerCampaignId: campaignId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour chaînes campagne:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
