"use client";

import { useActionState } from "react";
import { createComment } from "@/app/blog/actions";
import type { FormState } from "@/lib/validation";

// Client form for commenting on a blog post. slug is a public post slug passed
// in a hidden field; the action re-verifies the post exists and is published.
export function CommentForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(createComment, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={slug} />
      <p>
        <label htmlFor="comment-content">评论</label>
        <br />
        <textarea
          id="comment-content"
          name="content"
          rows={5}
          required
          disabled={pending}
          style={{ width: "100%" }}
        />
      </p>
      {state.errors?.content?.[0] ? (
        <p>
          <small>{state.errors.content[0]}</small>
        </p>
      ) : null}
      {state.message ? (
        <p>
          <small>{state.message}</small>
        </p>
      ) : null}
      <p>
        <button type="submit" disabled={pending}>
          {pending ? "发送中…" : "评论"}
        </button>
      </p>
    </form>
  );
}
