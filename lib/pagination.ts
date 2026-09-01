// Shared URL-driven pagination (CLAUDE.md §27): search params are the single
// source of truth, and links omit params at their defaults so bare navigation
// stays clean (/blog, not /blog?page=1).

export const PAGE_SIZE = 20;

// searchParams values may repeat (?page=1&page=2); the first one wins.
export function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

// 1-based page from a raw param; missing or invalid input falls back to 1.
export function parsePage(raw: string): number {
  return Math.max(1, parseInt(raw, 10) || 1);
}

// Total pages for a row count; always at least 1 so an empty result set still
// has a well-defined "page 1" to clamp to.
export function totalPagesFor(total: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function skipFor(page: number, pageSize = PAGE_SIZE): number {
  return (page - 1) * pageSize;
}

// Canonical page link: extra params (filters) are kept only when non-empty,
// and page itself only when above 1.
export function pageQuery(page: number, params: Record<string, string> = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
