import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");
    const isPublic = searchParams.get("isPublic");

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === "true";
    if (isPublic !== null) where.isPublic = isPublic === "true";

    const rooms = await prisma.trainingRoom.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Erreur récupération formations:", error);
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
    const { title, description, roomType, isPublic, maxParticipants, scheduledStart, scheduledEnd } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const room = await prisma.trainingRoom.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        roomType: roomType || "VIDEO",
        isPublic: isPublic ?? true,
        instructorId: session.user.id,
        isActive: true,
        maxParticipants: maxParticipants || null,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Erreur création formation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
