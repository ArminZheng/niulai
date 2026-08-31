import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// One connection string for runtime queries (Supabase pooler, transaction mode,
// pgbouncer). Migrations use DIRECT_URL via prisma.config.ts instead.
function createPrisma() {
  const adapter = new PrismaPg(process.env.DATABASE_URL ?? "");
  return new PrismaClient({ adapter });
}

// Reuse a single client across hot-reloads in dev to avoid exhausting the
// Supabase pool. On Vercel, each serverless invocation gets its own; the
// global guard is harmless there.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
