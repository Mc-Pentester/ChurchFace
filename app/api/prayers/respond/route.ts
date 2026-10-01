import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { prayerRequestId, content, type = "COMMENT" } = body;

  if (!prayerRequestId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const decision = await authorize({ actorId: session.user.id, action: "PRAYER_RESPOND", resourceId: prayerRequestId });
  if (decision.decision !== "ALLOW") {
    return NextResponse.json({ error: "Forbidden" }, { status: decision.status });
  }

  // Get prayer request to notify author
  const prayerRequest = await prisma.prayerRequest.findUnique({
    where: { id: prayerRequestId },
    select: { userId: true, churchId: true },
  });

  const response = await prisma.prayerResponse.create({
    data: {
      prayerRequestId,
      userId: session.user.id,
      content: content.trim(),
      type,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  // Create notification for prayer author if not self-response
  if (prayerRequest && prayerRequest.userId !== session.user.id) {
    await createNotification({
      userId: prayerRequest.userId,
      senderId: session.user.id,
      type: "PRAYER_RESPONSE",
      message: "Someone responded to your prayer request",
      entityId: prayerRequestId,
      entityType: "prayer",
      metadata: { churchId: prayerRequest.churchId },
    });
  }

  return NextResponse.json({ response }, { status: 201 });
}
