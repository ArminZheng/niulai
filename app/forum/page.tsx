import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";
import {
  PAGE_SIZE,
  first,
  pageQuery,
  parsePage,
  skipFor,
  totalPagesFor,
} from "@/lib/pagination";
import { PaginationNav } from "@/components/PaginationNav";
import { getCurrentUser, canWrite } from "@/lib/auth";

// Content lives in the DB and changes on write — render per request, never at build.
export const dynamic = "force-dynamic";

export const metadata = { title: "forum — niulai" };

export default async function ForumListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const page = parsePage(first(sp.page));
  const hrefFor = (p: number) => `/forum${pageQuery(p)}`;

  // Count and page fetch run in parallel — each round trip to the DB is
  // cross-region, so serializing them doubles the wait.
  const [total, topics] = await Promise.all([
    withReadRetry(() => prisma.topic.count()),
    withReadRetry(() =>
      prisma.topic.findMany({
        orderBy: { createdAt: "desc" },
        skip: skipFor(page),
        take: PAGE_SIZE,
        include: { author: true, _count: { select: { replies: true } } },
      }),
    ),
  ]);
  const totalPages = totalPagesFor(total);
  if (page > totalPages) {
    redirect(hrefFor(totalPages));
  }

  return (
    <article>
      {canWrite(user) ? (
        <div className="toolbar">
          <span className="spacer" />
          <Link href="/forum/new" className="btn">
            + new topic
          </Link>
        </div>
      ) : null}
      {topics.length === 0 ? (
        <p>暂无话题。</p>
      ) : (
        <ul className="topic-list">
          {topics.map((t, i) => (
            <li key={t.id} className="topic-item">
              {/* v2ex/HN-style rank by position within the page. */}
              <span className="topic-rank">{skipFor(page) + i + 1}.</span>
              <span className="topic-body">
                <span className="topic-title">
                  <Link href={`/forum/${t.id}`}>{t.title}</Link>
                </span>
                <span className="topic-meta">
                  {t.author.name} · {t.createdAt.toLocaleDateString("zh-CN")}
                </span>
              </span>
              <span className="topic-count" title={`${t._count.replies} 回复`}>
                {t._count.replies}
              </span>
            </li>
          ))}
        </ul>
      )}
      <PaginationNav page={page} totalPages={totalPages} total={total} hrefFor={hrefFor} />
    </article>
  );
}
