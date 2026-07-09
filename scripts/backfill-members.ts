#!/usr/bin/env node

/*
  scripts/backfill-members.ts
  Backfill ChurchMember for all church admins that don't have a member record.

  Usage (dry-run):
    npx ts-node --transpile-only scripts/backfill-members.ts

  Usage (apply):
    npx ts-node --transpile-only scripts/backfill-members.ts --apply
*/

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillMembers(apply = false) {
  const churches = await prisma.church.findMany({ 
    select: { 
      id: true, 
      name: true,
      _count: {
        select: { members: true, admins: true }
      }
    }
  });

  const summary = { total: churches.length, skipped: 0, created: 0, errors: [] as any[] };

  for (const church of churches) {
    console.log(`\nProcessing church: ${church.name} (${church.id})`);
    console.log(`  Current members: ${church._count.members}, admins: ${church._count.admins}`);

    const admins = await prisma.churchAdmin.findMany({ 
      where: { churchId: church.id },
      include: { user: true }
    });

    for (const admin of admins) {
      const existingMember = await prisma.churchMember.findUnique({
        where: { churchId_userId: { churchId: church.id, userId: admin.userId } }
      });

      if (existingMember) {
        console.log(`  ✓ User ${admin.user.email} already a member`);
        summary.skipped++;
        continue;
      }

      console.log(`  ${apply ? "APPLY" : "DRY-RUN"} -> Add member for admin ${admin.user.email} (${admin.userId})`);

      if (apply) {
        try {
          await prisma.churchMember.create({
            data: {
              churchId: church.id,
              userId: admin.userId,
              role: admin.role === "CHURCH_OWNER" ? "ADMIN" : "MEMBER",
              isActive: true
            }
          });
          summary.created++;
          console.log(`    ✓ Created member record`);
        } catch (err: any) {
          console.error(`    ✗ Error: ${err.message}`);
          summary.errors.push({ churchId: church.id, userId: admin.userId, error: err.message });
        }
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total churches: ${summary.total}`);
  console.log(`Skipped (already members): ${summary.skipped}`);
  console.log(`Created: ${summary.created}`);
  if (summary.errors.length > 0) {
    console.log(`Errors: ${summary.errors.length}`);
    summary.errors.forEach(e => console.log(`  - ${e.churchId}/${e.userId}: ${e.error}`));
  }

  await prisma.$disconnect();
}

const apply = process.argv.includes("--apply");
backfillMembers(apply).catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
