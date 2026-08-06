import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPostForEntity } from "@/lib/content";

export const runtime = "nodejs";

const liveBroadcastInclude = {
  author: { select: { id: true, name: true, image: true } },
};

/**
 * GET - Récupérer ou créer la diffusion live pour une église
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Vérifier si l'utilisateur a le rôle ADMIN global
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin role required" }, { status: 403 });
  }

  try {
    const church = await prisma.church.findUnique({
      where: { slug },
      include: {
        admins: true,
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    let churchLive = await prisma.churchLive.findFirst({
      where: { churchId: church.id },
      orderBy: { createdAt: "desc" },
      include: {
        broadcast: true,
      },
    });

    if (!churchLive) {
      // Créer ChurchLive et LiveBroadcast
      const broadcast = await prisma.liveBroadcast.create({
        data: {
          title: `${church.name} Live`,
          streamUrl: "",
          status: "OFFLINE",
          authorId: session.user.id,
        },
      });

      churchLive = await prisma.churchLive.create({
        data: {
          churchId: church.id,
          title: `${church.name} Live`,
          status: "OFFLINE",
          liveBroadcastId: broadcast.id,
        },
        include: {
          broadcast: true,
        },
      });
    } else if (!churchLive.broadcast) {
      // Créer LiveBroadcast si manquant
      const broadcast = await prisma.liveBroadcast.create({
        data: {
          title: churchLive.title || `${church.name} Live`,
          streamUrl: churchLive.streamUrl || "",
          status: churchLive.status || "OFFLINE",
          authorId: session.user.id,
        },
      });

      churchLive = await prisma.churchLive.update({
        where: { id: churchLive.id },
        data: { liveBroadcastId: broadcast.id },
        include: {
          broadcast: true,
        },
      });
    }

    return NextResponse.json({ churchLive, liveBroadcast: churchLive.broadcast });
  } catch (error) {
    console.error("Error fetching church studio live:", error);
    return NextResponse.json({ error: "Failed to fetch church live" }, { status: 500 });
  }
}

/**
 * PATCH - Mettre à jour la diffusion live de l'église
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Vérifier si l'utilisateur a le rôle ADMIN global
  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin role required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const church = await prisma.church.findUnique({
      where: { slug },
      include: {
        admins: true,
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Use transaction to update ChurchLive and create post atomically
    const result = await prisma.$transaction(async (tx) => {
      const churchLive = await tx.churchLive.update({
        where: { id: body.id },
        data: {
          status: body.status,
          ...(body.streamUrl !== undefined && { streamUrl: body.streamUrl }),
          ...(body.playUrl !== undefined && { playUrl: body.playUrl }),
          ...(body.streamMode !== undefined && { streamMode: body.streamMode }),
          ...(body.startedAt !== undefined && { startedAt: body.startedAt }),
          ...(body.endedAt !== undefined && { endedAt: body.endedAt }),
          ...(body.viewerCount !== undefined && { viewerCount: body.viewerCount }),
        },
      });

      // If the live has just started, create a post for it (idempotent)
      try {
        if (body.status === "LIVE") {
          await createPostForEntity({
            churchId: church.id,
            type: "live",
            entityId: churchLive.id,
            title: `🔴 En direct : ${churchLive.title}`,
            summary: churchLive.title || null,
            videoUrl: churchLive.playUrl || churchLive.streamUrl || null,
            tx,
            authorId: session.user.id,
          });
        }
      } catch (err) {
        console.error("Failed to create post for live:", err);
      }

      return churchLive;
    });

    return NextResponse.json({ churchLive: result, liveBroadcast: null });
  } catch (error) {
    console.error("Error updating church studio live:", error);
    return NextResponse.json({ error: "Failed to update church live" }, { status: 500 });
  }
}
