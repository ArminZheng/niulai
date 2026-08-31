import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "blog — niulai" };

export default async function BlogListPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { author: true },
  });

  return (
    <article>
      <h1>blog</h1>
      {posts.length === 0 ? (
        <p>暂无文章。</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              {post.excerpt ? ` — ${post.excerpt}` : null}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
