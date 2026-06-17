import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

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
    const like = await prisma.preachingLike.create({
      data: {
        preachingId: id,
        userId: session.user.id,
      },
    });

    // Increment like count on preaching
    await prisma.preaching.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    console.error("Error liking preaching:", error);
    return NextResponse.json(
      { error: "Failed to like preaching" },
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
    await prisma.preachingLike.deleteMany({
      where: {
        preachingId: id,
        userId: session.user.id,
      },
    });

    // Decrement like count on preaching
    await prisma.preaching.update({
      where: { id },
      data: { likes: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking preaching:", error);
    return NextResponse.json(
      { error: "Failed to unlike preaching" },
      { status: 500 }
    );
  }
}
