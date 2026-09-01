"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canWrite } from "@/lib/auth";
import {
  requireText,
  optionalText,
  requireSlug,
  TITLE_MAX,
  CONTENT_MAX,
  EXCERPT_MAX,
  type FormState,
} from "@/lib/validation";

// Prisma P2002 = unique constraint violation. On Post the only user-supplied
// unique field is the slug, so this maps straight to a slug field error.
function isUniqueSlugError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

// A select constrains this in practice; anything else is a crafted request,
// which earns an early return rather than a collected-error pass.
function parseStatus(value: FormDataEntryValue | null): PostStatus | null {
  const v = String(value ?? "").toUpperCase();
  return v === "DRAFT" || v === "PUBLISHED" || v === "ARCHIVED" ? v : null;
}

// Comment on a blog post. The slug comes from a hidden field and is re-checked
// against the DB (published posts only) before writing — never trust the client.
export async function createComment(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await canWrite())) return { message: "需要登录才能评论。" };
  const user = await getCurrentUser();
  if (!user) return { message: "未找到默认作者,请确认数据库已初始化。" };

  const slug = String(formData.get("slug") ?? "");
  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true, status: true } });
  if (!post || post.status !== "PUBLISHED") return { message: "文章不存在或不可评论。" };

  const content = requireText(formData.get("content"), "评论", CONTENT_MAX);
  if (content.errors) return { errors: { content: content.errors } };

  try {
    await prisma.comment.create({
      data: { content: content.value, postId: post.id, authorId: user.id },
    });
  } catch (err) {
    console.error("createComment failed:", err);
    return { message: "评论失败,请稍后重试。" };
  }

  revalidatePath(`/blog/${slug}`);
  redirect(`/blog/${slug}`);
}

// Create a blog post. Slug uniqueness is enforced by the DB constraint, not a
// check-then-insert round-trip (which races anyway); P2002 becomes a field error.
export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await canWrite())) return { message: "需要登录才能发文。" };
  const user = await getCurrentUser();
  if (!user) return { message: "未找到默认作者,请确认数据库已初始化。" };

  const status = parseStatus(formData.get("status"));
  if (!status) return { errors: { status: ["状态无效"] } };

  const title = requireText(formData.get("title"), "标题", TITLE_MAX);
  const slug = requireSlug(formData.get("slug"));
  const content = requireText(formData.get("content"), "正文", CONTENT_MAX);
  const excerpt = optionalText(formData.get("excerpt"), "摘要", EXCERPT_MAX);
  const errors: Record<string, string[]> = {};
  if (title.errors) errors.title = title.errors;
  if (slug.errors) errors.slug = slug.errors;
  if (content.errors) errors.content = content.errors;
  if (excerpt.errors) errors.excerpt = excerpt.errors;
  if (Object.keys(errors).length > 0) return { errors };

  try {
    await prisma.post.create({
      data: {
        title: title.value,
        slug: slug.value,
        content: content.value,
        excerpt: excerpt.value || null,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
      },
    });
  } catch (err) {
    if (isUniqueSlugError(err)) return { errors: { slug: ["slug 已存在,请换一个"] } };
    console.error("createPost failed:", err);
    return { message: "发布失败,请稍后重试。" };
  }

  revalidatePath("/blog");
  // Drafts have no public detail page — land back on the edit page instead.
  redirect(status === "PUBLISHED" ? `/blog/${slug.value}` : `/blog/${slug.value}/edit`);
}

// Update a post. The id comes from a hidden field, so the row is re-fetched
// before writing — never trust client-supplied ids. First publish stamps
// publishedAt; unpublishing keeps it so a later republish doesn't rewrite history.
export async function updatePost(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await canWrite())) return { message: "需要登录才能编辑。" };

  const id = String(formData.get("id") ?? "");
  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, slug: true, publishedAt: true },
  });
  if (!post) return { message: "文章不存在或已被删除。" };

  const status = parseStatus(formData.get("status"));
  if (!status) return { errors: { status: ["状态无效"] } };

  const title = requireText(formData.get("title"), "标题", TITLE_MAX);
  const slug = requireSlug(formData.get("slug"));
  const content = requireText(formData.get("content"), "正文", CONTENT_MAX);
  const excerpt = optionalText(formData.get("excerpt"), "摘要", EXCERPT_MAX);
  const errors: Record<string, string[]> = {};
  if (title.errors) errors.title = title.errors;
  if (slug.errors) errors.slug = slug.errors;
  if (content.errors) errors.content = content.errors;
  if (excerpt.errors) errors.excerpt = excerpt.errors;
  if (Object.keys(errors).length > 0) return { errors };

  try {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        title: title.value,
        slug: slug.value,
        content: content.value,
        excerpt: excerpt.value || null,
        status,
        publishedAt: status === "PUBLISHED" ? (post.publishedAt ?? new Date()) : post.publishedAt,
      },
    });
  } catch (err) {
    if (isUniqueSlugError(err)) return { errors: { slug: ["slug 已存在,请换一个"] } };
    console.error("updatePost failed:", err);
    return { message: "保存失败,请稍后重试。" };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  // Same rule as createPost: unpublished posts live at their edit URL.
  redirect(status === "PUBLISHED" ? `/blog/${slug.value}` : `/blog/${slug.value}/edit`);
}

// Hard delete. Comments go with it via the schema's onDelete: Cascade; the
// client form shows a native confirm before this runs.
export async function deletePost(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await canWrite())) return { message: "需要登录才能删除。" };

  const id = String(formData.get("id") ?? "");
  const post = await prisma.post.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!post) return { message: "文章不存在或已被删除。" };

  try {
    await prisma.post.delete({ where: { id: post.id } });
  } catch (err) {
    console.error("deletePost failed:", err);
    return { message: "删除失败,请稍后重试。" };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  redirect("/blog");
}
