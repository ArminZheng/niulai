// Plain-text length checks for Server Actions. No schema library — the project
// keeps dependencies low (CLAUDE.md §31), and these few rules cover every
// write path. When GitHub OAuth2 lands, extend here rather than scattering
// manual checks across actions (§24: validate near the server boundary).

export const TITLE_MAX = 200;
export const CONTENT_MAX = 20000;

// Shape returned by every write Server Action, consumed by `useActionState` in
// the client forms. `errors` maps a field name → messages; `message` is a
// top-level error (auth / not-found) with no field to attach to.
export type FormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

// Result of a single field check. `value` is the trimmed text when valid (empty
// string on failure); `errors` is present only when the check failed. A plain
// object rather than a discriminated union keeps the collect-all-errors call
// sites type-safe without narrowing gymnastics (CLAUDE.md §35: boring TS).
export type FieldResult = {
  value: string;
  errors?: string[];
};

// Trim, reject empty, cap at max. `field` is the human label used in messages.
export function requireText(
  value: FormDataEntryValue | null,
  field: string,
  max: number,
): FieldResult {
  const v = String(value ?? "").trim();
  if (!v) return { value: "", errors: [`${field}不能为空`] };
  if (v.length > max) return { value: "", errors: [`${field}不能超过 ${max} 个字符`] };
  return { value: v };
}
