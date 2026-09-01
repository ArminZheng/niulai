"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, canWrite } from "@/lib/auth";
import { requireText, CONTENT_MAX, type FormState } from "@/lib/validation";

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
