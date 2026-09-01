import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { DeleteTopicButton } from "@/components/forum/DeleteTopicButton";
import { DeleteReplyButton } from "@/components/forum/DeleteReplyButton";

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

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(first(sp.page), 10) || 1);

  const topic = await withReadRetry(() =>
    prisma.topic.findUnique({ where: { id }, include: { author: true } }),
  );

  if (!topic) {
    notFound();
  }

  // Count first so an out-of-range page can be clamped instead of rendering
  // an empty list with no explanation.
  const total = await withReadRetry(() => prisma.reply.count({ where: { topicId: id } }));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) {
    redirect(`/forum/${id}?${pageQuery(totalPages)}`);
  }

  const replies = await withReadRetry(() =>
    prisma.reply.findMany({
      where: { topicId: id },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { author: true },
    }),
  );

  return (
    <article>
      <h1>{topic.title}</h1>
      <p>
        <small>
          by {topic.author.name} · {topic.createdAt.toLocaleDateString("zh-CN")}
        </small>
      </p>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
        {topic.content}
      </pre>
      <section>
        <h2>回复 ({total})</h2>
        {replies.length === 0 ? (
          <p>暂无回复。</p>
        ) : (
          <ul>
            {replies.map((r) => (
              <li key={r.id}>
                <strong>{r.author.name}</strong>: {r.content}{" "}
                <DeleteReplyButton id={r.id} />
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 ? (
          <nav aria-label="分页">
            {page > 1 ? (
              <>
                <Link href={`/forum/${id}?${pageQuery(page - 1)}`}>← 上一页</Link>{" "}
              </>
            ) : null}
            第 {page} / {totalPages} 页 · 共 {total} 条
            {page < totalPages ? (
              <>
                {" "}
                <Link href={`/forum/${id}?${pageQuery(page + 1)}`}>下一页 →</Link>
              </>
            ) : null}
          </nav>
        ) : null}
        <ReplyForm topicId={topic.id} />
      </section>
      <hr />
      <DeleteTopicButton id={topic.id} title={topic.title} />
      <p>
        <Link href="/forum">← back to forum</Link>
      </p>
    </article>
  );
}
