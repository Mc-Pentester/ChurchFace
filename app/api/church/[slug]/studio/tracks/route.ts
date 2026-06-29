import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET - Récupérer les tracks pour une église
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

    const isAdmin = church.admins.some(admin => admin.userId === session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Récupérer les tracks associés à cette église
    const tracks = await prisma.playlistItem.findMany({
      where: {
        playlist: {
          churchId: church.id,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Error fetching church studio tracks:", error);
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 });
  }
}

/**
 * POST - Créer un nouveau track pour une église
 */
export async function POST(
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

    const isAdmin = church.admins.some(admin => admin.userId === session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const track = await prisma.playlistItem.create({
      data: {
        title: body.title || "Sans titre",
        url: body.url,
        duration: body.duration || 0,
        type: body.type || "AUDIO",
        playlistId: body.playlistId,
      },
    });

    return NextResponse.json({ track });
  } catch (error) {
    console.error("Error creating church studio track:", error);
    return NextResponse.json({ error: "Failed to create track" }, { status: 500 });
  }
}
