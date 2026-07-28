import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const story = await prisma.story.findUnique({
    where: {
      id: id,
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
    },
  });

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  return NextResponse.json(story);
}