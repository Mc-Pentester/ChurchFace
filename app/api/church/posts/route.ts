import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    const posts = await prisma.post.findMany({
      where: { 
        churchId,
        isHidden: false,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: "desc" },
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

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    // Add isLiked if user is authenticated
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post: any) => {
        let isLiked = false;
        if (session?.user) {
          const like = await prisma.like.findUnique({
            where: {
              postId_userId: {
                postId: post.id,
                userId: session.user.id,
              },
            },
          });
          isLiked = !!like;
        }
        return {
          ...post,
          comments: [...post.comments].reverse(),
          isLiked,
        };
      })
    );

    return NextResponse.json({
      posts: postsWithLikeStatus,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching church posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch church posts" },
      { status: 500 }
    );
  }
}
