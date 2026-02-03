---
summary: "RPC 适配器"
read_when:
  - 你想了解外部工具集成
  - 你需要配置 signal-cli 或 imsg
  - 你在开发自定义适配器
---

# RPC 适配器

本文档介绍 OpenClaw 如何使用 JSON-RPC 连接到外部命令行工具，有两种不同的集成模式。

## 模式 A：HTTP 守护进程（signal-cli）

这种方法将 `signal-cli` 作为持久守护进程运行，通过 HTTP 上的 JSON-RPC 通信。关键特性包括：

- 服务器发送事件在 `/api/v1/events` 可用于事件流
- 健康检查端点在 `/api/v1/check`
- 当配置 `channels.signal.autoStart=true` 时，OpenClaw 管理守护进程生命周期

## 模式 B：stdio 子进程（imsg）

这种模式将 `imsg rpc` 作为子进程生成，使用"JSON-RPC 是通过 stdin/stdout 的行分隔（每行一个 JSON 对象）"。不需要网络端口或单独的守护进程。

**核心 RPC 方法：**
- `watch.subscribe` — 触发带有 `method: "message"` 的通知
- `watch.unsubscribe`
- `send`
- `chats.list` — 用于探测和诊断

## 适配器指南

文档推荐三个最佳实践：

1. Gateway 应控制进程生命周期，将启动/停止与提供者绑定
2. RPC 客户端应具有弹性，带有超时和自动重启功能
3. 使用稳定标识符如 `chat_id` 而非显示名称
