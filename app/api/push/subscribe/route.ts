import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/push/subscribe - Register a push subscription
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await req.json();

  // Validate subscription
  if (!subscription.endpoint) {
    return NextResponse.json({ error: "Invalid subscription: endpoint required" }, { status: 400 });
  }

  if (!subscription.keys) {
    return NextResponse.json({ error: "Invalid subscription: keys required" }, { status: 400 });
  }

  if (!subscription.keys.p256dh) {
    return NextResponse.json({ error: "Invalid subscription: p256dh required" }, { status: 400 });
  }

  if (!subscription.keys.auth) {
    return NextResponse.json({ error: "Invalid subscription: auth required" }, { status: 400 });
  }

  try {
    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findFirst({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      // Update existing subscription - IMPORTANT: also update userId
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId: session.user.id,
          keys: subscription.keys,
        },
      });

      return NextResponse.json({
        success: true,
        subscriptionId: existing.id,
        updated: true
      });
    } else {
      // Create new subscription
      const newSubscription = await prisma.pushSubscription.create({
        data: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
      });

      return NextResponse.json({
        success: true,
        subscriptionId: newSubscription.id,
        updated: false
      });
    }
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}

// DELETE /api/push/subscribe - Unsubscribe from push notifications
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint } = await req.json();

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
  }

  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting push subscription:", error);
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 });
  }
}
