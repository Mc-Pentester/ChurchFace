import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { prayerRequestId, reference, text } = body;

  if (!prayerRequestId || !reference?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const decision = await authorize({ actorId: session.user.id, action: "PRAYER_VERSE_CREATE", resourceId: prayerRequestId });
  if (decision.decision !== "ALLOW") {
    return NextResponse.json({ error: "Forbidden" }, { status: decision.status });
  }

  const verse = await prisma.prayerVerse.create({
    data: {
      prayerRequestId,
      userId: session.user.id,
      reference: reference.trim(),
      text: text?.trim() || null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({ verse }, { status: 201 });
}
