import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * POST /api/shares
 * Toggle share on a post (add if not exists, remove if exists)
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
      select: { id: true },
    });

    if (!postExists) {
      return NextResponse.json(
        { error: "Post introuvable" },
        { status: 404 }
      );
    }

    const existingShare = await prisma.share.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingShare) {
      await prisma.share.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      return NextResponse.json({ shared: false });
    } else {
      await prisma.share.create({
        data: {
          userId,
          postId,
        },
      });

      return NextResponse.json({ shared: true });
    }
  } catch (error) {
    console.error("SHARE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur share" },
      { status: 500 }
    );
  }
}
