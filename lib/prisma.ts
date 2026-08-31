import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Supabase exposes the pooler URL as POSTGRES_PRISMA_URL (not DATABASE_URL).
// Fall back to DATABASE_URL for generic hosts. Either way, the name must match
// the env var set in Vercel / .env.
function connectionString(): string {
  return process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL ?? "";
}

// Remove sslmode from a postgres URL so a `ssl` object (not pg's verify-full
// override) controls TLS. Used in dev only.
function withoutSslMode(url: string): string {
  const q = url.indexOf("?");
  if (q < 0) return url;
  const base = url.slice(0, q);
  const params = new URLSearchParams(url.slice(q + 1));
  params.delete("sslmode");
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function createPrisma(): PrismaClient {
  const url = connectionString();
  if (!url) {
    throw new Error(
      "POSTGRES_PRISMA_URL is not set. Add it in Vercel → Settings → Environment " +
        "Variables (copy the value from Supabase → Settings → Database → " +
        "Connection pooling), then redeploy."
    );
  }

  // Local dev often sits behind a TLS-intercepting proxy (self-signed chain).
  // Strip sslmode and skip cert verification in dev only. Production (Vercel)
  // keeps strict sslmode=require, which Supabase trusts cleanly there.
  const isDev = process.env.NODE_ENV !== "production";
  const adapter = new PrismaPg(
    isDev
      ? { connectionString: withoutSslMode(url), ssl: { rejectUnauthorized: false } }
      : url
  );
  return new PrismaClient({ adapter });
}

// Lazy proxy: defer client creation until the first query. Build-time
// "collect page data" only imports this module (never queries), so a missing
// connection string won't fail the build — only runtime requests that hit the DB.
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
