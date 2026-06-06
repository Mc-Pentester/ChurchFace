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
  const { prayerRequestId, reference, text } = body;

  if (!prayerRequestId || !reference?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
