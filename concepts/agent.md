---
summary: "OpenClaw Agent 运行时概述"
read_when:
  - 你想了解 Agent 的工作原理
  - 你需要配置工作区和引导文件
  - 你在设置技能或会话
---

# Agent 运行时

本文档描述 OpenClaw 的嵌入式 Agent 运行时，它源自 **pi-mono**。

## 核心组件

### 工作区（Workspace）

OpenClaw 需要一个通过 `agents.defaults.workspace` 配置的工作区目录。这是"Agent 用于工具和上下文的**唯一**工作目录（`cwd`）"。

### 引导文件（Bootstrap Files）

工作区需要几个用户可编辑的 Markdown 文件，这些文件会在第一轮对话时注入到 Agent 上下文中：

- **AGENTS.md** — 操作指令和记忆
- **SOUL.md** — 人格、边界、语气
- **TOOLS.md** — 工具使用的用户说明
- **BOOTSTRAP.md** — 一次性首次运行仪式（运行后自动删除）
- **IDENTITY.md** — Agent 名称/风格/表情符号
- **USER.md** — 用户个人资料信息

空白文件会被跳过，大文件会被截断并添加截断标记。

### 技能加载（Skills Loading）

技能从三个位置加载，工作区在冲突时优先：

1. 内置（随安装包提供）
2. 托管/本地：`~/.openclaw/skills`
3. 工作区：`<workspace>/skills`

### 会话（Sessions）

对话记录以 JSONL 文件形式存储在 `~/.openclaw/agents/<agentId>/sessions/<SessionId>.jsonl`。旧版 Pi/Tau 会话文件夹不会被读取。

### 流式行为（Streaming Behavior）

运行时支持不同的队列模式（`steer`、`followup`、`collect`）来处理流式传输期间的入站消息。块流式传输默认关闭。

### 最小配置

至少需要设置：

- `agents.defaults.workspace`
- `channels.whatsapp.allowFrom`（推荐）
