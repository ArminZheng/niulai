# 本地开发

## 环境要求

- Node.js ≥ 20
- pnpm
- Git

## 流程

```bash
pnpm install
cp .env.example .env.local   # 数据层未接入时可留空
pnpm dev                      # http://localhost:3000
```

## 脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 跑生产构建 |
| `pnpm typecheck` | TypeScript 类型检查 |

macOS 为主开发环境,命令应保持可移植。
