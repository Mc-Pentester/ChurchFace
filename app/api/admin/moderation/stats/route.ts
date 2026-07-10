import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [
      pendingReports,
      suspendedUsers,
    ] = await Promise.all([
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { suspendedAt: { not: null } } }),
    ]);

    const reportedPosts = await prisma.report.count({
      where: { targetType: "post", status: "PENDING" },
    });

    const reportedComments = await prisma.report.count({
      where: { targetType: "comment", status: "PENDING" },
    });

    const reportedStories = await prisma.report.count({
      where: { targetType: "story", status: "PENDING" },
    });

    const reportedUsers = await prisma.report.count({
      where: { targetType: "user", status: "PENDING" },
    });

    const stats = {
      pendingReports,
      reportedPosts,
      reportedComments,
      reportedStories,
      reportedUsers,
      suspendedUsers,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching moderation stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
