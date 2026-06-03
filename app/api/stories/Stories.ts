import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export async function GET() {
  const now = new Date();

  const stories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: now },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(stories);
}