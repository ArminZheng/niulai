# 架构

```
Browser
   |
   v
Next.js (Vercel)
   |
   +-- Server Components
   +-- Server Actions / Route Handlers
   v
Prisma
   v
PostgreSQL (Supabase)
```

Next.js 即 BFF,不引入独立后端服务。默认服务端渲染(Server Components),
仅当浏览器确需交互时才用 Client Components。数据访问经 Server Component /
Server Action / Route Handler → Prisma,不从浏览器直连数据库。

详见 `CLAUDE.md` §3–§5。
