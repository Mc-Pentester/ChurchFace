import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

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
    const reports = await prisma.report.findMany({
      where: { status: "PENDING" },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const userId = session.user.id;
    const { targetId, targetType, reason, description } = await req.json();

    if (!targetId || !targetType || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingReport = await prisma.report.findFirst({
      where: { reporterId: userId, targetId, targetType },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        targetId,
        targetType,
        reason,
        description:
          typeof description === "string" ? description.trim() : null,
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

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
