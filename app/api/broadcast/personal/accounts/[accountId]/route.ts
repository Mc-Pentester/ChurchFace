import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/broadcast-encryption';
import { getProvider } from '@/lib/broadcast/registry';

/**
 * GET /api/broadcast/personal/accounts/[accountId]
 * Get a specific personal broadcast account
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

    const account = await prisma.broadcastAccount.findFirst({
      where: {
        id: accountId,
        ownerType: 'USER',
        userId: session.user.id
      },
      include: {
        destinations: true
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const safeAccount = {
      id: account.id,
      platform: account.platform,
      accountName: account.accountName,
      status: account.status,
      metadata: account.metadata,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      lastUsedAt: account.lastUsedAt,
      destinations: account.destinations.map(dest => ({
        id: dest.id,
        name: dest.name,
        platform: dest.platform,
        enabled: dest.enabled,
        isDefault: dest.isDefault,
        configuration: dest.configuration
      }))
    };

    return NextResponse.json({ account: safeAccount });
  } catch (error) {
    console.error('Error fetching personal broadcast account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/broadcast/personal/accounts/[accountId]
 * Update a personal broadcast account
 */
export async function PATCH(
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
    const { accountName, status, accessToken, refreshToken, metadata } = body;

    const account = await prisma.broadcastAccount.findFirst({
      where: {
        id: accountId,
        ownerType: 'USER',
        userId: session.user.id
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (accountName) {
      updateData.accountName = accountName;
    }
    if (status) {
      updateData.status = status;
    }
    if (metadata) {
      updateData.metadata = metadata;
    }

    // Update tokens if provided
    if (accessToken || refreshToken) {
      const encryptionKey = process.env.BROADCAST_ENCRYPTION_KEY;

      if (!encryptionKey) {
        return NextResponse.json(
          { error: 'Server encryption key not configured' },
          { status: 500 }
        );
      }

      if (accessToken) {
        updateData.accessTokenEncrypted = encrypt(accessToken, encryptionKey);
      }
      if (refreshToken) {
        updateData.refreshTokenEncrypted = encrypt(refreshToken, encryptionKey);
      }
    }

    const updatedAccount = await prisma.broadcastAccount.update({
      where: { id: accountId },
      data: updateData
    });

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Error updating personal broadcast account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/broadcast/personal/accounts/[accountId]
 * Delete a personal broadcast account
 */
export async function DELETE(
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

    const account = await prisma.broadcastAccount.findFirst({
      where: {
        id: accountId,
        ownerType: 'USER',
        userId: session.user.id
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Revoke access if OAuth-based
    if (account.accessTokenEncrypted) {
      const encryptionKey = process.env.BROADCAST_ENCRYPTION_KEY;
      if (encryptionKey) {
        try {
          const accessToken = decrypt(account.accessTokenEncrypted, encryptionKey);
          const provider = getProvider(account.platform);
          if (provider) {
            await provider.revokeAccess({ accessToken });
          }
        } catch (error) {
          console.error('Error revoking access:', error);
        }
      }
    }

    await prisma.broadcastAccount.delete({
      where: { id: accountId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting personal broadcast account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
