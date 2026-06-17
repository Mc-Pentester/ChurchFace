import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
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
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const conversations = chats.map((chat: any) => {
      const otherMembers = chat.members.filter(
        (m: any) => m.userId !== session.user.id
      );
      const lastMessage = chat.messages[0];
      const unreadCount = chat.members.find(
        (m: any) => m.userId === session.user.id
      )?.lastSeen
        ? chat.messages.filter(
            (m: any) =>
              new Date(m.createdAt) >
              new Date(
                chat.members.find((m: any) => m.userId === session.user.id)!.lastSeen!
              )
          ).length
        : chat.messages.length;

      return {
        id: chat.id,
        isGroup: chat.isGroup,
        name: chat.isGroup ? chat.name : otherMembers[0]?.user?.name || "Inconnu",
        avatar: chat.isGroup ? null : otherMembers[0]?.user?.image,
        lastMessage: lastMessage?.content || "",
        lastMessageTime: lastMessage?.createdAt || chat.createdAt,
        unreadCount,
        isOnline: false,
        isTyping: chat.members.find(
          (m: any) => m.userId !== session.user.id
        )?.isTyping || false,
        members: chat.members,
      };
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, isGroup = false, name } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Check if conversation already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: {
              in: [session.user.id, userId],
            },
          },
        },
      },
    });

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    // Create new conversation
    const newChat = await prisma.chat.create({
      data: {
        isGroup,
        name: isGroup ? name : null,
        members: {
          create: [
            { userId: session.user.id },
            { userId },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(newChat);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
