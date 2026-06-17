import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.churchEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isPublic) {
      return NextResponse.json(
        { error: "This event is not public" },
        { status: 403 }
      );
    }

    // Check if already attending
    const existingAttendee = await prisma.churchEventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    });

    if (existingAttendee) {
      // Cancel attendance
      await prisma.churchEventAttendee.delete({
        where: {
          eventId_userId: {
            eventId,
            userId: session.user.id,
          },
        },
      });

      // Decrement attendee count
      await prisma.churchEvent.update({
        where: { id: eventId },
        data: {
          attendeeCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ attending: false });
    } else {
      // Join event
      await prisma.churchEventAttendee.create({
        data: {
          eventId,
          userId: session.user.id,
        },
      });

      // Increment attendee count
      await prisma.churchEvent.update({
        where: { id: eventId },
        data: {
          attendeeCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ attending: true });
    }
  } catch (error) {
    console.error("Error toggling event attendance:", error);
    return NextResponse.json(
      { error: "Failed to toggle attendance" },
      { status: 500 }
    );
  }
}
