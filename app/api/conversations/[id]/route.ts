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
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
                church: true,
                city: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Check if user is a member
    const isMember = chat.members.some((m) => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update last seen
    await prisma.chatMember.update({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId: id,
        },
      },
      data: {
        lastSeen: new Date(),
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Check if user is a member
    const isMember = chat.members.some((m) => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove user from conversation
    await prisma.chatMember.delete({
      where: {
        userId_chatId: {
          userId: session.user.id,
          chatId: id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving conversation:", error);
    return NextResponse.json(
      { error: "Failed to leave conversation" },
      { status: 500 }
    );
  }
}
