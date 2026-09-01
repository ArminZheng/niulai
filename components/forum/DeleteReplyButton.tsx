"use client";

import { useActionState } from "react";
import { deleteReply } from "@/app/forum/actions";

// Inline per-reply hard delete behind a native confirm.
export function DeleteReplyButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteReply, {});

  return (
    <form
      action={formAction}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm("删除这条回复?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="replyId" value={id} />
      <button type="submit" disabled={pending}>
        {pending ? "删除中…" : "删除"}
      </button>
      {state.message ? <small> {state.message}</small> : null}
    </form>
  );
}
