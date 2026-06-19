import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

/**
 * POST /api/likes
 * Toggle like on a post (add if not exists, remove if exists)
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
    const postId = body?.postId;

    if (!postId) {
      return NextResponse.json(
        { error: "postId requis" },
        { status: 400 }
      );
    }

    const postExists = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!postExists) {
      return NextResponse.json(
        { error: "Post introuvable" },
        { status: 404 }
      );
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      // Create notification for post author if not self-like
      if (postExists.authorId !== userId) {
        await createNotification({
          toUserId: postExists.authorId,
          fromUserId: userId,
          type: "POST_LIKE",
          message: "Someone liked your post",
          entityId: postId,
          entityType: "post",
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("LIKE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur like" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/likes
 * Remove like from a post
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

    const body = await req.json();
    const postId = body?.postId;

    if (!postId) {
      return NextResponse.json(
        { error: "postId requis" },
        { status: 400 }
      );
    }

    await prisma.like.deleteMany({
      where: {
        userId,
        postId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UNLIKE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur unlike" },
      { status: 500 }
    );
  }
}
