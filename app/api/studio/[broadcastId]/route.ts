import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * PATCH - Mettre à jour un broadcast (ex: livekitRoom, status)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { broadcastId } = await params;
    const body = await req.json();
    const { livekitRoom, status, startedAt, endedAt } = body;

    // Vérifier que le broadcast existe
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Vérifier les permissions
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = broadcast.ownerId === session.user.id;
    const isAuthor = broadcast.authorId === session.user.id;

    if (!isAdmin && !isOwner && !isAuthor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mettre à jour le broadcast
    const updateData: any = {};
    if (livekitRoom !== undefined) updateData.livekitRoom = livekitRoom;
    if (status !== undefined) updateData.status = status;
    if (startedAt !== undefined) updateData.startedAt = startedAt;
    if (endedAt !== undefined) updateData.endedAt = endedAt;

    const updatedBroadcast = await prisma.liveBroadcast.update({
      where: { id: broadcastId },
      data: updateData,
    });

    return NextResponse.json({ broadcast: updatedBroadcast });
  } catch (error) {
    console.error("Error updating broadcast:", error);
    return NextResponse.json(
      { error: "Failed to update broadcast" },
      { status: 500 }
    );
  }
}
