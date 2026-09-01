"use client";

import { useActionState } from "react";
import { createReply } from "@/app/forum/actions";
import type { FormState } from "@/lib/validation";

// Client form for replying to a topic. topicId is a public id passed in a
// hidden field; the action re-verifies the topic exists server-side.
export function ReplyForm({ topicId }: { topicId: string }) {
  const [state, formAction, pending] = useActionState(createReply, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="topicId" value={topicId} />
      <p>
        <label htmlFor="reply-content">回复</label>
        <br />
        <textarea
          id="reply-content"
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
          {pending ? "发送中…" : "回复"}
        </button>
      </p>
    </form>
  );
}
