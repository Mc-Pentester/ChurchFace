import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BroadcastContextService } from "@/lib/broadcast/BroadcastContextService";

export const runtime = "nodejs";

/**
 * GET - Lister les broadcasts de l'utilisateur
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const broadcasts = await BroadcastContextService.listBroadcasts({
      ownerId: session.user.id,
    });

    return NextResponse.json({ broadcasts });
  } catch (error) {
    console.error("Error listing broadcasts:", error);
    return NextResponse.json(
      { error: "Failed to list broadcasts" },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un nouveau broadcast
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, ownerType, ownerId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const broadcast = await BroadcastContextService.createBroadcast({
      title,
      ownerType: ownerType || "USER",
      ownerId: session.user.id,
      authorId: session.user.id,
    });

    return NextResponse.json({ broadcast });
  } catch (error) {
    console.error("Error creating broadcast:", error);
    return NextResponse.json(
      { error: "Failed to create broadcast" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer un broadcast
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const broadcastId = searchParams.get("id");

    if (!broadcastId) {
      return NextResponse.json({ error: "Broadcast ID is required" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le propriétaire
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    if (broadcast.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.liveBroadcast.delete({
      where: { id: broadcastId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    return NextResponse.json(
      { error: "Failed to delete broadcast" },
      { status: 500 }
    );
  }
}
