import Link from "next/link";
import { PostForm } from "@/components/blog/PostForm";

export const metadata = { title: "new post — niulai" };

export default function NewPostPage() {
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
