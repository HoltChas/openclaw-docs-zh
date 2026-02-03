---
summary: "Gateway 锁机制"
read_when:
  - 你想了解 Gateway 如何防止多实例
  - 你遇到端口占用问题
  - 你在调试 Gateway 启动失败
---

# Gateway 锁

**最后更新：** 2025-12-11

## 目的

Gateway 锁机制服务于三个主要目标：
- 确保每个主机上每个基础端口只有一个 gateway 实例运行
- 在崩溃和 SIGKILL 信号后存活，不留下陈旧的锁文件
- 当端口被占用时提供快速失败和清晰的错误消息

## 工作原理

Gateway 使用独占 TCP 监听器方法，在启动时绑定 WebSocket 监听器（默认 `ws://127.0.0.1:18789`）。当绑定因 `EADDRINUSE` 失败时，系统抛出 `GatewayLockError`，指示另一个实例已在监听。

关键优势："OS 在任何进程退出时自动释放监听器，包括崩溃和 SIGKILL——不需要单独的锁文件或清理步骤。"

在关闭期间，gateway 关闭 WebSocket 服务器和 HTTP 服务器以快速释放端口。

## 错误消息

存在两种错误模式：
1. 端口已被使用：抛出关于另一个 gateway 实例正在监听的 `GatewayLockError`
2. 其他绑定失败：抛出带有"failed to bind gateway socket"消息的 `GatewayLockError`

## 操作说明

- 如果另一个进程占用端口，用户应释放它或使用 `openclaw gateway --port <port>` 选择替代端口
- macOS 应用在生成 gateway 之前维护单独的 PID 守卫，而运行时锁依赖于 WebSocket 绑定机制
