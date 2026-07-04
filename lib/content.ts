import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

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
  tx?: PrismaClient; // optional transaction client
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

  return post;
}
