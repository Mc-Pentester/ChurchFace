import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkChurches() {
  try {
    // Vérifier d'abord les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(`Nombre d'utilisateurs dans la base: ${users.length}`);
    
    if (users.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé dans la base!');
    } else {
      console.log('\nListe des utilisateurs:');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name} (${user.email})`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Role: ${user.role}`);
      });
    }

    // Vérifier les églises
    const churches = await prisma.church.findMany({
      include: {
        admins: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            admins: true,
            members: true,
          },
        },
      },
    });

    console.log(`\n\nNombre d'églises dans la base: ${churches.length}`);
    
    if (churches.length === 0) {
      console.log('Aucune église trouvée. La base est vide.');
    } else {
      console.log('\nListe des églises et leurs créateurs (owners):');
      churches.forEach((church, index) => {
        console.log(`\n${index + 1}. ${church.name} (${church.slug})`);
        console.log(`   - ID: ${church.id}`);
        console.log(`   - Admins: ${church._count.admins}`);
        console.log(`   - Members: ${church._count.members}`);
        
        const owners = church.admins.filter(admin => admin.role === 'CHURCH_OWNER');
        if (owners.length > 0) {
          console.log(`   - Owners (${owners.length}):`);
          owners.forEach(owner => {
            console.log(`     • ${owner.user.name} (${owner.user.email}) - ID: ${owner.user.id} - Role: ${owner.role}`);
          });
        } else {
          console.log(`   - ⚠️ Aucun owner trouvé!`);
        }
      });
    }

    // Vérifier aussi les ChurchAdmin et ChurchMember
    const churchAdmins = await prisma.churchAdmin.count();
    const churchMembers = await prisma.churchMember.count();
    
    console.log(`\n\nTotal ChurchAdmin: ${churchAdmins}`);
    console.log(`Total ChurchMember: ${churchMembers}`);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChurches();
