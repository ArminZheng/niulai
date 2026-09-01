import { marked } from "marked";

// Posts are authored by the site owner only — a trusted source — so the
// rendered HTML is injected without sanitization (N1 decision; CLAUDE.md §31:
// no dependency for a threat that does not exist yet). If untrusted authors
// ever arrive, sanitize HERE, not at call sites. Comments stay plain text and
// are escaped by React, so they never pass through this.
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}
