import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  
  const categoryId = searchParams.get("categoryId");
  const seriesId = searchParams.get("seriesId");
  const authorId = searchParams.get("authorId");
  const period = searchParams.get("period") || "all";
  const sort = searchParams.get("sort") || "recent";
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "20");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (seriesId) where.seriesId = seriesId;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Period filter
    if (period === "week") {
      where.publishedAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === "month") {
      where.publishedAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    // Sorting
    let orderBy: any = { publishedAt: "desc" };
    if (sort === "views") orderBy = { views: "desc" };
    if (sort === "rating") orderBy = { likes: "desc" };

    const [preachings, total] = await Promise.all([
      prisma.preaching.findMany({
        where,
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
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
          series: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              preachingViews: true,
              likes: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
      }),
      prisma.preaching.count({ where }),
    ]);

    // Add isLiked and isBookmarked if user is authenticated
    if (session?.user) {
      const [likedIds, bookmarkedIds] = await Promise.all([
        prisma.preachingLike.findMany({
          where: { userId: session.user.id, preachingId: { in: preachings.map(p => p.id) } },
          select: { preachingId: true },
        }),
        prisma.preachingBookmark.findMany({
          where: { userId: session.user.id, preachingId: { in: preachings.map(p => p.id) } },
          select: { preachingId: true },
        }),
      ]);

      const likedSet = new Set(likedIds.map(l => l.preachingId));
      const bookmarkedSet = new Set(bookmarkedIds.map(b => b.preachingId));

      preachings.forEach((preaching: any) => {
        preaching.isLiked = likedSet.has(preaching.id);
        preaching.isBookmarked = bookmarkedSet.has(preaching.id);
      });
    }

    return NextResponse.json({
      preachings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching preachings:", error);
    return NextResponse.json(
      { error: "Failed to fetch preachings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, thumbnail, videoUrl, duration, categoryId, seriesId, verses } = await req.json();

    if (!title || !description || !videoUrl || !duration || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const preaching = await prisma.preaching.create({
      data: {
        title,
        description,
        thumbnail,
        videoUrl,
        duration,
        authorId: session.user.id,
        categoryId,
        seriesId,
        verses: verses ? {
          create: verses.map((verse: any) => ({
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
          })),
        } : undefined,
      },
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
        verses: true,
      },
    });

    return NextResponse.json(preaching, { status: 201 });
  } catch (error) {
    console.error("Error creating preaching:", error);
    return NextResponse.json(
      { error: "Failed to create preaching" },
      { status: 500 }
    );
  }
}
