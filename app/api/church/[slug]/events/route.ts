import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");

    const church = await prisma.church.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const events = await prisma.churchEvent.findMany({
      where: { 
        churchId: church.id,
        isPublic: true,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { startDate: "asc" },
      include: {
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (events.length > limit) {
      const nextItem = events.pop();
      nextCursor = nextItem!.id;
    }

    // Add isAttending if user is authenticated
    const eventsWithAttendance = await Promise.all(
      events.map(async (event: any) => {
        let isAttending = false;
        if (session?.user) {
          const attendee = await prisma.churchEventAttendee.findUnique({
            where: {
              eventId_userId: {
                eventId: event.id,
                userId: session.user.id,
              },
            },
          });
          isAttending = !!attendee;
        }
        return {
          ...event,
          isAttending,
        };
      })
    );

    return NextResponse.json({
      events: eventsWithAttendance,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching church events:", error);
    return NextResponse.json(
      { error: "Failed to fetch church events" },
      { status: 500 }
    );
  }
}
