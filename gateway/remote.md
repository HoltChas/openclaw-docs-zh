---
summary: "使用 SSH 隧道与 tailnet 的远程访问"
read_when:
  - 运行或排查远程 Gateway 设置
---
# 远程访问（SSH、隧道与 tailnet）

这个仓库支持“通过 SSH 远程”方式：在专用主机（桌面/服务器）上运行一个 Gateway（主控），客户端连接到它。

- **操作员（你 / macOS 应用）**：SSH 隧道是通用回退。
- **节点（iOS/Android 等）**：连接到 Gateway **WebSocket**（LAN/tailnet 或必要时 SSH 隧道）。

## 核心理念

- Gateway WebSocket 绑定在 **环回地址** 上（默认端口 18789）。
- 远程使用时，通过 SSH 转发该环回端口（或用 tailnet/VPN 减少隧道需求）。

## 常见 VPN/tailnet 场景（Agent 在哪里）

把 **Gateway 主机** 当作“Agent 所在地”。它拥有会话、认证配置、频道和状态。
你的笔记本/桌面（以及节点）连接到这个主机。

### 1) tailnet 内始终在线的 Gateway（VPS 或家用服务器）

在持续运行的主机上跑 Gateway，并通过 **Tailscale** 或 SSH 访问。

- **最佳体验：** 保持 `gateway.bind: "loopback"`，并使用 **Tailscale Serve** 暴露 Control UI。
- **回退：** 仍使用 loopback + SSH 隧道（需要访问的机器都开隧道）。
- **示例：** [exe.dev](/platforms/exe-dev)（易用 VM）或 [Hetzner](/platforms/hetzner)（生产 VPS）。

这适合笔记本经常休眠但你希望 Agent 始终在线的场景。

### 2) 家用桌面运行 Gateway，笔记本远程控制

笔记本 **不运行** Agent，只进行远程连接：

- 使用 macOS 应用的 **Remote over SSH** 模式（设置 → 通用 → “OpenClaw runs”）。
- 应用会打开并管理隧道，因此 WebChat + 健康检查“即插即用”。

运行手册：[macOS 远程访问](/platforms/mac/remote)。

### 3) 笔记本运行 Gateway，其他机器远程访问

保持 Gateway 本地但安全暴露：

- 从其他机器通过 SSH 隧道连接，或
- 使用 Tailscale Serve 暴露 Control UI，同时保持 Gateway 仅 loopback。

指南：[Tailscale](/gateway/tailscale) 与 [Web 概览](/web)。

## 命令流（什么在什么地方运行）

一个 Gateway 服务拥有状态 + 频道。节点是外围设备。

示例流程（Telegram → 节点）：
- Telegram 消息到达 **Gateway**。
- Gateway 运行 **Agent** 并决定是否调用节点工具。
- Gateway 通过 Gateway WebSocket 调用 **节点**（`node.*` RPC）。
- 节点返回结果；Gateway 再回复 Telegram。

说明：
- **节点不运行 Gateway 服务。** 除非你刻意运行隔离 profile，否则每台主机只运行一个 Gateway（见 [多 Gateway](/gateway/multiple-gateways)）。
- macOS 应用的“节点模式”只是一个通过 Gateway WebSocket 的节点客户端。

## SSH 隧道（CLI + 工具）

创建本地隧道到远程 Gateway WS：

```bash
ssh -N -L 18789:127.0.0.1:18789 user@host # 中文注释：将本地 18789 转发到远程 Gateway
```

隧道建立后：
- `openclaw health` 和 `openclaw status --deep` 通过 `ws://127.0.0.1:18789` 连接远程 Gateway。
- `openclaw gateway {status,health,send,agent,call}` 也可以通过 `--url` 指向转发 URL。

注意：将 `18789` 替换为你的 `gateway.port`（或 `--port`/`OPENCLAW_GATEWAY_PORT`）。

## CLI 远程默认

你可以持久化一个远程目标，让 CLI 默认使用它：

```json5
{
  gateway: {
    mode: "remote",
    remote: {
      url: "ws://127.0.0.1:18789",
      token: "your-token" // 中文注释：远程 CLI 访问令牌
    }
  }
}
```

当 Gateway 仅 loopback 时，保持 URL 为 `ws://127.0.0.1:18789` 并先打开 SSH 隧道。

## 通过 SSH 的聊天 UI

WebChat 不再使用独立 HTTP 端口。SwiftUI Chat UI 直接连接 Gateway WebSocket。

- 通过 SSH 转发 `18789`（见上文），然后客户端连接 `ws://127.0.0.1:18789`。
- 在 macOS 上，优先使用应用的“Remote over SSH”模式，它自动管理隧道。

## macOS 应用“Remote over SSH”

macOS 菜单栏应用可以端到端驱动该设置（远程状态检查、WebChat 和 Voice Wake 转发）。

运行手册：[macOS 远程访问](/platforms/mac/remote)。

## 安全规则（远程/VPN）

短版：**保持 Gateway 仅 loopback**，除非你确定需要绑定。

- **Loopback + SSH/Tailscale Serve** 是最安全的默认（无公共暴露）。
- **非 loopback 绑定**（`lan`/`tailnet`/`custom`，或 loopback 不可用时 `auto`）必须使用认证 token/密码。
- `gateway.remote.token` **仅**用于远程 CLI 调用 — **不会**启用本地认证。
- `gateway.remote.tlsFingerprint` 在使用 `wss://` 时固定远程 TLS 证书。
- **Tailscale Serve** 可在 `gateway.auth.allowTailscale: true` 时通过身份 header 认证。
  设为 `false` 或强制 `gateway.auth.mode: "password"` 可要求显式凭证。
- 将浏览器控制视为操作员访问：仅 tailnet + 谨慎节点配对。

深入了解：[安全](/gateway/security)。
