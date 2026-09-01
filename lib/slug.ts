// Turn free text into a URL-safe slug. Topics route by id, so the slug only
// needs to be unique — but keep it ascii-readable for the day routing moves to
// slugs. Non-ascii (CJK, emoji) is stripped; a timestamp tail (added at the
// call site) guarantees uniqueness without a collision round-trip.
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // drop non-word/space/dash (incl. CJK, emoji)
    .replace(/[\s_]+/g, "-") // spaces / underscores → dash
    .replace(/-+/g, "-") // collapse runs
    .replace(/^-|-$/g, "") // trim leading / trailing dash
    .slice(0, 60);
}
