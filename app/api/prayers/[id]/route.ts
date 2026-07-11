import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prayer = await prisma.prayerRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        _count: {
          select: {
            reactions: true,
            responses: true,
            verses: true,
          },
        },

        reactions: {
          include: {
            user: {
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
        },

        responses: {
          include: {
            user: {
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
        },

        verses: {
          include: {
            user: {
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
        },

        testimony: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },

        prayerChain: {
          include: {
            _count: {
              select: {
                links: true,
              },
            },

            links: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!prayer) {
      return NextResponse.json(
        { error: "Prayer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ prayer });

  } catch (error) {
    console.error("PRAYER GET ERROR:", error);

    return NextResponse.json(
      { error: "Failed loading prayer" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {

    const { id } = await params;

    const existing = await prisma.prayerRequest.findUnique({
      where: { id },
      select: {
        userId: true,
      },
    });


    if (!existing) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }


    const userRole = (session.user as any).role;

    const canDelete =
      existing.userId === session.user.id ||
      userRole === "ADMIN" ||
      userRole === "SUPER_ADMIN";


    if (!canDelete) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }


    await prisma.prayerRequest.delete({
      where: {
        id,
      },
    });


    return NextResponse.json({
      success: true,
    });


  } catch (error) {

    console.error("PRAYER DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Failed deleting prayer" },
      { status: 500 }
    );
  }
}