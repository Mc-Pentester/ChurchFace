import { prisma } from "@/lib/prisma";
import { createPost } from "@/lib/services/posts";

export async function createEvent(input: { churchId: string; title: string; description?: string | null; startDate: string; endDate?: string | null; location?: string | null }) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.churchEvent.create({
      data: {
        churchId: input.churchId,
        title: input.title,
        description: input.description || null,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        location: input.location || null,
      },
      include: { _count: { select: { attendees: true } } },
    });

    // Create a post announcing the event (best-effort)
    try {
      await createPost({ churchId: input.churchId, content: `📅 Événement : ${event.title}` });
    } catch (err) {
      console.warn("createEvent: failed to create post for event", err);
    }

    return event;
  });
}
