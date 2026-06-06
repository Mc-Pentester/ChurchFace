import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * 📥 GET USERS
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: { posts: true, comments: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("ADMIN USERS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

/**
 * 🔄 PATCH USER ROLE (promote / demote)
 */
export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, role } = body;

    if (!id || !role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("ADMIN USER PATCH ERROR:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

/**
 * ❌ DELETE USER
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
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN USER DELETE ERROR:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}