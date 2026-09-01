"use client";

import { useActionState } from "react";
import { deletePost } from "@/app/blog/actions";

// Hard delete behind a native confirm; comments cascade (schema onDelete).
export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const [state, formAction, pending] = useActionState(deletePost, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`删除「${title}」?评论将一并删除,不可恢复。`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending}>
        {pending ? "删除中…" : "删除文章"}
      </button>
      {state.message ? <small> {state.message}</small> : null}
    </form>
  );
}
