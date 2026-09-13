import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";

// A unified feed entry mixing blog posts and forum topics, so the home page
// can render one interleaved stream instead of two separate lists.
export type FeedItem = {
  kind: "post" | "topic";
  id: string;
  title: string;
  href: string;
  excerpt: string | null;
  author: string;
  at: Date;
  statCount: number; // comments for a post, replies for a topic
  statLabel: string;
};

export type FeedStrategy = "random" | "latest";

// Extension point for recommendation. Today it is random/latest sampling over
// published posts + all topics; a real ranking (score by recency, engagement,
// per-user taste) slots in here without the home page changing. Keep the
// return shape stable and the caller never cares which strategy produced it.
export async function getHomeFeed(
  limit = 15,
  strategy: FeedStrategy = "random",
): Promise<FeedItem[]> {
  const [posts, topics] = await Promise.all([
    withReadRetry(() =>
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
          createdAt: true,
          author: { select: { name: true } },
          _count: { select: { comments: true } },
        },
      }),
    ),
    withReadRetry(() =>
      prisma.topic.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: { select: { name: true } },
          _count: { select: { replies: true } },
        },
      }),
    ),
  ]);

  const items: FeedItem[] = [
    ...posts.map((p) => ({
      kind: "post" as const,
      id: p.id,
      title: p.title,
      href: `/blog/${p.slug}`,
      excerpt: p.excerpt,
      author: p.author.name,
      at: p.publishedAt ?? p.createdAt,
      statCount: p._count.comments,
      statLabel: "评论",
    })),
    ...topics.map((t) => ({
      kind: "topic" as const,
      id: t.id,
      title: t.title,
      href: `/forum/${t.id}`,
      excerpt: null,
      author: t.author.name,
      at: t.createdAt,
      statCount: t._count.replies,
      statLabel: "回复",
    })),
  ];

  if (strategy === "latest") {
    items.sort((a, b) => b.at.getTime() - a.at.getTime());
  } else {
    shuffle(items);
  }
  return items.slice(0, limit);
}

// Fisher–Yates; good enough at feed sizes, and seedable later if a stable
// per-visitor order is wanted.
function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
}
