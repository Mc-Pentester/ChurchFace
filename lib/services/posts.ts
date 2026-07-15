import { prisma } from "@/lib/prisma";
import { getSocketServer } from "@/lib/io";

export async function createPost({ churchId, content, imageUrl = null, videoUrl = null }: { churchId: string; content: string; imageUrl?: string | null; videoUrl?: string | null }) {
  // Lightweight service that creates a church post. Keep idempotence to caller.
  const post = await prisma.churchPost.create({
    data: {
      churchId,
      content,
      imageUrl,
      videoUrl,
    },
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  // Emit realtime event to the church room (best-effort, scoped to the church).
  try {
    const io = getSocketServer();
    if (io) {
      io.to(`church:${churchId}`).emit("post:created", post);
    }
  } catch (err) {
    // If emitting fails, log but do not roll back the creation.
    console.warn("createPost: failed to emit post:created", err);
  }

  return post;
}
