import { randomUUID } from "node:crypto";
import { prisma } from "./db/prisma.js";

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: "dev@globetrotter.local",
    },
  });

  if (!user) {
    console.log("Development user not found.");
    return;
  }

  if (user.id) {
    console.log("User already has an ID:", user.id);
    return;
  }

  const newId = randomUUID();

  const updatedUser = await prisma.user.update({
    where: {
      email: "dev@globetrotter.local",
    },
    data: {
      id: newId,
    },
  });

  console.log("Fixed development user:");
  console.log(updatedUser);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });