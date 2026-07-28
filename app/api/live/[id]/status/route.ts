import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * =========================
 * UPDATE LIVE STATUS
 * =========================
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["LIVE", "OFFLINE", "SCHEDULED"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    // Find the LiveBroadcast
    const liveBroadcast = await prisma.liveBroadcast.findUnique({
      where: { id },
      include: {
        churchLives: true,
      },
    });

    if (!liveBroadcast) {
      return NextResponse.json({ error: "LiveBroadcast non trouvé" }, { status: 404 });
    }

    // Check if user is admin of the church
    const churchLive = liveBroadcast.churchLives[0];
    if (!churchLive) {
      return NextResponse.json({ error: "ChurchLive non trouvé" }, { status: 404 });
    }

    const isAdmin = await prisma.churchAdmin.findFirst({
      where: {
        churchId: churchLive.churchId,
        userId,
      },
    });

    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Update LiveBroadcast status
    const updatedBroadcast = await prisma.liveBroadcast.update({
      where: { id },
      data: {
        status,
        startedAt: status === "LIVE" ? new Date() : liveBroadcast.startedAt,
        endedAt: status === "OFFLINE" ? new Date() : liveBroadcast.endedAt,
      },
    });

    // Update ChurchLive status
    const updatedChurchLive = await prisma.churchLive.update({
      where: { id: churchLive.id },
      data: {
        status,
        startedAt: status === "LIVE" ? new Date() : churchLive.startedAt,
        endedAt: status === "OFFLINE" ? new Date() : churchLive.endedAt,
      },
    });

    // Create or update Post for live stream when status changes to LIVE
    if (status === "LIVE") {
      // Check if a post already exists for this live
      const existingPost = await prisma.post.findFirst({
        where: {
          generatedType: "CHURCH_LIVE",
          generatedId: churchLive.id,
        },
      });

      if (!existingPost) {
        // Create a new post for the live stream
        await prisma.post.create({
          data: {
            content: `🔴 En direct : ${updatedBroadcast.title}`,
            churchId: churchLive.churchId,
            generatedType: "CHURCH_LIVE",
            generatedId: churchLive.id,
            authorId: userId,
            hashtags: ["live", "direct"],
          },
        });
      } else {
        // Update existing post to make it visible
        await prisma.post.update({
          where: { id: existingPost.id },
          data: {
            isHidden: false,
            content: `🔴 En direct : ${updatedBroadcast.title}`,
            createdAt: new Date(), // Bump to top of feed
          },
        });
      }
    } else if (status === "OFFLINE") {
      // Hide the post when live ends
      const existingPost = await prisma.post.findFirst({
        where: {
          generatedType: "CHURCH_LIVE",
          generatedId: churchLive.id,
        },
      });

      if (existingPost) {
        await prisma.post.update({
          where: { id: existingPost.id },
          data: {
            isHidden: true,
            content: existingPost.content?.replace("🔴 En direct", "📺 Replay") || "📺 Replay",
          },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      liveBroadcast: updatedBroadcast,
      churchLive: updatedChurchLive 
    });
  } catch (error) {
    console.error("UPDATE LIVE STATUS ERROR:", error);
    return NextResponse.json(
      { error: "Erreur mise à jour statut live" },
      { status: 500 }
    );
  }
}
