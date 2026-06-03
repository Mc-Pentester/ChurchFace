import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { postId } = await params;

    if (!postId || typeof postId !== "string") {
      return NextResponse.json(
        { error: "Invalid postId" },
        { status: 400 }
      );
    }

    // Vérifie si le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check share existant
    const existingShare = await prisma.share.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let shared: boolean;

    if (existingShare) {
      // UNSHARE
      await prisma.share.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      shared = false;
    } else {
      // SHARE
      await prisma.share.create({
        data: {
          userId,
          postId,
        },
      });

      shared = true;
    }

    return NextResponse.json({ shared });
  } catch (error) {
    console.error("SHARE ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}