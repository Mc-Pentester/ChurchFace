import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isMember = chat.members.some((m) => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: params.id,
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isMember = chat.members.some((m) => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        chatId: params.id,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        seenBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Update chat's createdAt to move it to top
    await prisma.chat.update({
      where: { id },
      data: { createdAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
