import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

/**
 * Create a new comment for a given post.
 * Payload: { postId: string, content: string }
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

    const ip = getClientIp(req);
    const commentRate = rateLimit({
      key: `comment:create:${userId}:${ip}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!commentRate.success) {
      return NextResponse.json(
        { error: "Trop de commentaires, réessaie dans une minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const postId = body?.postId;
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const parentId = body?.parentId || null;

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId et content requis" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Commentaire trop long." },
        { status: 400 }
      );
    }

    const postExists = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });
    if (!postExists) {
      return NextResponse.json(
        { error: "Post introuvable." },
        { status: 404 }
      );
    }

    if (parentId) {
      const parentExists = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, userId: true },
      });
      if (!parentExists) {
        return NextResponse.json(
          { error: "Commentaire parent introuvable." },
          { status: 404 }
        );
      }
    }

    const created = await prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId,
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    // Create notification for post author if not self-comment
    if (postExists.authorId !== userId) {
      await createNotification({
        toUserId: postExists.authorId,
        fromUserId: userId,
        type: "POST_COMMENT",
        message: "Someone commented on your post",
        entityId: postId,
        entityType: "post",
      });
    }

    return NextResponse.json({
      id: created.id,
      postId: created.postId,
      content: created.content,
      parentId: created.parentId,
      user: created.user?.name || "Utilisateur",
    });
  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);
    return NextResponse.json(
      { error: "Erreur création commentaire" },
      { status: 500 }
    );
  }
}

