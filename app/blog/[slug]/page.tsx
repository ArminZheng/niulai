import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "blog — niulai" };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>
        <small>
          by {post.author.name} ·{" "}
          {post.publishedAt?.toLocaleDateString("zh-CN")}
        </small>
      </p>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
        {post.content}
      </pre>
      <section>
        <h2>评论 ({post.comments.length})</h2>
        {post.comments.length === 0 ? (
          <p>暂无评论。</p>
        ) : (
          <ul>
            {post.comments.map((c) => (
              <li key={c.id}>
                <strong>{c.author.name}</strong>: {c.content}
              </li>
            ))}
          </ul>
        )}
        <p>
          <small>评论需登录(待接入认证)。</small>
        </p>
      </section>
      <p>
        <Link href="/blog">← back to blog</Link>
      </p>
    </article>
  );
}
