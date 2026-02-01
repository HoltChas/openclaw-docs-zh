---
summary: "用于聊天 UI 的回环 WebChat 静态主机和 Gateway WS 使用"
read_when:
  - 调试或配置 WebChat 访问
---
# WebChat（Gateway WebSocket UI）

状态：macOS/iOS SwiftUI 聊天 UI 直接与 Gateway WebSocket 通信。

## 它是什么
- Gateway 的原生聊天 UI（无嵌入式浏览器和本地静态服务器）。
- 使用与其他频道相同的会话和路由规则。
- 确定性路由：回复总是返回到 WebChat。

## 快速开始
1) 启动 Gateway。
2) 打开 WebChat UI（macOS/iOS 应用）或 Control UI 聊天标签。
3) 确保配置了 Gateway 认证（默认需要，即使在回环上）。

## 工作原理（行为）
- UI 连接到 Gateway WebSocket 并使用 `chat.history`、`chat.send` 和 `chat.inject`。
- `chat.inject` 将助手注释直接附加到记录并广播到 UI（无 Agent 运行）。
- 历史总是从 Gateway 获取（无本地文件监视）。
- 如果 Gateway 无法访问，WebChat 是只读的。

## 远程使用
- 远程模式通过 SSH/Tailscale 隧道传输 Gateway WebSocket。
- 你不需要运行单独的 WebChat 服务器。

## 配置参考（WebChat）
完整配置：[配置](/gateway/configuration)

频道选项：
- 无专门的 `webchat.*` 块。WebChat 使用 Gateway 端点 + 以下认证设置。

相关全局选项：
- `gateway.port`、`gateway.bind`：WebSocket 主机/端口。
- `gateway.auth.mode`、`gateway.auth.token`、`gateway.auth.password`：WebSocket 认证。
- `gateway.remote.url`、`gateway.remote.token`、`gateway.remote.password`：远程 Gateway 目标。
- `session.*`：会话存储和主密钥默认值。
