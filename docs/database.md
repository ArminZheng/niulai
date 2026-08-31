# 数据库

Prisma 7 + PostgreSQL(Supabase)。Prisma 7 把连接串从 `schema.prisma` 移出,改由 `prisma.config.ts`(CLI/migrate)和 `lib/prisma.ts`(运行时,driver adapter)持有。

## 模型

`User` / `Post`(draft·published·archived)/ `Comment` / `Topic` / `Reply`。详见 `prisma/schema.prisma`。无聊 schema,显式关系,索引只服务实际查询(列表排序、按文章/话题取评论)。

## 连接串

Supabase 给两套:

- `DATABASE_URL` — pooler 6543 端口,事务模式 + pgbouncer,运行时查询用。带 `&pgbouncer=true&connection_limit=1`。
- `DIRECT_URL` — pooler 5432 端口(或直连 `db.<ref>.supabase.co`),session 模式,migrate/introspect 用,绕过 pgbouncer。

两者都放 `.env`(本地,已 gitignore)。Vercel 在项目 Settings → Environment Variables 里配同名变量。

## 初始化(手动 SQL)

不依赖 Vercel 跑 migrate,而是一个文件手跑:

1. 打开 Supabase 项目 → SQL Editor。
2. 粘贴 `db/init.sql`(含建表 DDL + 幂等 seed)→ Run。
3. 之后改 schema:`prisma/schema.prisma` → `pnpm db:sql` 重新生成 DDL → 同步进 `db/init.sql` → 在 Supabase 手动执行增量。

## 本地命令

```bash
pnpm prisma generate        # 生成 client(离线,不需连库)
pnpm db:sql                 # 从 schema 重新生成建表 SQL(输出到 stdout)
pnpm typecheck
pnpm build                  # = prisma generate && next build
```

`prisma migrate dev`/`db pull` 需要连库(`DIRECT_URL`);本地若有代理拦截 PG 端口会连不上,用上面的手动 SQL 路径即可。

## 运行时

`lib/prisma.ts` 用 `@prisma/adapter-pg` 实例化 `PrismaClient`,dev 下走单例避免热重载打满连接池。Server Component 直接 `import { prisma }` 查询;不从浏览器直连数据库(CLAUDE.md §5)。

## 认证

本次未接。`User` 表已建,种入一个 `ADMIN` owner 作为内容作者;登录/注册与访客发帖/评论留待后续。
