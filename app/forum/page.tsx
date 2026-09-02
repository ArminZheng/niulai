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
      <h1>forum</h1>
      {canWrite(user) ? (
        <p>
          <Link href="/forum/new">+ new topic</Link>
        </p>
      ) : null}
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
