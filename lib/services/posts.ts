import { prisma } from "@/lib/prisma";

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

  // Publish event on Redis / event-bus (consumer should emit to sockets)
  try {
    const { publishEvent } = await import("@/lib/io/publisher");
    publishEvent("post.created", { churchId, postId: post.id });
  } catch (err) {
    // If publishing fails, log but do not roll back the creation.
    console.warn("createPost: failed to publish event", err);
  }

  return post;
}
