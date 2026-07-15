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
}: {
  churchId: string;
  type: string;
  entityId: string;
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  tx?: PrismaTransactionClient; // optional transaction client
}) {
  const client = tx || prisma;

  // Check existing by generatedType/generatedId
  const existing = await client.churchPost.findFirst({
    where: {
      churchId,
      generatedType: type,
      generatedId: entityId,
    },
  });

  if (existing) return existing;

  const content = `${title}${summary ? `\n\n${summary}` : ""}`;

  const post = await client.churchPost.create({
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
      io.to(`church:${churchId}`).emit("post:created", post);
    }
  } catch (err) {
    // Do not block flow on socket errors
    console.error("Socket emit error for post:created:", err);
  }

  return post;
}
