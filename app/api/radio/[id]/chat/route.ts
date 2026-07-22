import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET - Récupérer les messages de chat d'une radio
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: radioId } = await params;

  try {
    const messages = await prisma.radioChatMessage.findMany({
      where: {
        radioId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching radio chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}

/**
 * POST - Envoyer un message de chat
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: radioId } = await params;
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const message = await prisma.radioChatMessage.create({
      data: {
        radioId,
        userId: session?.user?.id || null,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error creating radio chat message:", error);
    return NextResponse.json(
      { error: "Failed to create chat message" },
      { status: 500 }
    );
  }
}
