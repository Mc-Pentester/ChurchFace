import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalLikes,
      totalShares,
      totalStreams,
      totalRadios,
      liveStreams,
      liveRadios,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.share.count(),
      prisma.stream.count(),
      prisma.radio.count(),
      prisma.stream.count({ where: { isLive: true } }),
      prisma.radio.count({ where: { isLive: true } }),
    ]);

    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 86400000),
        },
      },
    });

    const newPostsToday = await prisma.post.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 86400000),
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalLikes,
      totalShares,
      totalStreams,
      totalRadios,
      liveStreams,
      liveRadios,
      newUsersToday,
      newPostsToday,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
