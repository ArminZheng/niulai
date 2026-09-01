import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";

// Content lives in the DB and changes on write — render per request, never at build.
export const dynamic = "force-dynamic";

export const metadata = { title: "forum — niulai" };

const PAGE_SIZE = 20;

// searchParams values may repeat (?page=1&page=2); the first one wins.
function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

// Canonical links: omit params at their defaults so URLs stay short.
function pageQuery(page: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export default async function ForumListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(first(sp.page), 10) || 1);

  // Count first so an out-of-range page can be clamped instead of rendering
  // an empty list with no explanation.
  const total = await withReadRetry(() => prisma.topic.count());
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) {
    redirect(`/forum?${pageQuery(totalPages)}`);
  }

  const topics = await withReadRetry(() =>
    prisma.topic.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { author: true, _count: { select: { replies: true } } },
    }),
  );

  return (
    <article>
      <h1>forum</h1>
      <p>
        <Link href="/forum/new">+ new topic</Link>
      </p>
      {topics.length === 0 ? (
        <p>暂无话题。</p>
      ) : (
        <ul>
          {topics.map((t) => (
            <li key={t.id}>
              <Link href={`/forum/${t.id}`}>{t.title}</Link>{" "}
              <small>
                ({t._count.replies} 回复) by {t.author.name}
              </small>
            </li>
          ))}
        </ul>
      )}
      <nav aria-label="分页">
        {page > 1 ? (
          <>
            <Link href={`/forum?${pageQuery(page - 1)}`}>← 上一页</Link>{" "}
          </>
        ) : null}
        第 {page} / {totalPages} 页 · 共 {total} 条
        {page < totalPages ? (
          <>
            {" "}
            <Link href={`/forum?${pageQuery(page + 1)}`}>下一页 →</Link>
          </>
        ) : null}
      </nav>
    </article>
  );
}
