import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");

    const church = await prisma.church.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const courses = await prisma.churchCourse.findMany({
      where: { 
        churchId: church.id,
        isPublished: true,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (courses.length > limit) {
      const nextItem = courses.pop();
      nextCursor = nextItem!.id;
    }

    // Add enrollment status if user is authenticated
    const coursesWithEnrollment = await Promise.all(
      courses.map(async (course: any) => {
        let isEnrolled = false;
        let progress = 0;
        if (session?.user) {
          const enrollment = await prisma.churchCourseEnrollment.findUnique({
            where: {
              courseId_userId: {
                courseId: course.id,
                userId: session.user.id,
              },
            },
          });
          isEnrolled = !!enrollment;
          progress = enrollment?.progress || 0;
        }
        return {
          ...course,
          isEnrolled,
          progress,
        };
      })
    );

    return NextResponse.json({
      courses: coursesWithEnrollment,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching church courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch church courses" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.churchCourse.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.isPublished) {
      return NextResponse.json(
        { error: "This course is not published" },
        { status: 403 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.churchCourseEnrollment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: session.user.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
    }

    // Enroll in course
    const enrollment = await prisma.churchCourseEnrollment.create({
      data: {
        courseId,
        userId: session.user.id,
      },
    });

    // Increment enroll count
    await prisma.churchCourse.update({
      where: { id: courseId },
      data: {
        enrollCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
