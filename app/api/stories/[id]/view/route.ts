import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return Response.json({}, { status: 401 });

  await prisma.storyView.upsert({
    where: {
      storyId_userId: {
        storyId: (await params).id,
        userId: session.user.id,
      },
    },

    create: {
      storyId: (await params).id,
      userId: session.user.id,
    },

    update: {},
  });

  return Response.json({ success: true });
}