import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const churchId = body?.churchId;
    if (!churchId || typeof churchId !== "string") {
      return NextResponse.json({ error: "Invalid churchId" }, { status: 400 });
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in database. Please re-login." }, { status: 401 });
    }

    // Check if church exists
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const existing = await prisma.churchFollow.findUnique({
      where: {
        churchId_userId: {
          churchId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      await prisma.churchFollow.delete({
        where: {
          churchId_userId: {
            churchId,
            userId: session.user.id,
          },
        },
      });

      return NextResponse.json({ following: false });
    } else {
      await prisma.churchFollow.create({
        data: {
          churchId,
          userId: session.user.id,
        },
      });

      return NextResponse.json({ following: true });
    }
  } catch (err) {
    console.error("/api/church/follow error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
