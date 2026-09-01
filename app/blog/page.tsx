import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";

// Content lives in the DB and changes on write — render per request, never at build.
export const dynamic = "force-dynamic";

export const metadata = { title: "blog — niulai" };

const PAGE_SIZE = 20;

// Status is a query dimension, not a hard-coded gate. Default PUBLISHED is the
// public reading view; the other values let the owner manage drafts/archives
// until real auth lands (CLAUDE.md §11).
const STATUS_FILTERS = ["PUBLISHED", "DRAFT", "ARCHIVED", "ALL"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_LABELS: Record<StatusFilter, string> = {
  PUBLISHED: "已发布",
  DRAFT: "草稿",
  ARCHIVED: "已归档",
  ALL: "全部",
};

// searchParams values may repeat (?q=a&q=b); the first one wins.
function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

// Canonical links: omit params at their defaults so URLs stay short.
function pageQuery(q: string, status: StatusFilter, page: number): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status !== "PUBLISHED") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const statusParam = first(sp.status).toUpperCase();
  const status: StatusFilter = (STATUS_FILTERS as readonly string[]).includes(statusParam)
    ? (statusParam as StatusFilter)
    : "PUBLISHED";
  const page = Math.max(1, parseInt(first(sp.page), 10) || 1);

  const where: Prisma.PostWhereInput = {
    ...(status !== "ALL" ? { status } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  // Count first so an out-of-range page can be clamped instead of rendering
  // an empty table with no explanation.
  const total = await withReadRetry(() => prisma.post.count({ where }));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) {
    redirect(`/blog?${pageQuery(q, status, totalPages)}`);
  }

  const posts = await withReadRetry(() =>
    prisma.post.findMany({
      where,
      orderBy: [
        // Drafts have no publishedAt; sink them explicitly rather than rely on
        // Postgres DESC-NULLS-FIRST, which would float them above real posts.
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { comments: true } } },
    }),
  );

  return (
    <article>
      <h1>blog</h1>
      {/* GET form: a new query resets to page 1 by simply not carrying page. */}
      <form method="get" action="/blog">
        <input type="search" name="q" defaultValue={q} placeholder="搜索标题" />
        <select name="status" defaultValue={status} aria-label="状态">
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit">查询</button>
      </form>
      {posts.length === 0 ? (
        <p>没有匹配的文章。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>标题</th>
              <th>状态</th>
              <th>发布时间</th>
              <th>评论</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </td>
                <td>{STATUS_LABELS[post.status]}</td>
                <td>{post.publishedAt?.toLocaleDateString("zh-CN") ?? "—"}</td>
                <td>{post._count.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <nav aria-label="分页">
        {page > 1 ? (
          <>
            <Link href={`/blog?${pageQuery(q, status, page - 1)}`}>← 上一页</Link>{" "}
          </>
        ) : null}
        第 {page} / {totalPages} 页 · 共 {total} 条
        {page < totalPages ? (
          <>
            {" "}
            <Link href={`/blog?${pageQuery(q, status, page + 1)}`}>下一页 →</Link>
          </>
        ) : null}
      </nav>
    </article>
  );
}
