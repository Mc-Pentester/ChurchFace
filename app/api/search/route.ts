import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ users: [], posts: [], events: [] });
    }

    const [users, posts, events] = await Promise.all([
      prisma.user.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
        take: 5,
      }),
      prisma.post.findMany({
        where: {
          content: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: { id: true, name: true, image: true },
          },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ users, posts, events });
  } catch {
    return NextResponse.json(
      { error: "Erreur recherche" },
      { status: 500 }
    );
  }
}
