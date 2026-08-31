import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// One connection string for runtime queries (Supabase pooler, transaction mode,
// pgbouncer). Migrations use DIRECT_URL via prisma.config.ts instead.
function createPrisma() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Fail loudly with a actionable message instead of letting `pg` silently
    // fall back to 127.0.0.1:5432 (which shows up as a confusing P1001).
    throw new Error(
      "DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables " +
        "(exact name DATABASE_URL, value = Supabase pooler URL on port 6543 with " +
        "pgbouncer=true), then redeploy."
    );
  }
  const adapter = new PrismaPg(url);
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
