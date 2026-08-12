import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canPublishContent } from "@/lib/moderation/ModerationService";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";

export const runtime = "nodejs";

/**
 * =========================
 * GET POSTS
 * =========================
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const cursor = searchParams.get("cursor") || null;
    const profileUserId = searchParams.get("userId") || null;

    // Get followed church IDs if user is authenticated
    let followedChurchIds: string[] = [];
    if (userId) {
      const follows = await prisma.churchFollow.findMany({
        where: { userId },
        select: { churchId: true },
      });
      followedChurchIds = follows.map((f) => f.churchId);
    }

    // Get live church IDs (currently live streams)
    const liveChurchLives = await prisma.churchLive.findMany({
      where: { status: "LIVE" },
      select: { churchId: true },
    });
    const liveChurchIds = liveChurchLives.map((l) => l.churchId);

    // Get public prayer requests from followed churches
    const churchPrayers = await prisma.prayerRequest.findMany({
      where: {
        churchId: { in: followedChurchIds },
        isUrgent: true, // Only show urgent prayers in global feed
      },
      select: {
        id: true,
        churchId: true,
        title: true,
        content: true,
        createdAt: true,
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

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
      where: {
        isHidden: false,
        ...(profileUserId
          ? {
              // Filter by specific user ID (for profile pages)
              authorId: profileUserId,
            }
          : {
              // Global feed logic
              OR: [
                // Personal posts
                { churchId: null },
                // Public posts from followed churches
                ...(followedChurchIds.length > 0
                  ? [{ churchId: { in: followedChurchIds } }]
                  : []),
                // Live posts from any church (show live streams even if not followed)
                ...(liveChurchIds.length > 0
                  ? [
                      {
                        churchId: { in: liveChurchIds },
                        generatedType: "CHURCH_LIVE",
                      },
                    ]
                  : []),
              ],
            }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        postMedias: {
          orderBy: {
            order: 'asc',
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
        likeRelations: {
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

    // Convert church prayers to post-like objects for the feed
    const prayerPosts = churchPrayers.map((prayer) => ({
      id: `prayer-${prayer.id}`, // Prefix to avoid ID collision
      content: `🙏 Demande de prière urgente: ${prayer.title}\n\n${prayer.content}`,
      imageUrl: null,
      videoUrl: null,
      createdAt: prayer.createdAt,
      hashtags: ["priere", "urgent"],
      generatedType: "CHURCH_PRAYER",
      generatedId: prayer.id,
      author: {
        id: prayer.user.id,
        name: prayer.user.name || "Anonyme",
      },
      church: prayer.church,
      comments: [],
      likeRelations: [],
      shares: [],
    }));

    // Merge posts and prayer posts, then sort by createdAt
    const allPosts = [...page, ...prayerPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const normalizedPosts = allPosts.map((post: any) => ({
      ...post,
      comments: [...(post.comments || [])].reverse(),
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

    const content = sanitizeText(body?.content?.trim() || "");

    const hashtags = [...content.matchAll(/#[a-zA-Z0-9_\u00C0-\u017F]+/g)].map(
      (m) => m[0].slice(1).toLowerCase()
    );

    // Support both old format (imageUrl/videoUrl) and new format (medias array)
    const imageUrl =
      typeof body?.imageUrl === "string" && body.imageUrl.trim() !== ""
        ? body.imageUrl.trim()
        : null;

    const videoUrl =
      typeof body?.videoUrl === "string" && body.videoUrl.trim() !== ""
        ? body.videoUrl.trim()
        : null;

    const medias = Array.isArray(body?.medias) ? body.medias : [];

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Le texte du post est trop long." },
        { status: 400 }
      );
    }

    if (imageUrl && videoUrl) {
      return NextResponse.json(
        { error: "Un post ne peut contenir qu'un seul média." },
        { status: 400 }
      );
    }

    // Moderation check before creating post
    const moderationCheck = await canPublishContent(
      { text: content, imageUrl, videoUrl },
      { userId, contentType: 'post' }
    );

    if (!moderationCheck.allowed) {
      return NextResponse.json(
        { 
          error: "Contenu non autorisé",
          moderationResult: moderationCheck.result,
          reason: moderationCheck.result.reasons.join(', ')
        },
        { status: 403 }
      );
    }

    // Validate medias array if provided
    if (medias.length > 0) {
      for (const media of medias) {
        if (!media.url || !media.type) {
          return NextResponse.json(
            { error: "Chaque média doit avoir une URL et un type." },
            { status: 400 }
          );
        }
        if (!["IMAGE", "VIDEO"].includes(media.type)) {
          return NextResponse.json(
            { error: "Type de média invalide. Doit être IMAGE ou VIDEO." },
            { status: 400 }
          );
        }
        try {
          const parsed = new URL(media.url);
          if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return NextResponse.json(
              { error: "URL média invalide." },
              { status: 400 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "URL média invalide." },
            { status: 400 }
          );
        }
      }
    }

    // Backward compatibility: validate old format if no medias provided
    if (medias.length === 0) {
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
    }

    if (!content && !imageUrl && !videoUrl && medias.length === 0) {
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

    // Create PostMedia entries if medias array is provided
    if (medias.length > 0) {
      for (const media of medias) {
        await prisma.postMedia.create({
          data: {
            postId: post.id,
            type: media.type,
            url: media.url,
            thumbnail: media.thumbnail || null,
            order: medias.indexOf(media),
          },
        });
      }
    }

    // Store media in gallery if image or video was uploaded (backward compatibility)
    if (imageUrl || videoUrl && medias.length === 0) {
      // Create or get "Posts" album
      let postsAlbum = await prisma.album.findFirst({
        where: {
          userId,
          type: "POST",
        },
      });

      if (!postsAlbum) {
        postsAlbum = await prisma.album.create({
          data: {
            userId,
            name: "Publications",
            type: "POST",
            visibility: "PUBLIC",
          },
        });
      }

      // Determine media type
      const mediaType = videoUrl ? "VIDEO" : "PHOTO";

      // Create media entry
      await prisma.media.create({
        data: {
          userId,
          albumId: postsAlbum.id,
          type: mediaType,
          url: imageUrl || videoUrl,
          thumbnail: null,
          caption: content || `Publication du ${new Date().toLocaleDateString("fr-FR")}`,
          visibility: "PUBLIC",
        },
      });
    }

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