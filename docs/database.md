# 数据库

数据层待接入。计划栈:Prisma + PostgreSQL(Supabase)。

初步领域模型(参见 CLAUDE.md §7–§10):

- User
- Post (博客文章:draft / published / archived)
- Comment (属于 User + Post)
- Topic (论坛话题)
- Reply (论坛回复)

本次初始化只建空目录占位(`prisma/.gitkeep`),不写 schema、不装依赖。
接入时:

```bash
pnpm add prisma @prisma/client -D
pnpm prisma init
# 编辑 prisma/schema.prisma
pnpm prisma migrate dev --name init
```

迁移文件须提交到仓库。
