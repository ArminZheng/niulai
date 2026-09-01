import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

// Simulated identity until GitHub OAuth2 lands (CLAUDE.md §11). A cookie picks
// which seeded user "the current user" is, so identity, roles, and ownership
// are real in the codebase — the OAuth swap later only replaces getView().
// This is not a security boundary yet; it exists so the permission rules are
// already wired and tested by the time real sessions arrive.

export const VIEW_COOKIE = "niulai-view";

export type View = "admin" | "visitor";

// Each view maps to a seeded user from db/init.sql. The visitor is a READER:
// it can comment/reply as someone else, owns nothing, cannot author posts.
const VIEW_USER_ID: Record<View, string> = {
  admin: "user-owner",
  visitor: "user-guest",
};

export async function getView(): Promise<View> {
  const store = await cookies();
  return store.get(VIEW_COOKIE)?.value === "visitor" ? "visitor" : "admin";
}

// The "current" user behind the active view. Null means the seeded row is
// missing (db not initialized) — actions treat null as unauthenticated.
export async function getCurrentUser(): Promise<User | null> {
  return prisma.user.findUnique({ where: { id: VIEW_USER_ID[await getView()] } });
}

// Any authenticated identity may write user content (topics, replies, comments).
// Type predicate: passing the gate narrows away null for the caller.
export function canWrite(user: User | null): user is User {
  return user !== null;
}

// Only AUTHOR/ADMIN may author blog posts (§11 role ladder).
export function canAuthorPosts(user: User | null): user is User {
  return user?.role === "AUTHOR" || user?.role === "ADMIN";
}

// Edit/delete: the author themselves, or an ADMIN doing simple moderation (§10).
// Callers pass the resource's authorId; UI hides the button on the same rule,
// but the Server Action check is the actual boundary.
export function canManage(user: User | null, authorId: string): boolean {
  return !!user && (user.role === "ADMIN" || user.id === authorId);
}
