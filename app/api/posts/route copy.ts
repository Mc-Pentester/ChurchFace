import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * =========================
 * GET POSTS
 * =========================
 */
export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams;
    const limitRaw = Number(search.get("limit") ?? "10");
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 20)
      : 10;
    const cursor = search.get("cursor");

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        shares: {
          select: {
            userId: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const page = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    const normalizedPosts = page.map((post) => ({
      ...post,
      comments: [...post.comments].reverse(),
    }));

    return NextResponse.json({
      posts: normalizedPosts,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    return NextResponse.json(
      { error: "Erreur chargement posts" },
      { status: 500 }
    );
  }
}

/**
 * =========================
 * CREATE POST
 * =========================
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const ip = getClientIp(req);
    const postRate = rateLimit({
      key: `post:create:${userId}:${ip}`,
      limit: 8,
      windowMs: 60_000,
    });
    if (!postRate.success) {
      return NextResponse.json(
        { error: "Trop de publications, réessaie dans une minute." },
        { status: 429 }
      );
    }

    const body = await req.json();

    const content = body?.content?.trim() || "";

    const hashtags = [...content.matchAll(/#[a-zA-Z0-9_\u00C0-\u017F]+/g)].map(
      (m) => m[0].slice(1).toLowerCase()
    );

    const imageUrl =
      typeof body?.imageUrl === "string" && body.imageUrl.trim() !== ""
        ? body.imageUrl.trim()
        : null;

    const videoUrl =
      typeof body?.videoUrl === "string" && body.videoUrl.trim() !== ""
        ? body.videoUrl.trim()
        : null;

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Le texte du post est trop long." },
        { status: 400 }
      );
    }

    if (imageUrl && videoUrl) {
      return NextResponse.json(
        { error: "Un post ne peut contenir qu’un seul média." },
        { status: 400 }
      );
    }

    const isValidMediaUrl = (value: string | null) => {
      if (!value) return true;
      try {
        const parsed = new URL(value);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    };

    if (!isValidMediaUrl(imageUrl) || !isValidMediaUrl(videoUrl)) {
      return NextResponse.json(
        { error: "URL média invalide." },
        { status: 400 }
      );
    }

    if (!content && !imageUrl && !videoUrl) {
      return NextResponse.json(
        { error: "Post vide" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        videoUrl,
        hashtags: hashtags.length > 0 ? hashtags : [],
        author: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Return the created post (not a non-existent `posts` variable).
    return NextResponse.json({ post });
  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    return NextResponse.json(
      { error: "Erreur création post" },
      { status: 500 }
    );
  }
}