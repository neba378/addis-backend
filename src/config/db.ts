import { PrismaClient } from "@prisma/client";
import { env, isDevelopment } from "./env"; // Import your env config

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: env.database.url, // Use the URL from your env config
      },
    },
    log: isDevelopment() ? ["query", "error", "warn"] : ["error"],
  });

if (isDevelopment()) {
  globalThis.__prisma = prisma;
}

export default prisma;
