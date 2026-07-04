import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
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
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { content, imageUrl } = body;

    if (!content?.trim() && !imageUrl?.trim()) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    const story = await prisma.story.create({
      data: {
        content: content || null,
        imageUrl: imageUrl || null,
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

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("CREATE STORY ERROR:", error);
    return NextResponse.json({ error: "Erreur création story" }, { status: 500 });
  }
}
