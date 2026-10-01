import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  const { id } = await params;

  const authorization = await authorize({
    actorId: userId,
    action: "GLOBAL_ADMIN",
  });

  if (authorization.status !== 200) {
    return NextResponse.json(
      { error: authorization.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: authorization.status }
    );
  }

  try {
    const { status, action } = await req.json();

    if (!status || !["RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
      },
      include: {
        reporter: {
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
        adminId: userId!,
        action: action || (status === "RESOLVED" ? "resolve_report" : "dismiss_report"),
        details: JSON.stringify({
          targetId: id,
          targetType: "report",
          reportId: id,
          reportTargetType: report.targetType,
          reason: report.reason,
        }),
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
