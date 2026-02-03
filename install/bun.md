---
summary: "使用 Bun 运行 OpenClaw（实验性）"
read_when:
  - 你想使用 Bun 作为运行时
  - 你在调试 Bun 相关问题
---

# Bun（实验性）

本文档介绍使用 Bun 作为 OpenClaw 仓库的可选运行时。目标是"在不偏离 pnpm 工作流的情况下"使用 Bun 运行仓库。

**重要警告：** 由于 WhatsApp/Telegram 存在 bug，**不建议将 Bun 用于 Gateway 运行时**。生产环境推荐使用 Node。

## 状态

- Bun 作为可选的本地运行时，用于直接执行 TypeScript
- pnpm 仍然是构建的默认选择，文档工具也使用它
- Bun 会忽略 `pnpm-lock.yaml` 文件

## 安装

**默认安装：**
```sh
bun install
```

**不写入锁文件**（因为 `bun.lock`/`bun.lockb` 在 gitignore 中）：
```sh
bun install --no-save
```

## 构建和测试命令

```sh
bun run build
bun run vitest run
```

## 生命周期脚本

Bun 默认阻止依赖项的生命周期脚本。此仓库中两个常被阻止的脚本通常不是必需的：

- `@whiskeysockets/baileys` preinstall（Node 版本检查）
- `protobufjs` postinstall（版本方案警告）

**如需信任这些脚本：**
```sh
bun pm trust @whiskeysockets/baileys protobufjs
```

## 注意事项

某些脚本仍硬编码为 pnpm，包括 `docs:build`、`ui:*` 和 `protocol:check`。这些应通过 pnpm 而非 Bun 运行。
