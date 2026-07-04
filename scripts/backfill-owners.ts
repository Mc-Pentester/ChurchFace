#!/usr/bin/env node

/*
  scripts/backfill-owners.ts
  Backfill CHURCH_OWNER for all churches that don't have one.

  Usage (dry-run):
    npx ts-node --transpile-only scripts/backfill-owners.ts

  Usage (apply):
    npx ts-node --transpile-only scripts/backfill-owners.ts --apply
*/

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillOwners(apply = false) {
  const churches = await prisma.church.findMany({ select: { id: true, name: true } });
  const globalAdmin = await prisma.user.findFirst({ where: { OR: [{ role: "SUPER_ADMIN" }, { role: "ADMIN" }] } });

  const summary = { total: churches.length, skippedWithOwner: 0, assigned: 0, createdMember: 0, manual: [] as any[] };

  for (const church of churches) {
    const hasOwner = await prisma.churchAdmin.findFirst({ where: { churchId: church.id, role: "CHURCH_OWNER" } });
    if (hasOwner) {
      summary.skippedWithOwner++;
      continue;
    }

    // prefer PASTOR
    let candidate = await prisma.churchAdmin.findFirst({ where: { churchId: church.id, role: "PASTOR" }, orderBy: { appointedAt: "asc" } });
    if (!candidate) {
      candidate = await prisma.churchAdmin.findFirst({ where: { churchId: church.id }, orderBy: { appointedAt: "asc" } });
    }

    if (!candidate) {
      const member = await prisma.churchMember.findFirst({ where: { churchId: church.id, role: "ADMIN" }, orderBy: { joinedAt: "asc" } });
      if (member) candidate = { userId: member.userId } as any;
    }

    if (!candidate && globalAdmin) {
      candidate = { userId: globalAdmin.id } as any;
    }

    if (!candidate) {
      summary.manual.push({ churchId: church.id, name: church.name });
      continue;
    }

    console.log(`${apply ? "APPLY" : "DRY-RUN"} -> church ${church.name} (${church.id}) => user ${candidate.userId}`);

    if (apply) {
      let createdMember = false;
      await prisma.$transaction(async (tx) => {
        await tx.churchAdmin.upsert({
          where: { churchId_userId: { churchId: church.id, userId: candidate.userId } },
          update: { role: "CHURCH_OWNER", appointedAt: new Date() },
          create: { churchId: church.id, userId: candidate.userId, role: "CHURCH_OWNER", appointedAt: new Date() },
        });

        const existingMember = await tx.churchMember.findUnique({ where: { churchId_userId: { churchId: church.id, userId: candidate.userId } } });
        if (!existingMember) {
          await tx.churchMember.create({ data: { churchId: church.id, userId: candidate.userId, role: "ADMIN", isActive: true } });
          createdMember = true;
        }
      });

      summary.assigned++;
      if (createdMember) summary.createdMember++;
    }
  }

  console.log("Summary:", summary);
  await prisma.$disconnect();
}

const apply = process.argv.includes("--apply");
backfillOwners(apply).catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
