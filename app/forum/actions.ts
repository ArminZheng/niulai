"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canWrite } from "@/lib/auth";
import { requireText, TITLE_MAX, CONTENT_MAX, type FormState } from "@/lib/validation";
import { slugify } from "@/lib/slug";

// Create a forum topic. Auth is a placeholder gate (lib/auth.ts) — open until
// GitHub OAuth2 lands. Validation is server-side only (CLAUDE.md §24): the
// client `required` attributes are a convenience, not the boundary.
export async function createTopic(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await canWrite())) return { message: "需要登录才能发帖。" };
  const user = await getCurrentUser();
  if (!user) return { message: "未找到默认作者,请确认数据库已初始化。" };

  const title = requireText(formData.get("title"), "标题", TITLE_MAX);
  const content = requireText(formData.get("content"), "正文", CONTENT_MAX);
  const errors: Record<string, string[]> = {};
  if (title.errors) errors.title = title.errors;
  if (content.errors) errors.content = content.errors;
  if (Object.keys(errors).length > 0) return { errors };

  // Topics route by id; the slug only needs to be unique. The tail avoids a
  // collision round-trip.
  const slug = `${slugify(title.value) || "topic"}-${Date.now().toString(36)}`;

  let topic: { id: string } | null = null;
  try {
    topic = await prisma.topic.create({
      data: { title: title.value, slug, content: content.value, authorId: user.id },
      select: { id: true },
    });
  } catch (err) {
    // Preserve detail server-side (§25); show the user a clean message.
    console.error("createTopic failed:", err);
    return { message: "发布失败,请稍后重试。" };
  }

  revalidatePath("/forum");
  redirect(`/forum/${topic.id}`);
}

// Reply to a topic. The topicId comes from a hidden field, so it is re-checked
// against the DB before writing — never trust client-supplied ids.
export async function createReply(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await canWrite())) return { message: "需要登录才能回复。" };
  const user = await getCurrentUser();
  if (!user) return { message: "未找到默认作者,请确认数据库已初始化。" };

  const topicId = String(formData.get("topicId") ?? "");
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { id: true } });
  if (!topic) return { message: "话题不存在或已被删除。" };

  const content = requireText(formData.get("content"), "回复", CONTENT_MAX);
  if (content.errors) return { errors: { content: content.errors } };

  try {
    await prisma.reply.create({
      data: { content: content.value, topicId: topic.id, authorId: user.id },
    });
  } catch (err) {
    console.error("createReply failed:", err);
    return { message: "回复失败,请稍后重试。" };
  }

  revalidatePath(`/forum/${topicId}`);
  redirect(`/forum/${topicId}`);
}

// Hard delete. Replies go with it via the schema's onDelete: Cascade; the
// client form shows a native confirm before this runs.
export async function deleteTopic(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await canWrite())) return { message: "需要登录才能删除。" };

  const id = String(formData.get("id") ?? "");
  const topic = await prisma.topic.findUnique({ where: { id }, select: { id: true } });
  if (!topic) return { message: "话题不存在或已被删除。" };

  try {
    await prisma.topic.delete({ where: { id: topic.id } });
  } catch (err) {
    console.error("deleteTopic failed:", err);
    return { message: "删除失败,请稍后重试。" };
  }

  revalidatePath("/forum");
  redirect("/forum");
}

// The replyId comes from a hidden field, so the row is re-fetched before
// deleting — never trust client-supplied ids.
export async function deleteReply(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await canWrite())) return { message: "需要登录才能删除。" };

  const replyId = String(formData.get("replyId") ?? "");
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: { id: true, topicId: true },
  });
  if (!reply) return { message: "回复不存在或已被删除。" };

  try {
    await prisma.reply.delete({ where: { id: reply.id } });
  } catch (err) {
    console.error("deleteReply failed:", err);
    return { message: "删除失败,请稍后重试。" };
  }

  revalidatePath(`/forum/${reply.topicId}`);
  redirect(`/forum/${reply.topicId}`);
}
