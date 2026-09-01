import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, canAuthorPosts } from "@/lib/auth";
import { PostForm } from "@/components/blog/PostForm";

export const metadata = { title: "new post — niulai" };

// Post authoring is AUTHOR/ADMIN only (§11); the createPost action re-checks.
export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!canAuthorPosts(user)) {
    notFound();
  }

  return (
    <article>
      <h1>new post</h1>
      <PostForm />
      <p>
        <Link href="/blog">← back to blog</Link>
      </p>
    </article>
  );
}
