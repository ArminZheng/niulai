import { cookies } from "next/headers";

// Manual theme override stored in a cookie and read server-side, so the very
// first HTML already carries the right theme — no client-side flash and no
// localStorage dance (same server-first reasoning as the view toggle).
//
// The default is the dark json-tool palette (see globals.css); only an
// explicit "light" cookie swaps in the plain reading theme.
export const THEME_COOKIE = "niulai-theme";

export type Theme = "light" | "dark";

export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  return store.get(THEME_COOKIE)?.value === "light" ? "light" : "dark";
}
