import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Fail with an actionable message instead of letting `pg` fall back to
    // 127.0.0.1:5432 (a confusing P1001).
    throw new Error(
      "DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables " +
        "(exact name DATABASE_URL, value = Supabase pooler URL on port 6543 with " +
        "pgbouncer=true), then redeploy."
    );
  }
  return new PrismaClient({ adapter: new PrismaPg(url) });
}

// Lazy proxy: defer client creation until the first query. Build-time
// "collect page data" only imports this module (never queries), so a missing
// DATABASE_URL won't fail the build — only runtime requests that hit the DB.
// Reuses one client across hot-reloads in dev via the global cache.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrisma();
    }
    const client = globalForPrisma.prisma;
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
