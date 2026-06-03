import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("123456", 10);

  await prisma.user.create({
    data: {
      email: "test@test.com",
      password: hash,
      name: "Test User",
    },
  });

  console.log("User created");
}

main();