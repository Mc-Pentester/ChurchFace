import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const args = process.argv.slice(2);
  const email = args[0];

  if (!email) {
    console.log('Usage: npx ts-node scripts/promote-admin.ts <email>');
    console.log('Exemple: npx ts-node scripts/promote-admin.ts user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Utilisateur avec email ${email} non trouvé`);
      process.exit(1);
    }

    console.log(`Utilisateur trouvé: ${user.name} (${user.email})`);
    console.log(`Rôle actuel: ${user.role}`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`✅ Utilisateur promu en ADMIN: ${updatedUser.name} (${updatedUser.email})`);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
