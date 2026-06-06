import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const chains = await prisma.prayerChain.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      _count: { select: { links: true } },
      links: {
        take: 5,
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });
  return NextResponse.json({ chains });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action, chainId, prayerRequestId, title, description, message } = body;

  if (action === "create") {
    if (!title?.trim()) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }
    const chain = await prisma.prayerChain.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        prayerRequestId: prayerRequestId || null,
      },
      include: {
        _count: { select: { links: true } },
        links: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });
    return NextResponse.json({ chain }, { status: 201 });
  }

  if (action === "join") {
    if (!chainId) return NextResponse.json({ error: "Missing chainId" }, { status: 400 });

    const existing = await prisma.prayerChainLink.findUnique({
      where: { chainId_userId: { chainId, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already joined" }, { status: 409 });
    }

    const link = await prisma.prayerChainLink.create({
      data: {
        chainId,
        userId: session.user.id,
        message: message?.trim() || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        chain: {
          include: {
            _count: { select: { links: true } },
            links: {
              take: 5,
              orderBy: { createdAt: "asc" },
              include: { user: { select: { id: true, name: true, image: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
