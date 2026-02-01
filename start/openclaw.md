---
summary: "使用 OpenClaw 作为个人助手的端到端指南，包含安全注意事项"
read_when:
  - 配置新的助手实例
  - 审查安全/权限影响
---
# 使用 OpenClaw 构建个人助手

OpenClaw 是一个 **Pi** Agent 的 WhatsApp + Telegram + Discord + iMessage Gateway。插件添加 Mattermost。本指南是"个人助手"设置：一个专用的 WhatsApp 号码，行为类似于你的始终在线的助手。

## ⚠️ 安全第一

你将 Agent 放在可以执行以下操作的位置：
- 在你的机器上运行命令（取决于你的 Pi 工具设置）
- 在工作空间中读/写文件
- 通过 WhatsApp/Telegram/Discord/Mattermost（插件）发回消息

从保守开始：
- 始终设置 `channels.whatsapp.allowFrom`（永远不要在你的个人 Mac 上运行对外开放）。
- 为助手使用专用的 WhatsApp 号码。
- 心跳现在默认每 30 分钟一次。通过设置 `agents.defaults.heartbeat.every: "0m"` 禁用它，直到你信任这个设置。

## 前置条件

- Node **22+**
- OpenClaw 在 PATH 上可用（推荐：全局安装）
- 第二个电话号码（SIM/eSIM/预付费）用于助手

```bash
# 全局安装 OpenClaw
npm install -g openclaw@latest
# 或：pnpm add -g openclaw@latest
```

从源码（开发）：

```bash
# 克隆仓库
git clone https://github.com/openclaw/openclaw.git
cd openclaw
# 安装依赖
pnpm install
# 构建 UI（首次运行自动安装 UI 依赖）
pnpm ui:build
# 构建项目
pnpm build
# 全局链接
pnpm link --global
```

## 双手机设置（推荐）

你想要这样：

```
你的手机（个人）          第二部手机（助手）
┌─────────────────┐           ┌─────────────────┐
│  你的 WhatsApp  │  ──────▶  │  助手 WA        │
│  +1-555-YOU     │  消息     │  +1-555-ASSIST  │
└─────────────────┘           └────────┬────────┘
                                       │ 通过 QR 链接
                                       ▼
                              ┌─────────────────┐
                              │  你的 Mac       │
                              │  (openclaw)      │
                              │    Pi Agent     │
                              └─────────────────┘
```

如果你将个人 WhatsApp 链接到 OpenClaw，发给你的每条消息都变成"Agent 输入"。这很少是你想要的。

## 5 分钟快速开始

1) 配对 WhatsApp Web（显示 QR；用助手手机扫描）：

```bash
# 登录 WhatsApp 频道
openclaw channels login
```

2) 启动 Gateway（保持运行）：

```bash
# 在端口 18789 启动 Gateway
openclaw gateway --port 18789
```

3) 在 `~/.openclaw/openclaw.json` 中放入最小配置：

```json5
{
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}
```

现在从白名单手机向助手号码发送消息。

配置完成时，我们会自动打开 Dashboard 并显示你的 Gateway Token，并打印带 Token 的链接。稍后重新打开：`openclaw dashboard`。

## 给 Agent 一个工作空间（AGENTS）

OpenClaw 从其工作空间目录读取操作说明和"记忆"。

默认情况下，OpenClaw 使用 `~/.openclaw/workspace` 作为 Agent 工作空间，并会在设置/首次 Agent 运行时自动创建它（以及初始的 `AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md`）。`BOOTSTRAP.md` 只在工作空间全新时创建（删除后不应再次出现）。

提示：像对待 OpenClaw 的"记忆"一样对待这个文件夹，并将其做成 git 仓库（最好是私有的），这样你的 `AGENTS.md` + 记忆文件就有备份了。如果安装了 git，全新工作空间会自动初始化。

```bash
# 运行设置
openclaw setup
```

完整的工作空间布局 + 备份指南：[Agent 工作空间](/concepts/agent-workspace)
记忆工作流：[记忆](/concepts/memory)

可选：使用 `agents.defaults.workspace` 选择不同的工作空间（支持 `~`）。

```json5
{
  agent: {
    workspace: "~/.openclaw/workspace"
  }
}
```

如果你已经从仓库运送自己的工作空间文件，可以完全禁用引导文件创建：

```json5
{
  agent: {
    skipBootstrap: true
  }
}
```

## 让它变成"助手"的配置

OpenClaw 默认是很好的助手设置，但你通常想要调整：
- `SOUL.md` 中的人物/说明
- 思考默认值（如果需要）
- 心跳（一旦你信任它）

示例：

```json5
{
  logging: { level: "info" },
  agent: {
    model: "anthropic/claude-opus-4-5",
    workspace: "~/.openclaw/workspace",
    thinkingDefault: "high",
    timeoutSeconds: 1800,
    // 从 0 开始；稍后启用
    heartbeat: { every: "0m" }
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: {
        "*": { requireMention: true }
      }
    }
  },
  routing: {
    groupChat: {
      mentionPatterns: ["@openclaw", "openclaw"]
    }
  },
  session: {
    scope: "per-sender",
    resetTriggers: ["/new", "/reset"],
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 10080
    }
  }
}
```

## 会话和记忆

- 会话文件：`~/.openclaw/agents/<agentId>/sessions/{{SessionId}}.jsonl`
- 会话元数据（token 使用、最后路由等）：`~/.openclaw/agents/<agentId>/sessions/sessions.json`（旧版：`~/.openclaw/sessions/sessions.json`）
- `/new` 或 `/reset` 为该聊天开始一个新会话（可通过 `resetTriggers` 配置）。如果单独发送，Agent 会回复一个简短的问候来确认重置。
- `/compact [instructions]` 压缩会话上下文并报告剩余的上下文预算。

## 心跳（主动模式）

默认情况下，OpenClaw 每 30 分钟运行一次心跳，prompt 为：
`Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.`
设置 `agents.defaults.heartbeat.every: "0m"` 来禁用。

- 如果 `HEARTBEAT.md` 存在但实际上是空的（只有空行和 markdown 标题如 `# Heading`），OpenClaw 跳过心跳运行以节省 API 调用。
- 如果文件缺失，心跳仍然运行，模型决定做什么。
- 如果 Agent 回复 `HEARTBEAT_OK`（可选带短填充；参见 `agents.defaults.heartbeat.ackMaxChars`），OpenClaw 抑制该心跳的出站传递。
- 心跳运行完整的 Agent 轮次 —— 更短的间隔消耗更多 token。

```json5
{
  agent: {
    heartbeat: { every: "30m" }
  }
}
```

## 媒体进出

入站附件（图片/音频/文档）可以通过模板暴露给你的命令：
- `{{MediaPath}}`（本地临时文件路径）
- `{{MediaUrl}}`（伪 URL）
- `{{Transcript}}`（如果启用了音频转录）

来自 Agent 的出站附件：在单独一行包含 `MEDIA:<path-or-url>`（无空格）。示例：

```
这是截图。
MEDIA:/tmp/screenshot.png
```

OpenClaw 提取这些并作为媒体与文本一起发送。

## 操作检查清单

```bash
# 本地状态（凭据、会话、排队事件）
openclaw status
# 完整诊断（只读、可粘贴）
openclaw status --all
# 添加 Gateway 健康探测（Telegram + Discord）
openclaw status --deep
# Gateway 健康快照（WS）
openclaw health --json
```

日志存储在 `/tmp/openclaw/`（默认：`openclaw-YYYY-MM-DD.log`）。

## 后续步骤

- WebChat：[WebChat](/web/webchat)
- Gateway 操作：[Gateway 手册](/gateway)
- Cron + 唤醒：[Cron 任务](/automation/cron-jobs)
- macOS 菜单栏伴侣：[OpenClaw macOS 应用](/platforms/macos)
- iOS 节点应用：[iOS 应用](/platforms/ios)
- Android 节点应用：[Android 应用](/platforms/android)
- Windows 状态：[Windows (WSL2)](/platforms/windows)
- Linux 状态：[Linux 应用](/platforms/linux)
- 安全：[安全](/gateway/security)
