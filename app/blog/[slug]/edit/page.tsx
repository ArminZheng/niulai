import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";
import { PostForm } from "@/components/blog/PostForm";
import { deletePost } from "@/app/blog/actions";
import { DeleteButton } from "@/components/DeleteButton";

export const metadata = { title: "edit post — niulai" };

// Drafts are editable too, so unlike the public post page this loads any status.
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await withReadRetry(() => prisma.post.findUnique({ where: { slug } }));
  if (!post) {
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
