---
summary: "OpenProse 工作流格式"
read_when:
  - 你想了解多 Agent 工作流
  - 你需要使用 /prose 命令
  - 你在编排 AI 会话
---

# OpenProse

OpenProse 被描述为"一种可移植的、markdown 优先的工作流格式，用于编排 AI 会话"。它作为 OpenClaw 插件运行，提供技能包和 `/prose` 斜杠命令。程序使用 `.prose` 文件扩展名，支持生成具有定义控制流的多个子 Agent。

## 功能

系统支持：
- 并行执行的多 Agent 研究
- 适用于代码审查、事件分类和内容管道的可重复工作流
- 与各种 Agent 运行时兼容的可重用程序

## 安装

内置插件默认禁用。要启用：

```bash
openclaw plugins enable open-prose
```

启用后需要重启 Gateway。对于本地开发，使用指向 `./extensions/open-prose` 的 install 命令。

## 斜杠命令

`/prose` 命令支持多种操作，包括 `help`、`run`（接受文件、句柄或 URL）、`compile`、`examples` 和 `update`。

## 文件结构

状态维护在 `.prose/` 目录中，包含环境文件、运行历史（按时间戳组织）和 Agent 配置。持久的用户级 Agent 位于 `~/.prose/agents/`。

## 状态后端

有四种模式可用：
- **Filesystem**（默认）
- **In-context** 用于临时的小型程序
- **SQLite**（实验性）
- **Postgres**（实验性）— 注意"postgres 凭据会流入子 Agent 日志"，因此建议使用专用的、权限有限的数据库

## 远程执行

运行 `<handle/slug>` 解析到 prose.md 托管服务。直接 URL 也可以工作，使用 `web_fetch` 工具。

## OpenClaw 集成

OpenProse 概念映射到 OpenClaw 工具：会话使用 `sessions_spawn`，文件操作使用 `read`/`write`，web 请求使用 `web_fetch`。被阻止的工具会导致程序失败。

## 安全

文档建议将".prose 文件视为代码"，建议在执行前审查它们，使用工具允许列表和审批门来控制副作用。
