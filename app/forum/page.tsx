import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Content lives in the DB and changes on write — render per request, never at build.
export const dynamic = "force-dynamic";

export const metadata = { title: "forum — niulai" };

export default async function ForumListPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { replies: true } } },
  });

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
    </article>
  );
}
