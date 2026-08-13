import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const room = await prisma.trainingRoom.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: { select: { members: true } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Formation non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Erreur récupération formation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { title, description, isActive, isPublic, maxParticipants, scheduledStart, scheduledEnd } = body;

    const room = await prisma.trainingRoom.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!room) {
      return NextResponse.json({ error: "Formation non trouvée" }, { status: 404 });
    }

    if (room.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedRoom = await prisma.trainingRoom.update({
      where: { id: resolvedParams.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
        ...(isPublic !== undefined && { isPublic }),
        ...(maxParticipants !== undefined && { maxParticipants }),
        ...(scheduledStart !== undefined && { scheduledStart: scheduledStart ? new Date(scheduledStart) : null }),
        ...(scheduledEnd !== undefined && { scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null }),
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error("Erreur mise à jour formation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const room = await prisma.trainingRoom.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!room) {
      return NextResponse.json({ error: "Formation non trouvée" }, { status: 404 });
    }

    if (room.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.trainingRoom.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression formation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
