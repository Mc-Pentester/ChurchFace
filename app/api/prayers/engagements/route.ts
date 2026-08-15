import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prayerRequestId = searchParams.get("prayerRequestId");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    const where: any = {};
    if (prayerRequestId) where.prayerRequestId = prayerRequestId;
    if (userId) where.userId = userId;
    if (type) where.type = type;

    const engagements = await prisma.prayerEngagement.findMany({
      where,
      include: {
        prayerRequest: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ engagements });
  } catch (error) {
    console.error("Erreur récupération engagements:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { prayerRequestId, type } = body;

    if (!prayerRequestId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if engagement already exists
    const existing = await prisma.prayerEngagement.findFirst({
      where: {
        prayerRequestId,
        userId: session.user.id,
        type,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Engagement already exists" }, { status: 400 });
    }

    const engagement = await prisma.prayerEngagement.create({
      data: {
        prayerRequestId,
        userId: session.user.id,
        type,
      },
      include: {
        prayerRequest: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ engagement });
  } catch (error) {
    console.error("Erreur création engagement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Verify ownership
    const engagement = await prisma.prayerEngagement.findUnique({
      where: { id },
    });

    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    if (engagement.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.prayerEngagement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression engagement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
