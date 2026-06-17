import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  try {
    const preaching = await prisma.preaching.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            church: true,
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
            _count: {
              select: {
                preachings: true,
              },
            },
          },
        },
        verses: true,
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

    if (!preaching) {
      return NextResponse.json({ error: "Preaching not found" }, { status: 404 });
    }

    // Add isLiked and isBookmarked if user is authenticated
    if (session?.user) {
      const [like, bookmark] = await Promise.all([
        prisma.preachingLike.findUnique({
          where: {
            preachingId_userId: {
              preachingId: id,
              userId: session.user.id,
            },
          },
        }),
        prisma.preachingBookmark.findUnique({
          where: {
            preachingId_userId: {
              preachingId: id,
              userId: session.user.id,
            },
          },
        }),
      ]);

      (preaching as any).isLiked = !!like;
      (preaching as any).isBookmarked = !!bookmark;
    }

    // Increment view count
    await prisma.preaching.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Record view if user is authenticated
    if (session?.user) {
      await prisma.preachingView.upsert({
        where: {
          preachingId_userId: {
            preachingId: id,
            userId: session.user.id,
          },
        },
        create: {
          preachingId: id,
          userId: session.user.id,
        },
        update: {
          watchedAt: new Date(),
        },
      });
    }

    return NextResponse.json(preaching);
  } catch (error) {
    console.error("Error fetching preaching:", error);
    return NextResponse.json(
      { error: "Failed to fetch preaching" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const preaching = await prisma.preaching.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!preaching) {
      return NextResponse.json({ error: "Preaching not found" }, { status: 404 });
    }

    if (preaching.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, thumbnail, categoryId, seriesId } = await req.json();

    const updated = await prisma.preaching.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(thumbnail && { thumbnail }),
        ...(categoryId && { categoryId }),
        ...(seriesId !== undefined && { seriesId }),
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
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating preaching:", error);
    return NextResponse.json(
      { error: "Failed to update preaching" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const preaching = await prisma.preaching.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!preaching) {
      return NextResponse.json({ error: "Preaching not found" }, { status: 404 });
    }

    if (preaching.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.preaching.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting preaching:", error);
    return NextResponse.json(
      { error: "Failed to delete preaching" },
      { status: 500 }
    );
  }
}
