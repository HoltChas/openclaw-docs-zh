---
summary: "Slack 频道集成指南"
read_when:
  - 你想将 OpenClaw 连接到 Slack
  - 你需要配置 Socket Mode 或 HTTP Mode
  - 你在调试 Slack 消息问题
---

# Slack

本文档介绍如何使用两种连接模式将 OpenClaw 与 Slack 集成：Socket Mode（默认）和 HTTP Mode（Events API）。

## Socket Mode 设置

快速设置包含三个步骤：创建启用 Socket Mode 的 Slack 应用、生成 App Token（`xapp-...`）和 Bot Token（`xoxb-...`），然后配置 OpenClaw。

**最小配置：**
```json5
{
  channels: {
    slack: {
      enabled: true,
      appToken: "xapp-...",
      botToken: "xoxb-...",
    },
  },
}
```

也可以通过环境变量 `SLACK_APP_TOKEN` 和 `SLACK_BOT_TOKEN` 设置令牌。

### 必需的事件订阅
- `message.*` 事件（编辑、删除、线程广播）
- `app_mention`、`reaction_added`、`reaction_removed`
- `member_joined_channel`、`member_left_channel`
- `channel_rename`、`pin_added`、`pin_removed`

## 用户令牌（可选）

OpenClaw 支持可选的用户令牌（`xoxp-...`）用于读取操作。默认情况下，"读取优先使用用户令牌（如果存在），写入仍使用机器人令牌"。

设置 `userTokenReadOnly: false` 允许在没有机器人令牌时使用用户令牌写入。

## HTTP Mode

对于可通过 HTTPS 访问的服务器部署，HTTP 模式使用 Events API 和共享请求 URL（默认 `/slack/events`）。这需要 Signing Secret 而非 App Token。

## 回复线程

三种模式控制线程行为：

| 模式 | 行为 |
|------|------|
| `off` | 默认 - 除非触发消息在线程中，否则回复到主频道 |
| `first` | 第一条回复进入线程，后续回复到主频道 |
| `all` | 所有回复都进入线程 |

可以为 `direct`、`group` 和 `channel` 类型分别配置线程行为。

## 私信安全

默认策略是 `pairing` - 未知发送者收到一小时后过期的配对码。通过 `openclaw pairing approve slack <code>` 批准。将策略设置为 `open` 并设置 `allowFrom=["*"]` 允许任何人。

## 群组策略

`groupPolicy` 设置控制频道处理，选项包括：`open`、`disabled` 或 `allowlist`。频道特定选项包括 `allow`、`requireMention`、`tools`、`users`、`skills`、`systemPrompt` 和 `allowBots`。

## 工具操作

操作可通过 `channels.slack.actions.*` 控制：
- reactions（回应 + 列表）
- messages（读取/发送/编辑/删除）
- pins（置顶/取消置顶/列表）
- memberInfo
- emojiList

## 限制

- 文本分块到 `textChunkLimit`（默认 4000 字符）
- 媒体上传受 `mediaMaxMb` 限制（默认 20）
- 历史上下文由 `historyLimit` 控制（默认 50）

## 安全说明

写入默认使用机器人令牌以获得受限权限。启用用户令牌写入意味着"操作以安装用户的访问权限运行"——文档建议将用户令牌视为高权限。

## 机器人消息处理

默认忽略机器人发送的消息。文档警告启用 `allowBots` 时可能出现机器人间的回复循环，建议使用提及要求和用户允许列表作为保护措施。
