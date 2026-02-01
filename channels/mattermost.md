---
summary: "Mattermost Bot 设置和 OpenClaw 配置"
read_when:
  - 设置 Mattermost
  - 调试 Mattermost 路由
---

# Mattermost（插件）

状态：通过插件支持（Bot Token + WebSocket 事件）。支持频道、群组和私聊。
Mattermost 是一个可自托管的团队消息平台；参见官方网站
[mattermost.com](https://mattermost.com) 了解产品详情和下载。

## 需要插件
Mattermost 作为插件提供，不与核心安装捆绑。

通过 CLI 安装（npm registry）：
```bash
# 安装 Mattermost 插件
openclaw plugins install @openclaw/mattermost
```

本地检出（从 git 仓库运行时）：
```bash
# 从本地路径安装
openclaw plugins install ./extensions/mattermost
```

如果你在配置/配置期间选择 Mattermost 并检测到 git 检出，
OpenClaw 会自动提供本地安装路径。

详情：[插件](/plugin)

## 快速设置
1) 安装 Mattermost 插件。
2) 创建 Mattermost Bot 账户并复制 **Bot Token**。
3) 复制 Mattermost **基础 URL**（例如 `https://chat.example.com`）。
4) 配置 OpenClaw 并启动 Gateway。

最小配置：
```json5
{
  channels: {
    mattermost: {
      enabled: true,
      botToken: "mm-token",
      baseUrl: "https://chat.example.com",
      dmPolicy: "pairing"
    }
  }
}
```

## 环境变量（默认账户）
如果你更喜欢环境变量，在 Gateway 主机上设置这些：

- `MATTERMOST_BOT_TOKEN=...`
- `MATTERMOST_URL=https://chat.example.com`

环境变量仅适用于**默认**账户（`default`）。其他账户必须使用配置值。

## 聊天模式
Mattermost 自动响应私聊。频道行为由 `chatmode` 控制：

- `oncall`（默认）：仅在频道中被 @提及时响应。
- `onmessage`：响应每条频道消息。
- `onchar`：当消息以触发前缀开头时响应。

配置示例：
```json5
{
  channels: {
    mattermost: {
      chatmode: "onchar",
      oncharPrefixes: [">", "!"]
    }
  }
}
```

注意：
- `onchar` 仍然响应显式 @提及。
- `channels.mattermost.requireMention` 对传统配置有效，但优先使用 `chatmode`。

## 访问控制（私聊）
- 默认：`channels.mattermost.dmPolicy = "pairing"`（未知发送者获得配对码）。
- 通过以下方式批准：
  - `openclaw pairing list mattermost`
  - `openclaw pairing approve mattermost <CODE>`
- 开放私聊：`channels.mattermost.dmPolicy="open"` 加 `channels.mattermost.allowFrom=["*"]`。

## 频道（群组）
- 默认：`channels.mattermost.groupPolicy = "allowlist"`（提及门控）。
- 使用 `channels.mattermost.groupAllowFrom` 白名单发送者（用户 ID 或 `@username`）。
- 开放频道：`channels.mattermost.groupPolicy="open"`（提及门控）。

## 出站发送目标
将这些目标格式与 `openclaw message send` 或 cron/webhooks 一起使用：

- `channel:<id>` 用于频道
- `user:<id>` 用于私聊
- `@username` 用于私聊（通过 Mattermost API 解析）

裸 ID 被视为频道。

## 多账户
Mattermost 支持 `channels.mattermost.accounts` 下的多个账户：

```json5
{
  channels: {
    mattermost: {
      accounts: {
        default: { name: "Primary", botToken: "mm-token", baseUrl: "https://chat.example.com" },
        alerts: { name: "Alerts", botToken: "mm-token-2", baseUrl: "https://alerts.example.com" }
      }
    }
  }
}
```

## 故障排除
- 频道中没有回复：确保 Bot 在频道中并提及它（oncall），使用触发前缀（onchar），或设置 `chatmode: "onmessage"`。
- 认证错误：检查 Bot Token、基础 URL 和账户是否启用。
- 多账户问题：环境变量仅适用于 `default` 账户。
