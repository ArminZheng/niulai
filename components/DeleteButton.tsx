"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/validation";

// One confirm-gated delete button for every entity. The server action and its
// hidden fields are passed in from a server component; `inline` keeps the form
// inside a list row's text flow instead of breaking to a new line.
export function DeleteButton({
  action,
  fields,
  confirmText,
  label,
  inline,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Record<string, string>;
  confirmText: string;
  label: string;
  inline?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      style={inline ? { display: "inline" } : undefined}
      onSubmit={(e) => {
        if (!confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" disabled={pending}>
        {pending ? "删除中…" : label}
      </button>
      {state.message ? <small> {state.message}</small> : null}
    </form>
  );
}
