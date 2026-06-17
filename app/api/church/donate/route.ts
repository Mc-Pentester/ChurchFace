import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { churchId, amount, method, paymentDetails } = await req.json();

    if (!churchId || !amount || !method) {
      return NextResponse.json(
        { error: "churchId, amount, and method are required" },
        { status: 400 }
      );
    }

    // Check if church exists and has donations enabled
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    if (!church.donationEnabled) {
      return NextResponse.json(
        { error: "Donations are not enabled for this church" },
        { status: 400 }
      );
    }

    // TODO: Integrate with payment providers (MonCash, NatCash, etc.)
    // For now, just log the donation request
    console.log("Donation request:", {
      churchId,
      userId: session.user.id,
      amount,
      method,
      paymentDetails,
    });

    return NextResponse.json({
      success: true,
      message: "Donation request received. Payment integration pending.",
    });
  } catch (error) {
    console.error("Error processing donation:", error);
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 }
    );
  }
}
