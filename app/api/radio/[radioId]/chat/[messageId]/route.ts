import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * DELETE /api/radio/:id/chat/:messageId — Supprimer un message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { radioId, messageId } = await params;

    const message = await prisma.radioChatMessage.update({
      where: { id: messageId, radioId },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("RADIO CHAT DELETE ERROR:", error);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}

/**
 * POST /api/radio/:id/chat/:messageId — Épingler un message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { radioId, messageId } = await params;
    const body = await req.json();

    const message = await prisma.radioChatMessage.update({
      where: { id: messageId, radioId },
      data: { isPinned: body?.pinned ?? true },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("RADIO CHAT PIN ERROR:", error);
    return NextResponse.json({ error: "Erreur épinglage" }, { status: 500 });
  }
}
