import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";

export const runtime = "nodejs";

/**
 * PATCH - Mettre à jour un broadcast (ex: livekitRoom, status)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
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
    const isOwner = broadcast.ownerId === userId;
    const isAuthor = broadcast.authorId === userId;

    if (!isOwner && !isAuthor) {
      const authorization = await authorize({
        actorId: userId,
        action: "STUDIO_BROADCAST_UPDATE",
      });

      if (authorization.status !== 200) {
        return NextResponse.json(
          {
            error:
              authorization.status === 401
                ? "Unauthorized"
                : "Forbidden",
          },
          { status: authorization.status }
        );
      }
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
