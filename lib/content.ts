import { prisma } from "@/lib/prisma";
import { getSocketServer } from "@/lib/io";
import type { PrismaClient } from "@prisma/client";

type PrismaTransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function createPostForEntity({
  churchId,
  type,
  entityId,
  title,
  summary,
  imageUrl,
  videoUrl,
  tx,
  authorId,
}: {
  churchId: string;
  type: string;
  entityId: string;
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  tx?: PrismaTransactionClient; // optional transaction client
  authorId?: string; // optional author ID for global post
}) {
  const client = tx || prisma;

  // Check existing ChurchPost by generatedType/generatedId
  const existingChurchPost = await client.churchPost.findFirst({
    where: {
      churchId,
      generatedType: type,
      generatedId: entityId,
    },
  });

  const content = `${title}${summary ? `\n\n${summary}` : ""}`;

  // Create or return existing ChurchPost
  let churchPost;
  if (!existingChurchPost) {
    churchPost = await client.churchPost.create({
      data: {
        churchId,
        content,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        generated: true,
        generatedType: type,
        generatedId: entityId,
      },
    });

    // Emit socket event if socket server is available.
    // Scope strictly to the church room so posts are not broadcast to other churches.
    try {
      const io = getSocketServer();
      if (io) {
        io.to(`church:${churchId}`).emit("post:created", churchPost);
      }
    } catch (err) {
      // Do not block flow on socket errors
      console.error("Socket emit error for post:created:", err);
    }
  } else {
    churchPost = existingChurchPost;
  }

  // Create global Post for main feed if authorId is provided
  if (authorId) {
    const existingGlobalPost = await client.post.findFirst({
      where: {
        churchId,
        generatedType: type,
        generatedId: entityId,
      },
    });

    if (!existingGlobalPost) {
      await client.post.create({
        data: {
          content,
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null,
          churchId,
          generatedType: type,
          generatedId: entityId,
          authorId,
        },
      });
    }
  }

  return churchPost;
}
