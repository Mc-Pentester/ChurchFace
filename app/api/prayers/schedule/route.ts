import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prayerChainId = searchParams.get("prayerChainId");
    const userId = searchParams.get("userId");
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (prayerChainId) where.prayerChainId = prayerChainId;
    if (userId) where.userId = userId;
    if (isActive !== null) where.isActive = isActive === "true";

    const schedules = await prisma.prayerSchedule.findMany({
      where,
      include: {
        prayerChain: {
          select: {
            id: true,
            title: true,
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

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Erreur récupération horaires:", error);
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
    const { prayerChainId, hour, dayOfWeek, isActive = true } = body;

    if (!prayerChainId || hour === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const schedule = await prisma.prayerSchedule.create({
      data: {
        prayerChainId,
        userId: session.user.id,
        hour,
        dayOfWeek: dayOfWeek || null,
        isActive,
      },
      include: {
        prayerChain: {
          select: {
            id: true,
            title: true,
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

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Erreur création horaire:", error);
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
    const schedule = await prisma.prayerSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    if (schedule.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.prayerSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression horaire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
