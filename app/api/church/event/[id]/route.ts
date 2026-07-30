import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { userHasChurchRole } from "@/lib/church-perms";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, startDate, endDate, location, imageUrl, isPublic } = body;

    // Get event to verify church
    const event = await prisma.churchEvent.findUnique({
      where: { id },
      select: { churchId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check permissions
    const hasAccess = await userHasChurchRole(
      event.churchId,
      session.user.id,
      ["CHURCH_OWNER", "CHURCH_ADMIN", "PASTOR", "ADMIN"]
    );

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update event
    const updatedEvent = await prisma.churchEvent.update({
      where: { id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        location,
        imageUrl,
        isPublic,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get event to verify church
    const event = await prisma.churchEvent.findUnique({
      where: { id },
      select: { churchId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check permissions
    const hasAccess = await userHasChurchRole(
      event.churchId,
      session.user.id,
      ["CHURCH_OWNER", "CHURCH_ADMIN", "PASTOR", "ADMIN"]
    );

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete event (cascade will delete attendees and related posts)
    await prisma.churchEvent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
