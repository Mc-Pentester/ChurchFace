import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/block
 * Get blocked users list
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const blockedUsers = await prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ blockedUsers });
  } catch (error) {
    console.error("BLOCK GET ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement liste blocage" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/block
 * Block a user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { blockedId } = await req.json();

    if (!blockedId) {
      return NextResponse.json(
        { error: "blockedId requis" },
        { status: 400 }
      );
    }

    if (blockedId === userId) {
      return NextResponse.json(
        { error: "Impossible de se bloquer soi-même" },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existing = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Utilisateur déjà bloqué" },
        { status: 400 }
      );
    }

    // Create block
    const block = await prisma.block.create({
      data: {
        blockerId: userId,
        blockedId,
      },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Remove friendship if exists
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: blockedId },
          { senderId: blockedId, receiverId: userId },
        ],
      },
    });

    // Remove follow relationships
    await prisma.userFollow.deleteMany({
      where: {
        OR: [
          { followerId: userId, followingId: blockedId },
          { followerId: blockedId, followingId: userId },
        ],
      },
    });

    return NextResponse.json({ block });
  } catch (error) {
    console.error("BLOCK CREATE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur blocage utilisateur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/block
 * Unblock a user
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const blockedId = searchParams.get("blockedId");

    if (!blockedId) {
      return NextResponse.json(
        { error: "blockedId requis" },
        { status: 400 }
      );
    }

    await prisma.block.deleteMany({
      where: {
        blockerId: userId,
        blockedId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BLOCK DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur déblocage utilisateur" },
      { status: 500 }
    );
  }
}
