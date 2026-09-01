"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { VIEW_COOKIE } from "@/lib/auth";

// Flip the simulated perspective (admin ⇄ visitor). The whole site reads this
// cookie, so the layout and every page under it must re-render.
export async function toggleView(): Promise<void> {
  const store = await cookies();
  const next = store.get(VIEW_COOKIE)?.value === "visitor" ? "admin" : "visitor";
  store.set(VIEW_COOKIE, next, { path: "/", sameSite: "lax" });
  revalidatePath("/", "layout");
}
