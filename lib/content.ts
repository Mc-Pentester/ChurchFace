import { prisma } from "@/lib/prisma";

export async function createPostForEntity({
  churchId,
  type,
  entityId,
  title,
  summary,
  imageUrl,
  videoUrl,
}: {
  churchId: string;
  type: string;
  entityId: string;
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
}) {
  // marker used to detect existing generated post for the same entity
  const marker = `__${type}:${entityId}__`;

  const existing = await prisma.churchPost.findFirst({
    where: {
      churchId,
      content: {
        contains: marker,
      },
    },
  });

  if (existing) return existing;

  const content = `${title}${summary ? `\n\n${summary}` : ""}\n\n${marker}`;

  const post = await prisma.churchPost.create({
    data: {
      churchId,
      content,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
    },
  });

  return post;
}
