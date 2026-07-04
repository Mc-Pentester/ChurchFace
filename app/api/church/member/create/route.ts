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
    const { name, email, role, isActive, churchId } = body;

    if (!name || !email || !churchId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hasAccess = await userHasChurchRole(churchId, session.user.id, ["CHURCH_OWNER", "CHURCH_ADMIN", "ADMIN"]);

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: tempPassword, // Temporary password, user will reset it
        },
      });
    }

    // Create church member
    const member = await prisma.churchMember.create({
      data: {
        churchId,
        userId: user.id,
        role: role || "MEMBER",
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
