import { hashPassword } from "@/app/lib/auth";
import { Role } from "@/app/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting db seed...");
  //Create Teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: "Team Engineering",
        description: "Software development team",
        code: "ENG-2024",
      },
    }),
    prisma.team.create({
      data: {
        name: "Team Marketing",
        description: "Marketing and sales team",
        code: "MARK-2024",
      },
    }),
    prisma.team.create({
      data: {
        name: "Operations",
        description: "Business operations team",
        code: "OPS-2024",
      },
    }),
  ]);

  //Create sample users
  const sampleUsers = [
    {
      name: "John Doe",
      email: "john@example.com",
      role: Role.MANAGER,
      team: teams[0],
    },
    {
      name: "Jane Doe",
      email: "jane@example.com",
      team: teams[0],
      role: Role.USER,
    },
    {
      name: "Bob Doe",
      email: "bob@example.com",
      team: teams[1],
      role: Role.MANAGER,
    },
    {
      name: "Alice Doe",
      email: "alice@example.com",
      team: teams[1],
      role: Role.USER,
    },
  ];

  for (const userData of sampleUsers) {
    await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        teamId: userData.team?.id,
        password: await hashPassword("123456"),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("Sedding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
