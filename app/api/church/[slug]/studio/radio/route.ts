import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPostForEntity } from "@/lib/content";

export const runtime = "nodejs";

const radioInclude = {
  user: { select: { id: true, name: true, image: true } },
  playlist: { include: { items: { orderBy: { order: "asc" as const } } } },
};

/**
 * GET - Récupérer ou créer la radio studio pour une église
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

    // Vérifier si l'utilisateur est admin de l'église
    const isAdmin = church.admins.some(admin => admin.userId === session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let churchRadio = await prisma.churchRadio.findFirst({
      where: { churchId: church.id },
      orderBy: { createdAt: "desc" },
    });

    let radio = null;

    if (!churchRadio) {
      // Créer une playlist par défaut
      const playlist = await prisma.churchPlaylist.create({
  data: {
    title: `${church.name} — Playlist`,
    description: "Playlist par défaut du studio de l'église",

    church: {
      connect: {
        id: church.id,
      },
    },
  },
});

      // Créer une Radio liée à l'église
      radio = await prisma.radio.create({
        data: {
          title: `${church.name} Radio`,
          description: `Émission radio de ${church.name}`,
          userId: session.user.id,
          isLive: false,
          playlistId: playlist.id,
        },
        include: radioInclude,
      });

      // Créer ChurchRadio liée à Radio
      churchRadio = await prisma.churchRadio.create({
        data: {
          churchId: church.id,
          radioId: radio.id,
          name: `${church.name} Radio`,
          isActive: true,
        },
      });
    } else if (churchRadio.radioId) {
      // Récupérer la Radio liée
      radio = await prisma.radio.findUnique({
        where: { id: churchRadio.radioId },
        include: radioInclude,
      });
    }

    return NextResponse.json({ churchRadio, radio });
  } catch (error) {
    console.error("Error fetching church studio radio:", error);
    return NextResponse.json({ error: "Failed to fetch church radio" }, { status: 500 });
  }
}

/**
 * PATCH - Mettre à jour la radio studio de l'église
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

    // Vérifier si l'utilisateur est admin de l'église
    const isAdmin = church.admins.some(admin => admin.userId === session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use transaction to update radio and create post when starting
    const result = await prisma.$transaction(async (tx) => {
      const churchRadio = await tx.churchRadio.update({
        where: { id: body.id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.streamUrl !== undefined && { streamUrl: body.streamUrl }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
      });

      let radio = null;
      if (body.radioId) {
        radio = await tx.radio.update({
          where: { id: body.radioId },
          data: {
            ...(body.title !== undefined && { title: body.title }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.playlistId !== undefined && { playlistId: body.playlistId }),
            ...(body.isLive !== undefined && { isLive: body.isLive }),
            ...(body.isAutoDJ !== undefined && { isAutoDJ: body.isAutoDJ }),
            ...(body.currentTrackId !== undefined && { currentTrackId: body.currentTrackId }),
            ...(body.startedAt !== undefined && { startedAt: body.startedAt }),
            ...(body.endedAt !== undefined && { endedAt: body.endedAt }),
          },
          include: radioInclude,
        });

        // If the radio has just started broadcasting, create a post
        try {
          if (body.isLive) {
            await createPostForEntity({
              churchId: church.id,
              type: "radio",
              entityId: radio.id,
              title: `📻 Radio en direct : ${radio.title}`,
              summary: radio.description || null,
              videoUrl: (radio as any).streamUrl || null,
              tx,
            });
          }
        } catch (err) {
          console.error("Failed to create post for radio:", err);
        }
      }

      return { churchRadio, radio };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating church studio radio:", error);
    return NextResponse.json({ error: "Failed to update church radio" }, { status: 500 });
  }
}
