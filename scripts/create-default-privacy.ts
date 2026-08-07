import { prisma } from "@/lib/prisma";

async function createDefaultPrivacySettings() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      const existing = await prisma.profilePrivacy.findUnique({
        where: { userId: user.id },
      });

      if (!existing) {
        await prisma.profilePrivacy.create({
          data: {
            userId: user.id,
            profileLocked: false,
            postVisibility: "PUBLIC",
            friendVisibility: "PUBLIC",
            followPermission: "EVERYONE",
          },
        });
        console.log(`Created privacy settings for user ${user.id}`);
      }
    }

    console.log("Default privacy settings created successfully");
  } catch (error) {
    console.error("Error creating default privacy settings:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultPrivacySettings();
