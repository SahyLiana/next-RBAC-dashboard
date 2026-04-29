import { PrismaClient } from "@prisma/client";

// Added "as" to fix the TypeScript syntax error
//TO AVOID TOO MANY CONNECTIONS BECAUSE THE DATABASE IS A SINGLETON
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Database helper function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // This "pings" the database without needing a specific table
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}
