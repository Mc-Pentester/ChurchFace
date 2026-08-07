import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { uploadFiles } from "@/lib/uploadthing";

export const runtime = "nodejs";

/**
 * GET /api/media
 * Get media items
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
    const albumId = searchParams.get("albumId");
    const type = searchParams.get("type"); // PHOTO or VIDEO

    // If viewing another user's media, check privacy
    if (targetUserId && targetUserId !== userId) {
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

      const privacy = await prisma.profilePrivacy.findUnique({
        where: { userId: targetUserId },
      });

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
          const media = await prisma.media.findMany({
            where: {
              userId: targetUserId,
              visibility: "PUBLIC",
              ...(albumId && { albumId }),
              ...(type && { type }),
            },
            orderBy: { createdAt: "desc" },
          });

          return NextResponse.json({ media });
        }
      }
    }

    const media = await prisma.media.findMany({
      where: {
        userId: targetUserId || userId,
        ...(albumId && { albumId }),
        ...(type && { type }),
      },
      include: {
        album: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("MEDIA GET ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement média" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media
 * Upload media item
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
    const file = body.file;
    const albumId = body.albumId;
    const caption = body.caption;
    const visibility = body.visibility;

    if (!file || !file.url) {
      return NextResponse.json(
        { error: "Fichier requis" },
        { status: 400 }
      );
    }

    // Determine media type from file type
    const isVideo = file.type && file.type.startsWith("video/");
    const mediaType = isVideo ? "VIDEO" : "PHOTO";

    const imageUrl = file.url;

    // Validate visibility
    const validVisibilities = ["PUBLIC", "FRIENDS", "PRIVATE"];
    if (visibility && !validVisibilities.includes(visibility)) {
      return NextResponse.json(
        { error: "Visibilité invalide" },
        { status: 400 }
      );
    }

    // Create media record
    const media = await prisma.media.create({
      data: {
        userId,
        albumId: albumId || null,
        type: mediaType,
        url: imageUrl,
        thumbnail: file.thumbnail || null,
        caption: caption || null,
        visibility: visibility || "PUBLIC",
      },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("MEDIA UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Erreur upload média" },
      { status: 500 }
    );
  }
}
