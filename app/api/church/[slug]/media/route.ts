import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");
    const type = searchParams.get("type"); // IMAGE, VIDEO, ALBUM

    const church = await prisma.church.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const media = await prisma.churchMedia.findMany({
      where: { 
        churchId: church.id,
        ...(type && { type }),
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { order: "asc" },
    });

    let nextCursor: string | null = null;
    if (media.length > limit) {
      const nextItem = media.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      media,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching church media:", error);
    return NextResponse.json(
      { error: "Failed to fetch church media" },
      { status: 500 }
    );
  }
}
