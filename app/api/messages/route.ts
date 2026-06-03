import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json([], { status: 401 });
  }

  const globalChat = await prisma.chat.findFirst({
    where: { isGroup: true, name: "Chat Global" },
  });

  if (!globalChat) {
    return NextResponse.json([]);
  }

  const messages = await prisma.message.findMany({
    where: { chatId: globalChat.id },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      sender: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json(
    messages.reverse().map((message) => ({
      id: message.id,
      user: message.sender?.name || "Utilisateur",
      userId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
    }))
  );
}
