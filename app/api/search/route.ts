import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q");

    if (!q || q.length < 1) {
      return NextResponse.json([]);
    }

    // USERS
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 5,
    });

    // POSTS
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 5,
    });

    // EVENTS
    const events = await prisma.event.findMany({
      where: {
        title: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 5,
    });

    return NextResponse.json({
      users,
      posts,
      events,
    });

  } catch {
    return NextResponse.json(
      { error: "Erreur recherche" },
      { status: 500 }
    );
  }
}

