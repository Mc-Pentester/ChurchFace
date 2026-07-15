import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const filter = searchParams.get("filter") || "recent"; // recent, popular, urgent, answered
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  let orderBy: any = { createdAt: "desc" };
  const where: any = {};

  if (category && category !== "ALL") {
    where.category = category;
  }

  switch (filter) {
    case "urgent":
      where.isUrgent = true;
      where.isAnswered = false;
      break;
    case "answered":
      where.isAnswered = true;
      break;
    case "popular":
      orderBy = { reactions: { _count: "desc" } };
      break;
  }

  const [prayers, total] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { reactions: true, responses: true, verses: true } },
        reactions: {
          take: 3,
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        testimony: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    }),
    prisma.prayerRequest.count({ where }),
  ]);

  return NextResponse.json({ prayers, total, page, limit });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, category, isUrgent } = body;

  if (!title?.trim() || !content?.trim() || !category) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const prayer = await prisma.prayerRequest.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      category,
      isUrgent: !!isUrgent,
      userId: session.user.id,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { reactions: true, responses: true, verses: true } },
    },
  });

  return NextResponse.json({ prayer }, { status: 201 });
}
