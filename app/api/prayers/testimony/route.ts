import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
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
    select: { userId: true },
  });

  if (!prayer) return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  return NextResponse.json({ testimony, prayer: updated }, { status: 201 });
}
