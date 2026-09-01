import Link from "next/link";

// Bottom pagination shared by every list view. hrefFor builds the canonical
// URL for a target page, so each list keeps its own filters in the links.
export function PaginationNav({
  page,
  totalPages,
  total,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  total: number;
  hrefFor: (page: number) => string;
}) {
  return (
    <nav aria-label="分页">
      {page > 1 ? (
        <>
          <Link href={hrefFor(page - 1)}>← 上一页</Link>{" "}
        </>
      ) : null}
      第 {page} / {totalPages} 页 · 共 {total} 条
      {page < totalPages ? (
        <>
          {" "}
          <Link href={hrefFor(page + 1)}>下一页 →</Link>
        </>
      ) : null}
    </nav>
  );
}
