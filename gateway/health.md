---
summary: "Gateway 健康检查"
read_when:
  - 你想验证频道连接状态
  - 你需要诊断 Gateway 问题
  - 你在调试连接失败
---

# 健康检查

本 CLI 指南帮助用户验证 OpenClaw Gateway 系统的频道连接性。

## 快速检查

文档概述了几个状态命令：

- **`openclaw status`** — 提供"本地摘要：Gateway 可达性/模式、更新提示、已链接频道认证时间、会话和最近活动"
- **`openclaw status --all`** — 提供完整的本地诊断，可安全用于调试
- **`openclaw status --deep`** — 额外探测运行中的 Gateway，进行每频道检查
- **`openclaw health --json`** — 通过 WebSocket 从 Gateway 获取完整健康快照
- **`/status`** — 可在 WhatsApp/WebChat 中作为消息发送，获取状态而不触发 Agent

对于日志，用户应检查 `/tmp/openclaw/openclaw-*.log` 并过滤相关事件，如 `web-heartbeat`、`web-reconnect`、`web-auto-reply` 和 `web-inbound`。

## 深度诊断

要检查的关键文件位置：
- 凭据：`~/.openclaw/credentials/whatsapp/<accountId>/creds.json`
- 会话存储：`~/.openclaw/agents/<agentId>/sessions/sessions.json`

重新链接时，遇到状态码 409–515 或登出事件时运行 `openclaw channels logout && openclaw channels login --verbose`。

## 连接失败故障排除

| 问题 | 解决方案 |
|------|----------|
| 已登出 / 状态 409–515 | 使用 logout 然后 login 命令重新链接 |
| Gateway 不可达 | 使用 `openclaw gateway --port 18789` 启动（如端口被占用添加 `--force`） |
| 无入站消息 | 验证手机在线且配置中的发送者权限 |

## Health 命令详情

`openclaw health --json` 命令查询 Gateway 的健康快照，报告凭据状态、每频道探测、会话摘要和探测持续时间。如果不可达或超时，返回非零退出码。默认 10 秒超时可通过 `--timeout <ms>` 调整。
