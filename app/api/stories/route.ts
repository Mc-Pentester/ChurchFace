import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canPublishContent } from "@/lib/moderation/ModerationService";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const stories = await prisma.story.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
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
      views: userId ? {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      } : false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group stories by author and determine viewed state
  const groupedStories = stories.reduce((acc: any, story) => {
    const authorId = story.authorId;
    
    if (!acc[authorId]) {
      acc[authorId] = {
        author: story.author,
        stories: [],
        hasUnviewed: false,
      };
    }
    
    const isViewed = userId && story.views && story.views.length > 0;
    acc[authorId].stories.push({
      ...story,
      isViewed: isViewed,
    });
    
    if (!isViewed) {
      acc[authorId].hasUnviewed = true;
    }
    
    return acc;
  }, {});

  // Convert to array and sort: user's stories first, then unseen, then viewed
  const storyGroups = Object.values(groupedStories).sort((a: any, b: any) => {
    // Current user's stories first
    if (userId && a.author.id === userId && b.author.id !== userId) return -1;
    if (userId && a.author.id !== userId && b.author.id === userId) return 1;
    
    // Unseen before viewed
    if (a.hasUnviewed && !b.hasUnviewed) return -1;
    if (!a.hasUnviewed && b.hasUnviewed) return 1;
    
    // Then by most recent
    const aLatest = a.stories[0]?.createdAt || new Date(0);
    const bLatest = b.stories[0]?.createdAt || new Date(0);
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });

  return NextResponse.json(storyGroups);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    console.log("POST /api/stories body:", body);
    
    const { content, imageUrl, videoUrl, mediaUrl, mediaType } = body;

    if (!content?.trim() && !imageUrl?.trim() && !videoUrl?.trim() && !mediaUrl?.trim()) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    // Use client-provided mediaType if available, otherwise try server-side detection
    let finalImageUrl = imageUrl;
    let finalVideoUrl = videoUrl;
    
    if (mediaUrl && !imageUrl && !videoUrl) {
      if (mediaType === 'video') {
        finalVideoUrl = mediaUrl;
      } else if (mediaType === 'image') {
        finalImageUrl = mediaUrl;
      } else {
        // Fallback to server-side detection
        const isVideo = mediaUrl.match(/\.(mp4|webm|mov|avi|mkv)$/i);
        console.log("Server-side video detection fallback:", isVideo, "for URL:", mediaUrl);
        if (isVideo) {
          finalVideoUrl = mediaUrl;
        } else {
          finalImageUrl = mediaUrl;
        }
      }
    }

    console.log("Final values - imageUrl:", finalImageUrl, "videoUrl:", finalVideoUrl);

    // Moderation check before creating story
    const moderationCheck = await canPublishContent(
      { text: content, imageUrl: finalImageUrl, videoUrl: finalVideoUrl },
      { userId, contentType: 'story' }
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

    const story = await prisma.story.create({
      data: {
        content: content || null,
        imageUrl: finalImageUrl || null,
        videoUrl: finalVideoUrl || null,
        author: {
          connect: {
            id: userId,
          },
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    console.log("Created story:", story);
    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("CREATE STORY ERROR:", error);
    return NextResponse.json({ error: "Erreur création story" }, { status: 500 });
  }
}
