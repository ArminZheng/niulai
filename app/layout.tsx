import type { ReactNode } from "react";
import { getCurrentUser, getView } from "@/lib/auth";
import { getTheme } from "@/lib/theme";
import { toggleView, toggleTheme } from "@/app/actions";
import "./globals.css";

export const metadata = {
  title: "niulai",
  description: "个人博客与小论坛 — 内容优先,工具风格。",
};

// The header reads the simulated-identity cookie (lib/auth.ts), so the layout
// renders per request rather than at build time.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const view = await getView();
  const user = await getCurrentUser();
  const theme = await getTheme();
  return (
    <html lang="zh-CN" data-theme={theme === "dark" ? "dark" : undefined}>
      <body>
        <header>
          <nav>
            <a href="/">home</a>
            {" · "}
            <a href="/blog">blog</a>
            {" · "}
            <a href="/forum">forum</a>
            {" · "}
            <a href="/about">about</a>
            <span style={{ float: "right" }}>
              {user?.name ?? "未初始化"}{" "}
              <form action={toggleView} style={{ display: "inline" }}>
                <button type="submit">视角:{view === "admin" ? "管理员" : "访客"}</button>
              </form>{" "}
              <form action={toggleTheme} style={{ display: "inline" }}>
                <button type="submit">主题:{theme === "dark" ? "暗" : "亮"}</button>
              </form>
            </span>
          </nav>
          <hr />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
