// Plain-text length checks for Server Actions. No schema library — the project
// keeps dependencies low (CLAUDE.md §31), and these few rules cover every
// write path. When GitHub OAuth2 lands, extend here rather than scattering
// manual checks across actions (§24: validate near the server boundary).

export const TITLE_MAX = 200;
export const CONTENT_MAX = 20000;
export const EXCERPT_MAX = 500;
export const SLUG_MAX = 60;

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

// Like requireText, but empty is allowed (returns "").
export function optionalText(
  value: FormDataEntryValue | null,
  field: string,
  max: number,
): FieldResult {
  const v = String(value ?? "").trim();
  if (v.length > max) return { value: "", errors: [`${field}不能超过 ${max} 个字符`] };
  return { value: v };
}

// Slugs are URL path segments: lowercase ascii words joined by single dashes.
// CJK titles slugify to "", so the form must let the author type one by hand.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function requireSlug(value: FormDataEntryValue | null): FieldResult {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return { value: "", errors: ["slug 不能为空(中文标题请手动输入)"] };
  if (v.length > SLUG_MAX) return { value: "", errors: [`slug 不能超过 ${SLUG_MAX} 个字符`] };
  if (!SLUG_PATTERN.test(v)) {
    return { value: "", errors: ["slug 只能包含小写字母、数字和连字符"] };
  }
  // /blog/new is a real route; a post with this slug would be unreachable.
  if (v === "new") return { value: "", errors: ["slug 不能使用保留字 new"] };
  return { value: v };
}

// Chinese labels for post statuses — single source for the list filter,
// the table cell, and the edit form's status select.
export const STATUS_LABEL: Record<"DRAFT" | "PUBLISHED" | "ARCHIVED", string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档",
};
