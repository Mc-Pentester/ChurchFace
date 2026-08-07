import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/albums
 * Get user's albums
 */
export async function GET(req: NextRequest) {
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
    const targetUserId = searchParams.get("userId");

    // If viewing another user's albums, check privacy
    if (targetUserId && targetUserId !== userId) {
      // Check if blocked
      const isBlocked = await prisma.block.findFirst({
        where: {
          blockerId: targetUserId,
          blockedId: userId,
        },
      });

      if (isBlocked) {
        return NextResponse.json(
          { error: "Accès refusé" },
          { status: 403 }
        );
      }

      // Get user's privacy settings
      const privacy = await prisma.profilePrivacy.findUnique({
        where: { userId: targetUserId },
      });

      // If profile locked and not friends, return only public albums
      if (privacy?.profileLocked) {
        const isFriend = await prisma.friendship.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: targetUserId },
              { senderId: targetUserId, receiverId: userId },
            ],
            status: "ACCEPTED",
          },
        });

        if (!isFriend) {
          const albums = await prisma.album.findMany({
            where: {
              userId: targetUserId,
              visibility: "PUBLIC",
            },
            include: {
              _count: {
                select: { media: true },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          return NextResponse.json({ albums });
        }
      }
    }

    const albums = await prisma.album.findMany({
      where: {
        userId: targetUserId || userId,
      },
      include: {
        _count: {
          select: { media: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ albums });
  } catch (error) {
    console.error("ALBUMS GET ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement albums" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/albums
 * Create new album
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

    const body = await req.json();
    const { name, type, visibility } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nom requis" },
        { status: 400 }
      );
    }

    const validTypes = ["PROFILE", "COVER", "CUSTOM"];
    const validVisibilities = ["PUBLIC", "FRIENDS", "PRIVATE"];

    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type invalide" },
        { status: 400 }
      );
    }

    if (visibility && !validVisibilities.includes(visibility)) {
      return NextResponse.json(
        { error: "Visibilité invalide" },
        { status: 400 }
      );
    }

    const album = await prisma.album.create({
      data: {
        userId,
        name,
        type: type || "CUSTOM",
        visibility: visibility || "PUBLIC",
      },
    });

    return NextResponse.json({ album });
  } catch (error) {
    console.error("ALBUM CREATE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur création album" },
      { status: 500 }
    );
  }
}
