import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

// Auth placeholder. GitHub OAuth2 will replace this module (CLAUDE.md §11).
// Until then, every write is authored by the seeded site owner and the
// permission gate is open. The gate stays in place in each Server Action so
// wiring real auth later is a change to this file, not a sweep of actions.

// The owner seeded in db/init.sql. Writes are attributed to this user until
// real sessions exist.
const OWNER_ID = "user-owner";

// Returns the "current" user. Today: the site owner, always. With OAuth2,
// this reads the session and returns the logged-in user (or null).
export async function getCurrentUser(): Promise<User | null> {
  return prisma.user.findUnique({ where: { id: OWNER_ID } });
}

// Permission gate reserved for GitHub OAuth2. Open by default — never rely on
// this for security yet. Real authorization (role checks) lands with OAuth.
export async function canWrite(): Promise<boolean> {
  return true;
}
