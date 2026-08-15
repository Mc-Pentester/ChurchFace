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
    
    // Get rooms associated with this campaign
    const rooms = await prisma.prayerRoom.findMany({
      where: {
        campaigns: {
          some: {
            campaignId: campaignId,
          },
        },
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Erreur récupération salles campagne:", error);
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
    const { roomIds } = body;

    // Delete all existing associations
    await prisma.prayerCampaignRoom.deleteMany({
      where: {
        campaignId: campaignId,
      },
    });

    // Create new associations
    if (roomIds && roomIds.length > 0) {
      await prisma.prayerCampaignRoom.createMany({
        data: roomIds.map((roomId: string) => ({
          campaignId,
          roomId,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour salles campagne:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
