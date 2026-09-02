import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";
import { getCurrentUser, canAuthorPosts, canManage } from "@/lib/auth";
import {
  PAGE_SIZE,
  first,
  pageQuery,
  parsePage,
  skipFor,
  totalPagesFor,
} from "@/lib/pagination";
import { STATUS_LABEL } from "@/lib/validation";
import { PaginationNav } from "@/components/PaginationNav";

// Content lives in the DB and changes on write — render per request, never at build.
export const dynamic = "force-dynamic";

export const metadata = { title: "blog — niulai" };

// Status is a query dimension, not a hard-coded gate. Default PUBLISHED is the
// public reading view; the other values let the owner manage drafts/archives
// until real auth lands (CLAUDE.md §11).
const STATUS_FILTERS = ["PUBLISHED", "DRAFT", "ARCHIVED", "ALL"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  // Non-authors (visitor view, anonymous once OAuth lands) only ever see the
  // public reading view — drafts/archives stay owner-only even if the status
  // param is hand-crafted in the URL.
  const authoring = canAuthorPosts(user);
  const q = first(sp.q).trim();
  const statusParam = first(sp.status).toUpperCase();
  const status: StatusFilter =
    authoring && (STATUS_FILTERS as readonly string[]).includes(statusParam)
      ? (statusParam as StatusFilter)
      : "PUBLISHED";
  const page = parsePage(first(sp.page));

  // Canonical links keep the active filters; pageQuery drops defaults.
  const hrefFor = (p: number) =>
    `/blog${pageQuery(p, { q, status: status === "PUBLISHED" ? "" : status })}`;

  const where: Prisma.PostWhereInput = {
    ...(status !== "ALL" ? { status } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
  };

  // Count and page fetch run in parallel — each round trip to the DB is
  // cross-region, so serializing them doubles the wait. Count must resolve
  // first only in that an out-of-range page redirects instead of rendering.
  const [total, posts] = await Promise.all([
    withReadRetry(() => prisma.post.count({ where })),
    withReadRetry(() =>
      prisma.post.findMany({
        where,
        orderBy: [
          // Drafts have no publishedAt; sink them explicitly rather than rely on
          // Postgres DESC-NULLS-FIRST, which would float them above real posts.
          { publishedAt: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
        ],
        skip: skipFor(page),
        take: PAGE_SIZE,
        include: { _count: { select: { comments: true } } },
      }),
    ),
  ]);
  const totalPages = totalPagesFor(total);
  if (page > totalPages) {
    redirect(hrefFor(totalPages));
  }

  return (
    <article>
      <h1>blog</h1>
      {authoring ? (
        <p>
          <Link href="/blog/new">+ new post</Link>
        </p>
      ) : null}
      {/* GET form: a new query resets to page 1 by simply not carrying page. */}
      <form method="get" action="/blog">
        <input type="search" name="q" defaultValue={q} placeholder="搜索标题" />
        {authoring ? (
          <select name="status" defaultValue={status} aria-label="状态">
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {/* ALL is a filter-only pseudo status, not a real post status. */}
                {s === "ALL" ? "全部" : STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        ) : null}
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
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  {/* Only PUBLISHED posts have a public detail page (drafts and
                   * archived 404 there by design); management rows penetrate to
                   * the edit page instead. */}
                  <Link
                    href={
                      post.status === "PUBLISHED"
                        ? `/blog/${post.slug}`
                        : `/blog/${post.slug}/edit`
                    }
                  >
                    {post.title}
                  </Link>
                </td>
                <td>{STATUS_LABEL[post.status]}</td>
                <td>{post.publishedAt?.toLocaleDateString("zh-CN") ?? "—"}</td>
                <td>{post._count.comments}</td>
                <td>
                  {canManage(user, post.authorId) ? (
                    <Link href={`/blog/${post.slug}/edit`}>edit</Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <PaginationNav page={page} totalPages={totalPages} total={total} hrefFor={hrefFor} />
    </article>
  );
}
