import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { publishPrayerRequest } from "@/lib/feedPublisher";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const filter = searchParams.get("filter") || "recent"; // recent, popular, urgent, answered
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const churchId = searchParams.get("churchId");
  const skip = (page - 1) * limit;

  let orderBy: any = { createdAt: "desc" };
  const where: any = {};

  if (category && category !== "ALL") {
    where.category = category;
  }

  if (churchId) {
    where.churchId = churchId;
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
        church: { select: { id: true, name: true, slug: true } },
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

  const { searchParams } = new URL(req.url);
  const churchIdFromQuery = searchParams.get("churchId");

  const body = await req.json();
  const { title, content, category, isUrgent, churchId: churchIdFromBody, prayerChainId, prayerCampaignId } = body;

  const churchId = churchIdFromBody || churchIdFromQuery || null;

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
      churchId,
      prayerChainId: prayerChainId || null,
      prayerCampaignId: prayerCampaignId || null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      church: { select: { id: true, name: true, slug: true } },
      prayerChain: { select: { id: true, title: true } },
      prayerCampaign: { select: { id: true, title: true } },
      _count: { select: { reactions: true, responses: true, verses: true } },
    },
  });

  // Create notification for church members if church is associated
  if (churchId) {
    const churchMembers = await prisma.churchMember.findMany({
      where: { churchId },
      select: { userId: true },
    });

    for (const member of churchMembers) {
      if (member.userId !== session.user.id) {
        await createNotification({
          userId: member.userId,
          senderId: session.user.id,
          type: "PRAYER_REQUEST_CREATED",
          message: `${session.user.name || "Someone"} created a new prayer request`,
          entityId: prayer.id,
          entityType: "prayerRequest",
          metadata: { prayerRequestId: prayer.id, churchId },
        });
      }
    }

    // Publish to Feed if prayer is urgent and associated with a church
    if (prayer.isUrgent) {
      await publishPrayerRequest({
        prayerRequestId: prayer.id,
        churchId,
        authorId: session.user.id,
      });
    }
  }

  return NextResponse.json({ prayer }, { status: 201 });
}
