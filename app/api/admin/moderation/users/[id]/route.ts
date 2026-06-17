import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

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
      case "suspend":
        updateData = { isSuspended: true, suspendedAt: new Date() };
        adminAction = "suspend_user";
        break;
      case "unsuspend":
        updateData = { isSuspended: false, suspendedAt: null };
        adminAction = "reactivate_user";
        break;
      case "ban":
        updateData = { isBanned: true, bannedAt: new Date() };
        adminAction = "ban_user";
        break;
      case "unban":
        updateData = { isBanned: false, bannedAt: null };
        adminAction = "reactivate_user";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isSuspended: true,
        isBanned: true,
        suspendedAt: true,
        bannedAt: true,
      },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: adminAction,
        targetId: params.id,
        targetType: "user",
        details: {
          userId: params.id,
          email: user.email,
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error moderating user:", error);
    return NextResponse.json(
      { error: "Failed to moderate user" },
      { status: 500 }
    );
  }
}
