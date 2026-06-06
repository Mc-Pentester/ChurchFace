import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * 📥 GET COMMENTS
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
        post: { select: { id: true, content: true } },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("ADMIN COMMENTS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

/**
 * ❌ DELETE COMMENT
 */
export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN COMMENT DELETE ERROR:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
