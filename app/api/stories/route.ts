import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur stories" },
      { status: 500 }
    );
  }
}