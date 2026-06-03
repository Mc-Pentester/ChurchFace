import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * 📥 GET POSTS
 */
export async function GET() {
  try {
    await requireAdmin();

    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        author: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("ADMIN POSTS GET ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load posts",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * ❌ DELETE POST
 */
export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    await prisma.post.delete({
      where: {
        id: body.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ADMIN DELETE POST ERROR:", error);

    return NextResponse.json(
      {
        error: "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}