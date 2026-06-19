import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    // Check if current user is SUPER_ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only SUPER_ADMIN can promote users" },
        { status: 403 }
      );
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}
