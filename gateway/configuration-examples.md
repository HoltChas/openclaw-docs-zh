---
summary: "常见 OpenClaw 设置的符合模式的配置示例"
read_when:
  - 学习如何配置 OpenClaw
  - 寻找配置示例
  - 首次设置 OpenClaw
---
# 配置示例

下面的示例与当前配置模式一致。对于详尽参考和每个字段的说明，参见 [配置(../gateway/configuration.html)。

## 快速开始

### 绝对最小配置
```json5
{
  agent: { workspace: "~/.openclaw/workspace" },
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}
```

保存到 `~/.openclaw/openclaw.json`，然后你可以从该号码私聊 Bot。

### 推荐入门配置
```json5
{
  identity: {
    name: "Clawd",
    theme: "helpful assistant",
    emoji: "🦞"
  },
  agent: {
    workspace: "~/.openclaw/workspace",
    model: { primary: "anthropic/claude-sonnet-4-5" }
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } }
    }
  }
}
```

## 扩展示例（主要选项）

> JSON5 允许你使用注释和尾随逗号。普通 JSON 也可以。

```json5
{
  // 环境 + shell
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: {
      GROQ_API_KEY: "gsk-..."
    },
    shellEnv: {
      enabled: true,
      timeoutMs: 15000
    }
  },

  // 认证配置元数据（密钥存储在 auth-profiles.json）
  auth: {
    profiles: {
      "anthropic:me@example.com": { provider: "anthropic", mode: "oauth", email: "me@example.com" },
      "anthropic:work": { provider: "anthropic", mode: "api_key" },
      "openai:default": { provider: "openai", mode: "api_key" },
      "openai-codex:default": { provider: "openai-codex", mode: "oauth" }
    },
    order: {
      anthropic: ["anthropic:me@example.com", "anthropic:work"],
      openai: ["openai:default"],
      "openai-codex": ["openai-codex:default"]
    }
  },

  // 身份
  identity: {
    name: "Samantha",
    theme: "helpful sloth",
    emoji: "🦥"
  },

  // 日志
  logging: {
    level: "info",
    file: "/tmp/openclaw/openclaw.log",
    consoleLevel: "info",
    consoleStyle: "pretty",
    redactSensitive: "tools"
  },

  // 消息格式
  messages: {
    messagePrefix: "[openclaw]",
    responsePrefix: ">",
    ackReaction: "👀",
    ackReactionScope: "group-mentions"
  },
