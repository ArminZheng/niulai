import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "niulai",
  description: "个人博客与小论坛 — 内容优先,工具风格。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header>
          <nav>
            <a href="/">home</a>{" · "}
            <a href="/blog">blog</a>{" · "}
            <a href="/forum">forum</a>{" · "}
            <a href="/about">about</a>
          </nav>
          <hr />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
