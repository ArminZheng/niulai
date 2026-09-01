"use client";

import { useActionState, useState } from "react";
import { createPost, updatePost } from "@/app/blog/actions";
import { slugify } from "@/lib/slug";
import { TITLE_MAX, EXCERPT_MAX, STATUS_LABEL } from "@/lib/validation";

const STATUS_OPTIONS = Object.entries(STATUS_LABEL);

// First validation message for a field, if any.
function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? (
    <p>
      <small>{messages[0]}</small>
    </p>
  ) : null;
}

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
      <FieldError messages={state.errors?.title} />
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
      <FieldError messages={state.errors?.slug} />
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
      <FieldError messages={state.errors?.excerpt} />
      <p>
        <label htmlFor="post-status">状态</label>
        <br />
        <select id="post-status" name="status" defaultValue={post?.status ?? "DRAFT"} disabled={pending}>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </p>
      <FieldError messages={state.errors?.status} />
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
      <FieldError messages={state.errors?.content} />
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
