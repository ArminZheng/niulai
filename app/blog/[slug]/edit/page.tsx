import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";
import { getCurrentUser, canManage } from "@/lib/auth";
import { PostForm } from "@/components/blog/PostForm";
import { deletePost } from "@/app/blog/actions";
import { DeleteButton } from "@/components/DeleteButton";

export const metadata = { title: "edit post — niulai" };

// Drafts are editable too, so unlike the public post page this loads any status.
// Only the author (or an admin) may see the edit surface at all — the
// updatePost/deletePost actions re-check this server-side.
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [user, post] = await Promise.all([
    getCurrentUser(),
    withReadRetry(() => prisma.post.findUnique({ where: { slug } })),
  ]);
  if (!post || !canManage(user, post.authorId)) {
    notFound();
  }

  return (
    <article>
      <h1>edit post</h1>
      <PostForm post={post} />
      <hr />
      <DeleteButton
        action={deletePost}
        fields={{ id: post.id }}
        confirmText={`删除「${post.title}」?评论将一并删除,不可恢复。`}
        label="删除文章"
      />
      <p>
        {/* Drafts/archived have no public post page — always return to the list. */}
        <Link href="/blog">← back to blog</Link>
      </p>
    </article>
  );
}
