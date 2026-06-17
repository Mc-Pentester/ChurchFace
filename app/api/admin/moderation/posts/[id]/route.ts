import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { action } = await req.json();

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    let updateData: any = {};
    let adminAction: string = "";

    switch (action) {
      case "hide":
        updateData = { isHidden: true };
        adminAction = "hide_post";
        break;
      case "unhide":
        updateData = { isHidden: false };
        adminAction = "restore_post";
        break;
      case "pin":
        updateData = { isPinned: true };
        adminAction = "pin_post";
        break;
      case "unpin":
        updateData = { isPinned: false };
        adminAction = "unpin_post";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: adminAction,
        targetId: params.id,
        targetType: "post",
        details: {
          postId: params.id,
          authorId: post.authorId,
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error moderating post:", error);
    return NextResponse.json(
      { error: "Failed to moderate post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const post = await prisma.post.delete({
      where: { id },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "delete_post",
        targetId: id,
        targetType: "post",
        details: {
          postId: id,
          authorId: post.authorId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
