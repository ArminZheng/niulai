"use client";

import { useActionState } from "react";
import { deleteTopic } from "@/app/forum/actions";

// Hard delete behind a native confirm; replies cascade (schema onDelete).
export function DeleteTopicButton({ id, title }: { id: string; title: string }) {
  const [state, formAction, pending] = useActionState(deleteTopic, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`删除「${title}」?回复将一并删除,不可恢复。`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending}>
        {pending ? "删除中…" : "删除话题"}
      </button>
      {state.message ? <small> {state.message}</small> : null}
    </form>
  );
}
