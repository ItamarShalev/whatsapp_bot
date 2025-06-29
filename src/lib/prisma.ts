import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client instance for database operations.
 */
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
  });

export async function handlePrismaDisconnect() {
  try {
    await prisma.$disconnect();
    logger.info("PrismaClient disconnected gracefully.");
  } catch (error) {
    logger.error(error, "Error during PrismaClient disconnect:");
  }
}

// In development, store the PrismaClient instance globally.
// This ensures that subsequent hot-reloads reuse the same instance.
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
