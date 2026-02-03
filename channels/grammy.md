---
summary: "grammY Telegram 集成"
read_when:
  - 你想了解 Telegram Bot API 集成
  - 你需要配置 Telegram 频道
  - 你在调试 Telegram 消息问题
---

# grammY

本文档介绍 OpenClaw 项目中的 grammY Telegram Bot API 集成。

## 为什么选择 grammY
该框架提供"TS 优先的 Bot API 客户端，内置长轮询 + webhook 助手、中间件、错误处理、速率限制器"。它比手动 fetch/FormData 方法提供更清晰的媒体处理，并通过代理支持、会话中间件和类型安全上下文支持可扩展性。

## 已发布的功能

### 单一客户端路径
基于 fetch 的实现已完全移除。grammY 现在作为唯一的 Telegram 客户端，默认启用节流。

### Gateway
`monitorTelegramProvider` 函数创建 grammY Bot 实例，配置提及/允许列表门控，通过 `getFile`/`download` 处理媒体下载，并通过各种发送方法（message、photo、video、audio、document）发送回复。支持长轮询和 webhook 两种模式。

### 代理支持
可选的代理配置通过 grammY 的 `client.baseFetch` 使用 `undici.ProxyAgent`。

### Webhook 支持
两个文件处理 webhook：`webhook-set.ts` 管理设置/删除 webhook，而 `webhook.ts` 托管带有健康检查和优雅关闭的回调端点。当同时配置 URL 和 secret 时激活 webhook 模式。

### 会话管理
- 私聊使用格式：`agent:<agentId>:<mainKey>`
- 群组使用格式：`agent:<agentId>:telegram:group:<chatId>`

### 配置选项
可用的配置项包括：`botToken`、`dmPolicy`、`groups`、`allowFrom`、`groupAllowFrom`、`groupPolicy`、`mediaMaxMb`、`linkPreview`、`proxy`、`webhookSecret` 和 `webhookUrl`。

### 草稿流式传输
通过 `sendMessageDraft` 为私有主题聊天提供可选流式传输（需要 Bot API 9.3+）。

## 待解决问题
- 处理 429 错误的节流器插件使用
- 需要额外的媒体测试（贴纸、语音笔记）
- Webhook 端口可配置性（目前硬编码为 8787）
