import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const churchId = searchParams.get("churchId");

    if (!q || q.length < 2) {
      return NextResponse.json({ users: [], posts: [], events: [], prayers: [] });
    }

    const [users, posts, events, prayers] = await Promise.all([
      prisma.user.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
          ...(churchId ? { churchId } : {}),
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
          ...(churchId ? { churchId } : {}),
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          churchId: true,
          church: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: { id: true, name: true, image: true },
          },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.churchEvent.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
          ...(churchId ? { churchId } : {}),
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          churchId: true,
        },
        take: 5,
      }),
      prisma.prayerRequest.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
          ...(churchId ? { churchId } : {}),
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          churchId: true,
          church: {
            select: { id: true, name: true, slug: true },
          },
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ users, posts, events, prayers });
  } catch {
    return NextResponse.json(
      { error: "Erreur recherche" },
      { status: 500 }
    );
  }
}
