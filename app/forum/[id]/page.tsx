import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import { deleteReply, deleteTopic } from "@/app/forum/actions";
import { getCurrentUser, canManage } from "@/lib/auth";
import { PaginationNav } from "@/components/PaginationNav";
import { DeleteButton } from "@/components/DeleteButton";
import { ReplyForm } from "@/components/forum/ReplyForm";

export const metadata = { title: "forum — niulai" };

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = parsePage(first(sp.page));
  const hrefFor = (p: number) => `/forum/${id}${pageQuery(p)}`;

  const [user, topic] = await Promise.all([
    getCurrentUser(),
    withReadRetry(() => prisma.topic.findUnique({ where: { id }, include: { author: true } })),
  ]);

  if (!topic) {
    notFound();
  }

  // Count first so an out-of-range page can be clamped instead of rendering
  // an empty list with no explanation.
  const total = await withReadRetry(() => prisma.reply.count({ where: { topicId: id } }));
  const totalPages = totalPagesFor(total);
  if (page > totalPages) {
    redirect(hrefFor(totalPages));
  }

  const replies = await withReadRetry(() =>
    prisma.reply.findMany({
      where: { topicId: id },
      orderBy: { createdAt: "asc" },
      skip: skipFor(page),
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
                {canManage(user, r.authorId) ? (
                  <DeleteButton
                    action={deleteReply}
                    fields={{ replyId: r.id }}
                    confirmText="删除这条回复?"
                    label="删除"
                    inline
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 ? (
          <PaginationNav page={page} totalPages={totalPages} total={total} hrefFor={hrefFor} />
        ) : null}
        <ReplyForm topicId={topic.id} />
      </section>
      {canManage(user, topic.authorId) ? (
        <>
          <hr />
          <DeleteButton
            action={deleteTopic}
            fields={{ id: topic.id }}
            confirmText={`删除「${topic.title}」?回复将一并删除,不可恢复。`}
            label="删除话题"
          />
        </>
      ) : null}
      <p>
        <Link href="/forum">← back to forum</Link>
      </p>
    </article>
  );
}
