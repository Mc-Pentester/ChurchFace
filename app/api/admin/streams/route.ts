import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * 📥 GET STREAMS
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const streams = await prisma.stream.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ streams });
  } catch (error) {
    console.error("ADMIN STREAMS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load streams" }, { status: 500 });
  }
}

/**
 * ❌ DELETE STREAM
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
      return NextResponse.json({ error: "Stream ID required" }, { status: 400 });
    }

    await prisma.stream.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN STREAM DELETE ERROR:", error);
    return NextResponse.json({ error: "Failed to delete stream" }, { status: 500 });
  }
}
