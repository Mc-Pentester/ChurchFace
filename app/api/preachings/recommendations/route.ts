import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's viewing history
    const viewedPreachings = await prisma.preachingView.findMany({
      where: { userId: session.user.id },
      select: { preachingId: true },
      take: 50,
      orderBy: { watchedAt: "desc" },
    });

    const viewedIds = viewedPreachings.map((v) => v.preachingId);

    // Get user's liked preachings
    const likedPreachings = await prisma.preachingLike.findMany({
      where: { userId: session.user.id },
      select: { preachingId: true },
      take: 50,
    });

    const likedIds = likedPreachings.map((l) => l.preachingId);

    // Get user's bookmarked preachings
    const bookmarkedPreachings = await prisma.preachingBookmark.findMany({
      where: { userId: session.user.id },
      select: { preachingId: true },
      take: 50,
    });

    const bookmarkedIds = bookmarkedPreachings.map((b) => b.preachingId);

    // Get categories from viewed/liked/bookmarked preachings
    const preachingsWithCategories = await prisma.preaching.findMany({
      where: {
        id: { in: [...viewedIds, ...likedIds, ...bookmarkedIds] },
      },
      select: { categoryId: true, authorId: true },
    });

    const categoryIds = [...new Set(preachingsWithCategories.map((p) => p.categoryId))];
    const authorIds = [...new Set(preachingsWithCategories.map((p) => p.authorId))];

    // Get recommendations based on:
    // 1. Same categories
    // 2. Same authors
    // 3. High views
    // 4. Recent
    const recommendations = await prisma.preaching.findMany({
      where: {
        AND: [
          { id: { notIn: [...viewedIds, ...likedIds, ...bookmarkedIds] } },
          {
            OR: [
              { categoryId: { in: categoryIds } },
              { authorId: { in: authorIds } },
            ],
          },
        ],
      },
      orderBy: [
        { views: "desc" },
        { publishedAt: "desc" },
      ],
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: true,
        series: true,
        _count: {
          select: {
            preachingViews: true,
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    // Add isLiked and isBookmarked
    const [likedSet, bookmarkedSet] = await Promise.all([
      prisma.preachingLike.findMany({
        where: {
          userId: session.user.id,
          preachingId: { in: recommendations.map((r) => r.id) },
        },
        select: { preachingId: true },
      }),
      prisma.preachingBookmark.findMany({
        where: {
          userId: session.user.id,
          preachingId: { in: recommendations.map((r) => r.id) },
        },
        select: { preachingId: true },
      }),
    ]);

    const likedIdsSet = new Set(likedSet.map((l) => l.preachingId));
    const bookmarkedIdsSet = new Set(bookmarkedSet.map((b) => b.preachingId));

    const recommendationsWithFlags = recommendations.map((rec) => ({
      ...rec,
      isLiked: likedIdsSet.has(rec.id),
      isBookmarked: bookmarkedIdsSet.has(rec.id),
    }));

    return NextResponse.json({ preachings: recommendationsWithFlags });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
