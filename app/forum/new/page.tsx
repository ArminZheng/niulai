import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, canWrite } from "@/lib/auth";
import { TopicForm } from "@/components/forum/TopicForm";

// Any authenticated identity may post a topic; the createTopic action re-checks.
export default async function NewTopicPage() {
  const user = await getCurrentUser();
  if (!canWrite(user)) {
    notFound();
  }

  return (
    <article>
      <h1>new topic</h1>
      <TopicForm />
      <p>
        <Link href="/forum">← back to forum</Link>
      </p>
    </article>
  );
}
