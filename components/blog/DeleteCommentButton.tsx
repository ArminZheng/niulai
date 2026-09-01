"use client";

import { useActionState } from "react";
import { deleteComment } from "@/app/blog/actions";

// Inline per-comment hard delete behind a native confirm.
export function DeleteCommentButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteComment, {});

  return (
    <form
      action={formAction}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm("删除这条评论?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="commentId" value={id} />
      <button type="submit" disabled={pending}>
        {pending ? "删除中…" : "删除"}
      </button>
      {state.message ? <small> {state.message}</small> : null}
    </form>
  );
}
