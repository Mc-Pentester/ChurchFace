import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // Fetch preachings (sermons) from the database
    const preachings = await prisma.preaching.findMany({
      where: {
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Transform to match Sermon interface expected by StudioSermons
    const sermons = preachings.map((preaching) => ({
      id: preaching.id,
      title: preaching.title,
      speaker: preaching.author?.name || "Unknown",
      date: preaching.createdAt,
      duration: preaching.duration || undefined,
      thumbnail: preaching.thumbnail || undefined,
      description: preaching.description || undefined,
    }));

    return NextResponse.json(sermons);
  } catch (error) {
    console.error("Error fetching sermons:", error);
    return NextResponse.json(
      { success: false, error: "Unable to fetch sermons" },
      { status: 500 }
    );
  }
}
