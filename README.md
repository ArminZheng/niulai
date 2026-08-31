# niulai

个人博客 + 小论坛,基于 Next.js 的单应用。Unix 风格、内容优先、服务端优先。

## 技术栈

- Next.js (App Router) · React · TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL (Supabase) — 待接入
- pnpm · Vercel

## 本地开发

```bash
git clone <repo-url> niulai
cd niulai
pnpm install
cp .env.example .env.local   # 先空着也行,数据层未接入时
pnpm dev
```

默认 http://localhost:3000。

## 目录

- `app/` — App Router 路由(首页、blog、forum、about)
- `components/` — React 组件
- `lib/` — 共享工具与数据访问层
- `prisma/` — Prisma schema 与迁移(待填充)
- `docs/` — 架构与部署说明
- `public/` — 静态资源

详见 `CLAUDE.md` 的项目级约定与 `docs/`。
