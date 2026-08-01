import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listChurches() {
  try {
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    console.log('Churches in database:');
    churches.forEach(church => {
      console.log(`- ${church.name} (slug: ${church.slug}, id: ${church.id})`);
    });

    if (churches.length === 0) {
      console.log('No churches found in database');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listChurches();
