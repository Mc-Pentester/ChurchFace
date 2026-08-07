import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/broadcast-encryption';
import { getProvider } from '@/lib/broadcast/registry';

/**
 * GET /api/broadcast/personal/accounts
 * Get all personal broadcast accounts for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accounts = await prisma.broadcastAccount.findMany({
      where: {
        ownerType: 'USER',
        userId: session.user.id
      },
      include: {
        destinations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Decrypt tokens for response (exclude sensitive data in production)
    const safeAccounts = accounts.map(account => ({
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
    }));

    return NextResponse.json({ accounts: safeAccounts });
  } catch (error) {
    console.error('Error fetching personal broadcast accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/broadcast/personal/accounts
 * Create a new personal broadcast account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { platform, accountName, accessToken, refreshToken, metadata } = body;

    if (!platform || !accountName) {
      return NextResponse.json(
        { error: 'Platform and account name are required' },
        { status: 400 }
      );
    }

    const encryptionKey = process.env.BROADCAST_ENCRYPTION_KEY;

    if (!encryptionKey) {
      return NextResponse.json(
        { error: 'Server encryption key not configured' },
        { status: 500 }
      );
    }

    // Encrypt tokens
    const accessTokenEncrypted = accessToken 
      ? encrypt(accessToken, encryptionKey)
      : null;
    const refreshTokenEncrypted = refreshToken
      ? encrypt(refreshToken, encryptionKey)
      : null;

    // Validate with provider if OAuth-based
    const provider = getProvider(platform);
    if (provider && accessToken) {
      try {
        const testResult = await provider.testConnection({
          accessToken,
          refreshToken,
          metadata
        });

        if (!testResult.success) {
          return NextResponse.json(
            { error: `Connection test failed: ${testResult.error}` },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('Provider validation error:', error);
      }
    }

    const account = await prisma.broadcastAccount.create({
      data: {
        ownerType: 'USER',
        userId: session.user.id,
        platform,
        accountName,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        status: 'ACTIVE',
        metadata: metadata || {}
      }
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('Error creating personal broadcast account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
