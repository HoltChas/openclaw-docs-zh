---
summary: "OAuth 认证机制"
read_when:
  - 你想了解如何配置 OAuth 认证
  - 你需要管理多个账户
  - 你在调试认证问题
---

# OAuth

OpenClaw 通过 OAuth 为兼容提供者提供"订阅认证"，特别是 **OpenAI Codex（ChatGPT OAuth）**。Anthropic 订阅使用单独的 **setup-token** 流程。

具有自定义 OAuth 或 API 密钥流程的提供者插件可通过以下方式访问：
```bash
openclaw models auth login --provider <id>
```

## 令牌池概念

令牌池存在是因为 OAuth 提供者通常"在登录/刷新流程中铸造新的刷新令牌"，这可能使旧令牌失效。这造成一个实际问题：同时登录 OpenClaw 和另一个 CLI 可能导致其中一个随机登出。

`auth-profiles.json` 文件作为集中式令牌池，运行时从单一位置读取凭据并确定性地路由多个配置文件。

## 存储位置

密钥**按 Agent** 存储：

- **认证配置文件**：`~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
- **运行时缓存**（自动管理）：`~/.openclaw/agents/<agentId>/agent/auth.json`
- **旧版文件**（仅导入）：`~/.openclaw/credentials/oauth.json`

`$OPENCLAW_STATE_DIR` 环境变量可以覆盖这些路径。

## Anthropic Setup-Token 流程

Anthropic 认证命令：
```bash
openclaw models auth setup-token --provider anthropic
openclaw models auth paste-token --provider anthropic
openclaw models status
```

流程包括运行 `claude setup-token`，将其粘贴到 OpenClaw，并将其存储为没有刷新功能的令牌配置文件。

## OpenAI Codex OAuth（PKCE 流程）

PKCE 流程生成验证器/挑战，打开授权 URL，在 `http://127.0.0.1:1455/auth/callback` 捕获回调，交换令牌，并存储带有过期时间和 accountId 的访问/刷新令牌。

## 刷新和过期

配置文件包含 `expires` 时间戳。运行时自动使用有效的存储令牌，或在过期时在文件锁下刷新它们。

## 多账户管理

**选项 1 - 单独的 Agent**（推荐用于隔离）：
```bash
openclaw agents add work
openclaw agents add personal
```

**选项 2 - 每个 Agent 多个配置文件**：通过 `auth.order` 全局配置或使用会话覆盖如 `/model Opus@anthropic:work`。

使用 `openclaw channels list --json` 查看现有配置文件。
