---
summary: "多 Agent 路由：隔离 Agent、频道账号与绑定"
title: Multi-Agent Routing
read_when: "你想在一个 Gateway 里运行多个隔离 Agent（工作区 + 认证）。"
status: active
---

# 多 Agent 路由

目标：在一个 Gateway 进程中运行多个**隔离** Agent（各自的 workspace + `agentDir` + sessions），并支持多个频道账号（比如两个 WhatsApp）。入站消息通过绑定路由到具体 Agent。

## 什么是“一位 Agent”？

**Agent** 是一个完整隔离的“脑”，拥有自己的：

- **工作区**（文件、AGENTS.md/SOUL.md/USER.md、本地笔记、人格规则）。
- **状态目录**（`agentDir`），保存认证配置、模型注册表和每个 Agent 的配置。
- **会话存储**（聊天历史 + 路由状态）位于 `~/.openclaw/agents/<agentId>/sessions`。

认证配置是 **每个 Agent 独立**。每个 Agent 从自己的文件读取：

```
~/.openclaw/agents/<agentId>/agent/auth-profiles.json
```

主 Agent 的凭证不会自动共享。不要跨 Agent 共享 `agentDir`（会导致认证/会话冲突）。如果你要共享凭证，请复制 `auth-profiles.json` 到另一个 Agent 的 `agentDir`。

技能是每个 Agent 的 `workspace/skills`，共享技能放在 `~/.openclaw/skills`。
参见 [技能：每个 Agent vs 共享(../tools/skills#per-agent-vs-shared-skills.html)。

Gateway 可以同时托管 **一个 Agent**（默认）或 **多个 Agent**。

**工作区说明：** 每个 Agent 的工作区是 **默认 cwd**，不是硬隔离。相对路径解析在工作区内，但绝对路径可访问其他主机路径，除非开启沙盒。参见 [沙盒化(../gateway/sandboxing.html)。

## 路径速查

- 配置：`~/.openclaw/openclaw.json`（或 `OPENCLAW_CONFIG_PATH`）
- 状态目录：`~/.openclaw`（或 `OPENCLAW_STATE_DIR`）
- 工作区：`~/.openclaw/workspace`（或 `~/.openclaw/workspace-<agentId>`）
- Agent 目录：`~/.openclaw/agents/<agentId>/agent`（或 `agents.list[].agentDir`）
- 会话：`~/.openclaw/agents/<agentId>/sessions`

### 单 Agent 模式（默认）

如果你不做任何事，OpenClaw 运行单 Agent：

- `agentId` 默认是 **`main`**。
- 会话键为 `agent:main:<mainKey>`。
- 工作区默认 `~/.openclaw/workspace`（或设置 `OPENCLAW_PROFILE` 时 `~/.openclaw/workspace-<profile>`）。
- 状态默认 `~/.openclaw/agents/main/agent`。

## Agent 助手

使用 Agent 向导添加一个新的隔离 Agent：

```bash
openclaw agents add work # 中文注释：新增一个叫 work 的 Agent
```

然后添加 `bindings`（或让向导做）来路由入站消息。

验证：

```bash
openclaw agents list --bindings # 中文注释：查看 Agent 及其绑定
```

## 多 Agent = 多个人、多种人格

在 **多 Agent** 设置中，每个 `agentId` 是一个**完全隔离**的人设：

- **不同账号/手机号**（每个频道 `accountId`）。
- **不同人格**（每个 Agent 的工作区文件如 `AGENTS.md` 和 `SOUL.md`）。
- **独立认证 + 会话**（除非明确共享）。

这样可以让**多个人**共享一个 Gateway 服务器，同时保持 AI “大脑”与数据隔离。

## 一个 WhatsApp 号，多个人（DM 拆分）

你可以在 **一个 WhatsApp 账号** 下，将不同 DM 路由给不同 Agent，通过发送者 E.164（如 `+15551234567`）匹配 `peer.kind: "dm"`。回复仍来自同一个 WhatsApp 号码（无法按 Agent 区分发送者身份）。

重要细节：直聊会折叠到 Agent 的 **主会话键**，因此真正隔离需要 **一人一个 Agent**。

示例：

```json5
{
  agents: {
    list: [
      { id: "alex", workspace: "~/.openclaw/workspace-alex" },
      { id: "mia", workspace: "~/.openclaw/workspace-mia" }
    ]
  },
  bindings: [
    { agentId: "alex", match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551230001" } } },
    { agentId: "mia",  match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551230002" } } }
  ],
  channels: {
    whatsapp: {
      dmPolicy: "allowlist", // 中文注释：DM 允许列表模式
      allowFrom: ["+15551230001", "+15551230002"]
    }
  }
}
```

说明：
- DM 访问控制是 **每个 WhatsApp 账号全局**（配对/允许列表），不是每个 Agent。
- 对共享群，绑定到一个 Agent 或使用 [广播群组](../broadcast-groups.html)。

## 路由规则（消息如何选择 Agent）

绑定是 **确定性** 且 **最具体优先**：

1. `peer` 匹配（精确 DM/群/频道 id）
2. `guildId`（Discord）
3. `teamId`（Slack）
4. 频道的 `accountId` 匹配
5. 频道级匹配（`accountId: "*"`）
6. 回退到默认 Agent（`agents.list[].default`，否则列表第一项，默认：`main`）

## 多账号 / 多手机号

支持 **多账号** 的频道（如 WhatsApp）使用 `accountId` 标识每个登录。
每个 `accountId` 可以路由给不同 Agent，因此一个服务器可托管多个手机号而不混淆会话。

## 核心概念

- `agentId`：一个“脑”（工作区、每个 Agent 的认证、每个 Agent 的会话存储）。
- `accountId`：一个频道账号实例（如 WhatsApp 账号 "personal" vs "biz"）。
- `binding`：通过 `(channel, accountId, peer)` 将入站消息路由到 `agentId`，可选 guild/team id。
- 直聊折叠到 `agent:<agentId>:<mainKey>`（每个 Agent 的 “main”；`session.mainKey`）。

## 示例：两个 WhatsApp → 两个 Agent

`~/.openclaw/openclaw.json`（JSON5）：

```js
{
  agents: {
    list: [
      {
        id: "home",
        default: true,
        name: "Home",
        workspace: "~/.openclaw/workspace-home",
        agentDir: "~/.openclaw/agents/home/agent",
      },
      {
        id: "work",
        name: "Work",
        workspace: "~/.openclaw/workspace-work",
        agentDir: "~/.openclaw/agents/work/agent",
      },
    ],
  },

  // 中文注释：确定性路由，最具体优先
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },

    // 中文注释：可选单个群聊覆写
    {
      agentId: "work",
      match: {
        channel: "whatsapp",
        accountId: "personal",
        peer: { kind: "group", id: "1203630...@g.us" },
      },
    },
  ],

  // 中文注释：默认关闭，Agent 间消息必须显式启用 + 允许列表
  tools: {
    agentToAgent: {
      enabled: false,
      allow: ["home", "work"],
    },
  },

  channels: {
    whatsapp: {
      accounts: {
        personal: {
          // 中文注释：可选覆盖。默认：~/.openclaw/credentials/whatsapp/personal
          // authDir: "~/.openclaw/credentials/whatsapp/personal",
        },
        biz: {
          // 中文注释：可选覆盖。默认：~/.openclaw/credentials/whatsapp/biz
          // authDir: "~/.openclaw/credentials/whatsapp/biz",
        },
      },
    },
  },
}
```

## 示例：WhatsApp 日常 + Telegram 深度工作

按频道拆分：WhatsApp 路由到快速日常 Agent，Telegram 路由到 Opus Agent。

```json5
{
  agents: {
    list: [
      {
        id: "chat",
        name: "Everyday",
        workspace: "~/.openclaw/workspace-chat",
        model: "anthropic/claude-sonnet-4-5"
      },
      {
        id: "opus",
        name: "Deep Work",
        workspace: "~/.openclaw/workspace-opus",
        model: "anthropic/claude-opus-4-5"
      }
    ]
  },
  bindings: [
    { agentId: "chat", match: { channel: "whatsapp" } },
    { agentId: "opus", match: { channel: "telegram" } }
  ]
}
```

说明：
- 如果你有多个账号，给绑定加上 `accountId`（例如 `{ channel: "whatsapp", accountId: "personal" }`）。
- 想把某个 DM/群路由到 Opus，同时其余保持 chat，添加 `match.peer` 绑定；peer 匹配总是胜过频道级规则。

## 示例：同频道，单一 peer 到 Opus

保持 WhatsApp 走快速 Agent，但把一个 DM 路由到 Opus：

```json5
{
  agents: {
    list: [
      { id: "chat", name: "Everyday", workspace: "~/.openclaw/workspace-chat", model: "anthropic/claude-sonnet-4-5" },
      { id: "opus", name: "Deep Work", workspace: "~/.openclaw/workspace-opus", model: "anthropic/claude-opus-4-5" }
    ]
  },
  bindings: [
    { agentId: "opus", match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551234567" } } },
    { agentId: "chat", match: { channel: "whatsapp" } }
  ]
}
```

peer 绑定总是胜出，所以把它放在频道级规则上方。

## 示例：家庭 Agent 绑定到 WhatsApp 群

把一个专用家庭 Agent 绑定到单个群，同时启用提及门控和更严格的工具策略：

```json5
{
  agents: {
    list: [
      {
        id: "family",
        name: "Family",
        workspace: "~/.openclaw/workspace-family",
        identity: { name: "Family Bot" },
        groupChat: {
          mentionPatterns: ["@family", "@familybot", "@Family Bot"]
        },
        sandbox: {
          mode: "all",
          scope: "agent"
        },
        tools: {
          allow: ["exec", "read", "sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
          deny: ["write", "edit", "apply_patch", "browser", "canvas", "nodes", "cron"]
        }
      }
    ]
  },
  bindings: [
    {
      agentId: "family",
      match: {
        channel: "whatsapp",
        peer: { kind: "group", id: "120363999999999999@g.us" }
      }
    }
  ]
}
```

说明：
- 工具允许/拒绝列表是 **工具**，不是技能。若技能需要运行二进制，请确保允许 `exec` 且二进制存在于沙盒中。
- 若要更严格门控，设置 `agents.list[].groupChat.mentionPatterns` 并保持频道群允许列表启用。

## 每个 Agent 的沙盒和工具配置

从 v2026.1.6 开始，每个 Agent 可以有自己的沙盒和工具限制：

```js
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/.openclaw/workspace-personal",
        sandbox: {
          mode: "off",  // 中文注释：个人 Agent 不启用沙盒
        },
        // 中文注释：不限制工具 - 全部可用
      },
      {
        id: "family",
        workspace: "~/.openclaw/workspace-family",
        sandbox: {
          mode: "all",     // 中文注释：始终沙盒
          scope: "agent",  // 中文注释：每个 Agent 一个容器
          docker: {
            // 中文注释：容器创建后的可选一次性设置
            setupCommand: "apt-get update && apt-get install -y git curl",
          },
        },
        tools: {
          allow: ["read"],                    // 中文注释：只允许 read
          deny: ["exec", "write", "edit", "apply_patch"],    // 中文注释：拒绝其他工具
        },
      },
    ],
  },
}
```

注意：`setupCommand` 位于 `sandbox.docker` 下，并在容器创建时运行一次。当解析后的 scope 为 `"shared"` 时，每个 Agent 的 `sandbox.docker.*` 覆盖会被忽略。

**好处：**
- **安全隔离**：限制不可信 Agent 的工具
- **资源控制**：为特定 Agent 开沙盒，同时其他 Agent 走主机
- **灵活策略**：不同 Agent 不同权限

注意：`tools.elevated` 是 **全局** 且基于发送者；不能按 Agent 配置。如果你需要每 Agent 的边界，使用 `agents.list[].tools` 禁用 `exec`。
针对群聊，使用 `agents.list[].groupChat.mentionPatterns` 以便 @mention 清晰映射到目标 Agent。

参见 [多 Agent 沙盒与工具](../multi-agent-sandbox-tools.html) 获取更多示例。
