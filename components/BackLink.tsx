import Link from "next/link";

// A detail page's "back" target depends on where the reader came from. List
// and feed pages tag their entry links with ?from=<source>; this maps that
// source to a destination. Anything unknown falls back to the section the
// detail belongs to (a blog post falls back to /blog, a topic to /forum).
type Source = { href: string; label: string };

const SOURCES: Record<string, Source> = {
  home: { href: "/", label: "home" },
  blog: { href: "/blog", label: "blog" },
  forum: { href: "/forum", label: "forum" },
};

function resolve(from: string | undefined, fallback: "blog" | "forum"): Source {
  if (from) {
    const hit = Object.values(SOURCES).find((s) => s.label === from);
    if (hit) return hit;
  }
  // fallback is always "blog" or "forum", both present above.
  return fallback === "blog" ? SOURCES.blog! : SOURCES.forum!;
}

export function BackLink({
  from,
  fallback,
}: {
  from: string | undefined;
  fallback: "blog" | "forum";
}) {
  const target = resolve(from, fallback);
  return <Link href={target.href}>← back to {target.label}</Link>;
}
