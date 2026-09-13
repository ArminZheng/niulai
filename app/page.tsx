import Link from "next/link";
import { getHomeFeed } from "@/lib/feed";

// The feed is random per visit (lib/feed.ts), so render per request.
export const dynamic = "force-dynamic";

export const metadata = { title: "niulai" };

export default async function HomePage() {
  const feed = await getHomeFeed(15, "random");
  return (
    <article>
      {feed.length === 0 ? (
        <p>还没有内容。</p>
      ) : (
        <ul className="feed">
          {feed.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="feed-item">
              <span className="feed-title">
                <Link href={`${item.href}?from=home`}>{item.title}</Link>
              </span>
              <span className="feed-meta">
                <span className={`tag tag-${item.kind}`}>
                  {item.kind === "post" ? "博客" : "论坛"}
                </span>{" "}
                {item.author} · {item.at.toLocaleDateString("zh-CN")} ·{" "}
                {item.statCount} {item.statLabel}
              </span>
              {item.excerpt ? <span className="feed-excerpt">{item.excerpt}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
