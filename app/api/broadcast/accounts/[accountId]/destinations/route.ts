import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageBroadcastDestinations } from '@/lib/broadcast-perms';

/**
 * GET /api/broadcast/accounts/[accountId]/destinations
 * Get all destinations for a broadcast account
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const account = await prisma.broadcastAccount.findUnique({
      where: { id: accountId },
      include: { destinations: true }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check ownership/permission
    if (account.ownerType === 'USER') {
      if (account.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    } else if (account.ownerType === 'CHURCH' && account.churchId) {
      const canManage = await canManageBroadcastDestinations(
        account.churchId,
        session.user.id
      );
      if (!canManage) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ destinations: account.destinations });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/broadcast/accounts/[accountId]/destinations
 * Create a new destination for a broadcast account
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, platform, enabled, isDefault, configuration } = body;

    if (!name || !platform) {
      return NextResponse.json(
        { error: 'Name and platform are required' },
        { status: 400 }
      );
    }

    const account = await prisma.broadcastAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check ownership/permission
    if (account.ownerType === 'USER') {
      if (account.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    } else if (account.ownerType === 'CHURCH' && account.churchId) {
      const canManage = await canManageBroadcastDestinations(
        account.churchId,
        session.user.id
      );
      if (!canManage) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    const destination = await prisma.broadcastDestination.create({
      data: {
        broadcastAccountId: accountId,
        name,
        platform,
        enabled: enabled ?? true,
        isDefault: isDefault ?? false,
        configuration: configuration || {}
      }
    });

    return NextResponse.json({ destination }, { status: 201 });
  } catch (error) {
    console.error('Error creating destination:', error);
    return NextResponse.json(
      { error: 'Failed to create destination' },
      { status: 500 }
    );
  }
}
