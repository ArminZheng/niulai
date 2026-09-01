"use client";

import { useActionState } from "react";
import { createTopic } from "@/app/forum/actions";
import type { FormState } from "@/lib/validation";

// Client form for creating a forum topic. Needs client state only to show
// validation errors and a pending state (CLAUDE.md §4) — the action and
// validation live on the server. Uncontrolled inputs keep the user's text
// across a validation-error re-render.
export function TopicForm() {
  const [state, formAction, pending] = useActionState(createTopic, {});

  return (
    <form action={formAction}>
      <p>
        <label htmlFor="title">标题</label>
        <br />
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          required
          disabled={pending}
          style={{ width: "100%" }}
        />
      </p>
      {state.errors?.title?.[0] ? (
        <p>
          <small>{state.errors.title[0]}</small>
        </p>
      ) : null}
      <p>
        <label htmlFor="content">正文</label>
        <br />
        <textarea
          id="content"
          name="content"
          rows={10}
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
          {pending ? "发布中…" : "发布"}
        </button>
      </p>
    </form>
  );
}
