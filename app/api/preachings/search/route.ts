import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const preachings = await prisma.preaching.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { verses: { some: { text: { contains: query, mode: "insensitive" } } } },
        ],
      },
      take: limit,
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
        _count: {
          select: {
            preachingViews: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({ preachings });
  } catch (error) {
    console.error("Error searching preachings:", error);
    return NextResponse.json(
      { error: "Failed to search preachings" },
      { status: 500 }
    );
  }
}
