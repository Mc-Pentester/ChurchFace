import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { publishPrayerTestimony } from "@/lib/feedPublisher";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { prayerRequestId, content, imageUrl } = body;

  if (!prayerRequestId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const prayer = await prisma.prayerRequest.findUnique({
    where: { id: prayerRequestId },
    select: { userId: true, churchId: true },
  });

  if (!prayer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const decision = await authorize({ actorId: session.user.id, action: "PRAYER_TESTIMONY_CREATE", resourceId: prayerRequestId });
  if (decision.decision !== "ALLOW") {
    return NextResponse.json({ error: "Forbidden" }, { status: decision.status });
  }
  if (prayer.userId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can add a testimony" }, { status: 403 });
  }

  const [testimony, updated] = await prisma.$transaction([
    prisma.prayerTestimony.create({
      data: {
        prayerRequestId,
        userId: session.user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.prayerRequest.update({
      where: { id: prayerRequestId },
      data: { isAnswered: true },
    }),
  ]);

  // Create notifications for users who prayed for this prayer
  const prayers = await prisma.prayerEngagement.findMany({
    where: { prayerRequestId },
    select: { userId: true },
  });

  for (const prayer of prayers) {
    if (prayer.userId !== session.user.id) {
      await createNotification({
        userId: prayer.userId,
        senderId: session.user.id,
        type: "PRAYER_ANSWERED",
        message: `${session.user.name || "Someone"} marked a prayer you prayed for as answered`,
        entityId: testimony.id,
        entityType: "prayerTestimony",
        metadata: { prayerRequestId, testimonyId: testimony.id },
      });
    }
  }

  // Publish to Feed if prayer is associated with a church
  if (prayer.churchId) {
    await publishPrayerTestimony({
      prayerRequestId,
      churchId: prayer.churchId,
      authorId: session.user.id,
    });
  }

  return NextResponse.json({ testimony, prayer: updated }, { status: 201 });
}
