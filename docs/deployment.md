# 部署

目标流程:

```
git push → GitHub → Vercel → Next.js → Supabase
```

## 步骤

1. 在 GitHub 创建空仓库(不加 README / .gitignore,本仓库已自带)。
2. 本地添加远端并推送:
   ```bash
   git remote add origin git@github.com:<user>/niulai.git
   git push -u origin main
   ```
3. 在 Vercel 导入该 GitHub 仓库。框架预设自动识别为 Next.js。
4. 在 Vercel 项目设置中配置环境变量(同 `.env.example`,值填 Supabase 连接串)。
5. Supabase:新建项目 → 取得 PostgreSQL 连接串 → 填入 `DATABASE_URL`。

## 约束

- 免费 tier:Vercel Hobby + Supabase Free + GitHub Free。
- 不引入 VPS / Docker / Nginx(见 CLAUDE.md §32)。
