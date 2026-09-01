import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReplyForm } from "@/components/forum/ReplyForm";

export const metadata = { title: "forum — niulai" };

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      author: true,
      replies: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!topic) {
    notFound();
  }

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
        <h2>回复 ({topic.replies.length})</h2>
        {topic.replies.length === 0 ? (
          <p>暂无回复。</p>
        ) : (
          <ul>
            {topic.replies.map((r) => (
              <li key={r.id}>
                <strong>{r.author.name}</strong>: {r.content}
              </li>
            ))}
          </ul>
        )}
        <ReplyForm topicId={topic.id} />
      </section>
      <p>
        <Link href="/forum">← back to forum</Link>
      </p>
    </article>
  );
}
