import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userHasChurchRole } from "@/lib/church-perms";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, imageUrl, videoUrl, churchId } = body;

    if (!content || !churchId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hasAccess = await userHasChurchRole(churchId, session.user.id, ["CHURCH_OWNER", "CHURCH_ADMIN", "PASTOR", "ADMIN"]);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const post = await prisma.churchPost.create({
      data: {
        churchId,
        content,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
