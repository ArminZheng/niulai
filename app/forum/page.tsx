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

// Content lives in the DB and changes on write — render per request, never at build.
export const dynamic = "force-dynamic";

export const metadata = { title: "forum — niulai" };

export default async function ForumListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = parsePage(first(sp.page));
  const hrefFor = (p: number) => `/forum${pageQuery(p)}`;

  // Count first so an out-of-range page can be clamped instead of rendering
  // an empty list with no explanation.
  const total = await withReadRetry(() => prisma.topic.count());
  const totalPages = totalPagesFor(total);
  if (page > totalPages) {
    redirect(hrefFor(totalPages));
  }

  const topics = await withReadRetry(() =>
    prisma.topic.findMany({
      orderBy: { createdAt: "desc" },
      skip: skipFor(page),
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
      <PaginationNav page={page} totalPages={totalPages} total={total} hrefFor={hrefFor} />
    </article>
  );
}
