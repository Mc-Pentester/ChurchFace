import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPostForEntity } from "@/lib/content";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, startDate, endDate, location, maxAttendees, churchId } = body;

    if (!title || !startDate || !churchId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user is member of the church
    const churchMember = await prisma.churchMember.findFirst({
      where: {
        churchId,
        userId: session.user.id,
      },
    });

    const churchAdmin = await prisma.churchAdmin.findUnique({
      where: {
        churchId_userId: {
          churchId,
          userId: session.user.id,
        },
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const hasAccess = churchMember || churchAdmin || currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const event = await prisma.churchEvent.create({
      data: {
        churchId,
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
      },
      include: {
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    // Create a ChurchPost for this event (idempotent)
    try {
      await createPostForEntity({
        churchId,
        type: "event",
        entityId: event.id,
        title: `📅 Événement : ${event.title}`,
        summary: event.description || null,
      });
    } catch (err) {
      console.error("Failed to create post for event:", err);
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
