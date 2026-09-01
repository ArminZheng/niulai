"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { VIEW_COOKIE } from "@/lib/auth";
import { THEME_COOKIE } from "@/lib/theme";

// Flip the simulated perspective (admin ⇄ visitor). The whole site reads this
// cookie, so the layout and every page under it must re-render.
export async function toggleView(): Promise<void> {
  const store = await cookies();
  const next = store.get(VIEW_COOKIE)?.value === "visitor" ? "admin" : "visitor";
  store.set(VIEW_COOKIE, next, { path: "/", sameSite: "lax" });
  revalidatePath("/", "layout");
}

// Flip light ⇄ dark. Stored in a cookie, applied via <html data-theme> in the
// root layout — see lib/theme.ts.
export async function toggleTheme(): Promise<void> {
  const store = await cookies();
  const next = store.get(THEME_COOKIE)?.value === "dark" ? "light" : "dark";
  store.set(THEME_COOKIE, next, { path: "/", sameSite: "lax" });
  revalidatePath("/", "layout");
}
