import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const churchId = process.env.CID;
  const userId = process.env.UID;

  if (!churchId || !userId) {
    console.error("Usage: CID=<churchId> UID=<userId> node ./scripts/make-owner.js");
    process.exit(1);
  }

  console.log(`Running make-owner for churchId=${churchId} userId=${userId}`);

  // Check if church exists
  const church = await prisma.church.findUnique({ where: { id: churchId } });
  if (!church) {
    console.error(`Church not found: ${churchId}`);
    process.exit(1);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.error(`User not found: ${userId}`);
    process.exit(1);
  }

  // Check existing owner
  const existingOwner = await prisma.churchAdmin.findFirst({ where: { churchId, role: "CHURCH_OWNER" } });
  if (existingOwner) {
    console.log("Church already has an owner:", existingOwner.userId);
    await prisma.$disconnect();
    process.exit(0);
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Upsert church admin record to set CHURCH_OWNER
      await tx.churchAdmin.upsert({
        where: { churchId_userId: { churchId, userId } },
        update: { role: "CHURCH_OWNER", appointedAt: new Date() },
        create: { churchId, userId, role: "CHURCH_OWNER", appointedAt: new Date() },
      });

      // Ensure the user is a member with ADMIN role
      await tx.churchMember.upsert({
        where: { churchId_userId: { churchId, userId } },
        update: { role: "ADMIN", isActive: true },
        create: { churchId, userId, role: "ADMIN", isActive: true },
      });
    });

    console.log(`Successfully assigned user ${userId} as CHURCH_OWNER for church ${churchId}`);
  } catch (err) {
    console.error("Error assigning owner:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
