import Link from "next/link";
import { TopicForm } from "@/components/forum/TopicForm";

export default function NewTopicPage() {
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
