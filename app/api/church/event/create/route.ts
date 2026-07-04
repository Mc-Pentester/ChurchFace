import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPostForEntity } from "@/lib/content";
import { userHasChurchRole } from "@/lib/church-perms";

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

    const hasAccess = await userHasChurchRole(churchId, session.user.id, ["CHURCH_OWNER", "CHURCH_ADMIN", "ADMIN"]);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create event and post atomically in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.churchEvent.create({
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

      try {
        await createPostForEntity({
          churchId,
          type: "event",
          entityId: event.id,
          title: `📅 Événement : ${event.title}`,
          summary: event.description || null,
          tx,
        });
      } catch (err) {
        console.error("Failed to create post for event:", err);
        // do not rollback the event creation because post creation failure should not block the event
      }

      return event;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
