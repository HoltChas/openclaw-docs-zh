---
summary: "每个 Agent 的沙盒 + 工具限制、优先级和示例"
title: 多 Agent 沙盒与工具
read_when: "你想要在多 Agent Gateway 中为每个 Agent 配置沙盒或工具允许/拒绝策略"
status: active
---

# 多 Agent 沙盒与工具配置

## 概述

多 Agent 设置中的每个 Agent 现在可以有自己的：
- **沙盒配置**（`agents.list[].sandbox` 覆盖 `agents.defaults.sandbox`）
- **工具限制**（`tools.allow` / `tools.deny`，加上 `agents.list[].tools`）

这让你可以运行具有不同安全配置的多个 Agent：
- 完全访问的个人助手
- 受限制工具的家庭/工作 Agent
- 沙盒中的面向公众 Agent

`setupCommand` 属于 `sandbox.docker` 下（全局或每个 Agent），在容器创建时运行一次。

每个 Agent 的认证：每个 Agent 从自己的 `agentDir` 认证存储读取：

```
~/.openclaw/agents/<agentId>/agent/auth-profiles.json
```

**凭证不在 Agent 之间共享。** 永远不要跨 Agent 重用 `agentDir`。
如果你想共享凭证，将 `auth-profiles.json` 复制到其他 Agent 的 `agentDir` 中。

运行时沙盒行为详见 [沙盒](/gateway/sandboxing)。
调试"为什么被阻止？"详见 [沙盒 vs 工具策略 vs 特权](/gateway/sandbox-vs-tool-policy-vs-elevated) 和 `openclaw sandbox explain`。

---

## 配置示例

### 示例 1：个人 + 受限制的家庭 Agent

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "name": "Personal Assistant",
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "family",
        "name": "Family Bot",
        "workspace": "~/.openclaw/workspace-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit", "apply_patch", "process", "browser"]
        }
      }
    ]
  },
  "bindings": [
    {
      "agentId": "family",
      "match": {
        "provider": "whatsapp",
        "accountId": "*",
        "peer": {
          "kind": "group",
          "id": "120363424282127706@g.us"
        }
      }
    }
  ]
}
```

**结果：**
- `main` Agent：在主机上运行，完全工具访问
- `family` Agent：在 Docker 中运行（每个 Agent 一个容器），只有 `read` 工具

---

### 示例 2：工作 Agent 与共享沙盒

```json
{
  "agents": {
    "list": [
      {
        "id": "personal",
        "workspace": "~/.openclaw/workspace-personal",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "work",
        "workspace": "~/.openclaw/workspace-work",
        "sandbox": {
          "mode": "all",
          "scope": "shared",
          "workspaceRoot": "/tmp/work-sandboxes"
        },
        "tools": {
          "allow": ["read", "write", "apply_patch", "exec"],
          "deny": ["browser", "gateway", "discord"]
        }
      }
    ]
  }
}
```

---

### 示例 2b：全局编码配置 + 仅消息 Agent

```json
{
  "tools": { "profile": "coding" },
  "agents": {
    "list": [
      {
        "id": "support",
        "tools": { "profile": "messaging", "allow": ["slack"] }
      }
    ]
  }
}
```

**结果：**
- 默认 Agent 获得编码工具
- `support` Agent 仅用于消息（+ Slack 工具）

---

### 示例 3：每个 Agent 不同的沙盒模式

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",  // 全局默认
        "scope": "session"
      }
    },
    "list": [
      {
        "id": "main",
        "workspace": "~/.openclaw/workspace",
        "sandbox": {
          "mode": "off"  // 覆盖：main 从不沙盒
        }
      },
      {
        "id": "public",
        "workspace": "~/.openclaw/workspace-public",
        "sandbox": {
          "mode": "all",  // 覆盖：public 始终沙盒
          "scope": "agent"
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit", "apply_patch"]
        }
      }
    ]
  }
}
```

---

## 配置优先级

当全局（`agents.defaults.*`）和特定 Agent（`agents.list[].*`）配置都存在时：

### 沙盒配置
特定 Agent 设置覆盖全局：
```
agents.list[].sandbox.mode > agents.defaults.sandbox.mode
agents.list[].sandbox.scope > agents.defaults.sandbox.scope
agents.list[].sandbox.workspaceRoot > agents.defaults.sandbox.workspaceRoot
agents.list[].sandbox.workspaceAccess > agents.defaults.sandbox.workspaceAccess
agents.list[].sandbox.docker.* > agents.defaults.sandbox.docker.*
agents.list[].sandbox.browser.* > agents.defaults.sandbox.browser.*
agents.list[].sandbox.prune.* > agents.defaults.sandbox.prune.*
```

**注意：**
- `agents.list[].sandbox.{docker,browser,prune}.*` 覆盖该 Agent 的 `agents.defaults.sandbox.{docker,browser,prune}.*`（当沙盒范围解析为 `"shared"` 时忽略）

### 工具限制
过滤顺序是：
1. **工具配置文件**（`tools.profile` 或 `agents.list[].tools.profile`）
2. **提供者工具配置文件**（`tools.byProvider[provider].profile` 或 `agents.list[].tools.byProvider[provider].profile`）
3. **全局工具策略**（`tools.allow` / `tools.deny`）
4. **提供者工具策略**（`tools.byProvider[provider].allow/deny`）
5. **特定 Agent 工具策略**（`agents.list[].tools.allow/deny`）
6. **Agent 提供者策略**（`agents.list[].tools.byProvider[provider].allow/deny`）
7. **沙盒工具策略**（`tools.sandbox.tools` 或 `agents.list[].tools.sandbox.tools`）
8. **子 Agent 工具策略**（`tools.subagents.tools`，如果适用）

每个级别只能进一步限制工具，不能授予之前级别拒绝的工具。
如果设置了 `agents.list[].tools.sandbox.tools`，它会替换该 Agent 的 `tools.sandbox.tools`。
如果设置了 `agents.list[].tools.profile`，它会覆盖该 Agent 的 `tools.profile`。
提供者工具键接受 `provider`（例如 `google-antigravity`）或 `provider/model`（例如 `openai/gpt-5.2`）。

### 工具组（简写）

工具策略（全局、Agent、沙盒）支持展开为多个具体工具的 `group:*` 条目：

- `group:runtime`: `exec`, `bash`, `process`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:openclaw`: 所有内置 OpenClaw 工具（不包括提供者插件）

### 特权模式
`tools.elevated` 是全局基线（基于发送者的允许列表）。`agents.list[].tools.elevated` 可以进一步限制特定 Agent 的特权（两者都必须允许）。

缓解模式：
- 对不受信任的 Agent 拒绝 `exec`（`agents.list[].tools.deny: ["exec"]`）
- 避免将发送者列入会路由到受限制 Agent 的白名单
- 全局禁用特权（`tools.elevated.enabled: false`）如果你只想要沙盒执行
- 为敏感配置文件每个 Agent 禁用特权（`agents.list[].tools.elevated.enabled: false`）

---

## 从单 Agent 迁移

**之前（单 Agent）：**
```json
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "sandbox": {
        "mode": "non-main"
      }
    }
  },
  "tools": {
    "sandbox": {
      "tools": {
        "allow": ["read", "write", "apply_patch", "exec"],
        "deny": []
      }
    }
  }
}
```

**之后（具有不同配置文件的多 Agent）：**
```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      }
    ]
  }
}
```

旧版 `agent.*` 配置由 `openclaw doctor` 迁移；今后优先使用 `agents.defaults` + `agents.list`。

---

## 工具限制示例

### 只读 Agent
```json
{
  "tools": {
    "allow": ["read"],
    "deny": ["exec", "write", "edit", "apply_patch", "process"]
  }
}
```

### 安全执行 Agent（无文件修改）
```json
{
  "tools": {
    "allow": ["read", "exec", "process"],
    "deny": ["write", "edit", "apply_patch", "browser", "gateway"]
  }
}
```

### 仅通信 Agent
```json
{
  "tools": {
    "allow": ["sessions_list", "sessions_send", "sessions_history", "session_status"],
    "deny": ["exec", "write", "edit", "apply_patch", "read", "browser"]
  }
}
```

---

## 常见陷阱："non-main"

`agents.defaults.sandbox.mode: "non-main"` 基于 `session.mainKey`（默认 `"main"`），
而不是 Agent ID。群组/频道会话总是获得自己的键，因此它们被视为 non-main 并将被沙盒。如果你想让 Agent 从不沙盒，设置 `agents.list[].sandbox.mode: "off"`。

---

## 测试

配置多 Agent 沙盒和工具后：

1. **检查 Agent 解析：**
   ```bash
   openclaw agents list --bindings
   ```

2. **验证沙盒容器：**
   ```bash
   docker ps --filter "name=openclaw-sbx-"
   ```

3. **测试工具限制：**
   - 发送需要受限制工具的消息
   - 验证 Agent 不能使用被拒绝的工具

4. **监控日志：**
   ```bash
   tail -f "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}/logs/gateway.log" | grep -E "routing|sandbox|tools"
   ```

---

## 故障排除

### 尽管设置了 `mode: "all"` Agent 仍未沙盒
- 检查是否有全局 `agents.defaults.sandbox.mode` 覆盖了它
- 特定 Agent 配置优先，所以设置 `agents.list[].sandbox.mode: "all"`

### 尽管有拒绝列表工具仍然可用
- 检查工具过滤顺序：全局 → Agent → 沙盒 → 子 Agent
- 每个级别只能进一步限制，不能授予
- 用日志验证：`[tools] filtering tools for agent:${agentId}`

### 容器未按 Agent 隔离
- 在特定 Agent 沙盒配置中设置 `scope: "agent"`
- 默认是 `"session"`，为每个会话创建一个容器

---

## 另见

- [多 Agent 路由](/concepts/multi-agent)
- [沙盒配置](/gateway/configuration#agentsdefaults-sandbox)
- [会话管理](/concepts/session)
