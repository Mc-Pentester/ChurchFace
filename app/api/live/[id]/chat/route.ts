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

  try {
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id },
    });

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // For now, return empty array since we don't have a chat message model yet
    // This would be implemented with Socket.IO for real-time chat
    return NextResponse.json({ messages: [] });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
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
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id },
    });

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // For now, just return success
    // This would be implemented with Socket.IO for real-time chat
    return NextResponse.json({
      success: true,
      message: "Chat message sent (Socket.IO implementation needed)",
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json(
      { error: "Failed to send chat message" },
      { status: 500 }
    );
  }
}
