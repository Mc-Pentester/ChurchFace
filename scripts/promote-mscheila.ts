import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteUser() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'mscheilafr@gmail.com' },
    });

    if (!user) {
      console.error('User mscheilafr@gmail.com not found');
      process.exit(1);
    }

    console.log('Found user:', user.id, user.email);

    // Find church by slug
    const church = await prisma.church.findUnique({
      where: { slug: 'edmarc' },
    });

    if (!church) {
      console.error('Church edmarc not found');
      process.exit(1);
    }

    console.log('Found church:', church.id, church.slug);

    // Create or update ChurchMember with OWNER role
    const churchMember = await prisma.churchMember.upsert({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: user.id,
        },
      },
      update: {
        role: 'OWNER',
        isActive: true,
      },
      create: {
        churchId: church.id,
        userId: user.id,
        role: 'OWNER',
        isActive: true,
      },
    });

    console.log('ChurchMember updated:', churchMember.id, churchMember.role);

    // Create or update ChurchAdmin with OWNER role
    const churchAdmin = await prisma.churchAdmin.upsert({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: user.id,
        },
      },
      update: {
        role: 'OWNER',
        appointedAt: new Date(),
      },
      create: {
        churchId: church.id,
        userId: user.id,
        role: 'OWNER',
        appointedAt: new Date(),
      },
    });

    console.log('ChurchAdmin updated:', churchAdmin.id, churchAdmin.role);

    console.log('✅ User promoted successfully as OWNER of edmarc church');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

promoteUser();
