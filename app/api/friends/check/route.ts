import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: userId },
        { senderId: userId, receiverId: session.user.id },
      ],
    },
  });

  if (!friendship) {
    return NextResponse.json({ status: "NONE" });
  }

  const status = friendship.senderId === session.user.id
    ? friendship.status === "PENDING" ? "PENDING_SENT" : friendship.status
    : friendship.status === "PENDING" ? "PENDING_RECEIVED" : friendship.status;

  return NextResponse.json({ status, friendshipId: friendship.id });
}
