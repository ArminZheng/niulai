import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withReadRetry } from "@/lib/retry";
import { PostForm } from "@/components/blog/PostForm";
import { DeletePostButton } from "@/components/blog/DeletePostButton";

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
      <DeletePostButton id={post.id} title={post.title} />
      <p>
        <Link href={`/blog/${post.slug}`}>← back to post</Link>
      </p>
    </article>
  );
}
