// Prisma 7 config — used by the CLI (migrate / diff / generate / db).
// Connection URLs no longer live in schema.prisma; they live here.
//
// `datasource.url` is the non-pooling (session-mode) connection used by
// migrations/introspection — pgbouncer transaction mode breaks migrate.
// Runtime queries use the pooling URL via the adapter in lib/prisma.ts.
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Non-pooling connection for migrate/introspect. Undefined is fine for
  // offline commands (generate, migrate diff --from-empty).
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
