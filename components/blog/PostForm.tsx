"use client";

import { useActionState, useState } from "react";
import { createPost, updatePost } from "@/app/blog/actions";
import { slugify } from "@/lib/slug";
import { TITLE_MAX, EXCERPT_MAX, type FormState } from "@/lib/validation";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "草稿" },
  { value: "PUBLISHED", label: "已发布" },
  { value: "ARCHIVED", label: "已归档" },
] as const;

type PostValues = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
};

// Shared by /blog/new and /blog/[slug]/edit. The slug auto-derives from the
// title until the author edits it by hand; CJK titles slugify to "" and must
// be typed manually (the server re-validates regardless — §24).
export function PostForm({ post }: { post?: PostValues }) {
  const [state, formAction, pending] = useActionState(post ? updatePost : createPost, {});
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));

  return (
    <form action={formAction}>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <p>
        <label htmlFor="post-title">标题</label>
        <br />
        <input
          id="post-title"
          name="title"
          type="text"
          required
          maxLength={TITLE_MAX}
          defaultValue={post?.title}
          disabled={pending}
          style={{ width: "100%" }}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </p>
      {state.errors?.title?.[0] ? (
        <p>
          <small>{state.errors.title[0]}</small>
        </p>
      ) : null}
      <p>
        <label htmlFor="post-slug">slug(URL 路径,中文标题请手动输入)</label>
        <br />
        <input
          id="post-slug"
          name="slug"
          type="text"
          required
          value={slug}
          disabled={pending}
          style={{ width: "100%" }}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
        />
      </p>
      {state.errors?.slug?.[0] ? (
        <p>
          <small>{state.errors.slug[0]}</small>
        </p>
      ) : null}
      <p>
        <label htmlFor="post-excerpt">摘要(可选)</label>
        <br />
        <input
          id="post-excerpt"
          name="excerpt"
          type="text"
          maxLength={EXCERPT_MAX}
          defaultValue={post?.excerpt ?? ""}
          disabled={pending}
          style={{ width: "100%" }}
        />
      </p>
      {state.errors?.excerpt?.[0] ? (
        <p>
          <small>{state.errors.excerpt[0]}</small>
        </p>
      ) : null}
      <p>
        <label htmlFor="post-status">状态</label>
        <br />
        <select id="post-status" name="status" defaultValue={post?.status ?? "DRAFT"} disabled={pending}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </p>
      {state.errors?.status?.[0] ? (
        <p>
          <small>{state.errors.status[0]}</small>
        </p>
      ) : null}
      <p>
        <label htmlFor="post-content">正文(Markdown)</label>
        <br />
        <textarea
          id="post-content"
          name="content"
          rows={20}
          required
          defaultValue={post?.content}
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
          {pending ? "保存中…" : post ? "保存" : "发布"}
        </button>
      </p>
    </form>
  );
}
