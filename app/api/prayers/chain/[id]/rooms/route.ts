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
    const { id: chainId } = await params;
    
    // Get rooms associated with this chain
    const rooms = await prisma.prayerRoom.findMany({
      where: {
        prayerChainId: chainId,
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
    console.error("Erreur récupération salles chaîne:", error);
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
    const { id: chainId } = await params;
    const body = await req.json();
    const { roomIds } = body;

    // Update all rooms to either link or unlink from this chain
    // First, unlink all rooms from this chain
    await prisma.prayerRoom.updateMany({
      where: {
        prayerChainId: chainId,
      },
      data: {
        prayerChainId: null,
      },
    });

    // Then, link the selected rooms
    if (roomIds && roomIds.length > 0) {
      await prisma.prayerRoom.updateMany({
        where: {
          id: {
            in: roomIds,
          },
        },
        data: {
          prayerChainId: chainId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur mise à jour salles chaîne:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
