---
summary: "节点发现与传输（Bonjour、Tailscale、SSH）"
read_when:
  - 实现或修改 Bonjour 发现/广播
  - 调整远程连接模式（直连 vs SSH）
  - 设计节点发现 + 配对
---
# 发现与传输

OpenClaw 有两个看起来相似但实际不同的问题：

1) **操作员远程控制**：macOS 菜单栏应用控制运行在别处的 Gateway。
2) **节点配对**：iOS/Android（以及未来节点）找到 Gateway 并安全配对。

设计目标是将所有网络发现/广播保留在 **Gateway**（`openclaw gateway`），而客户端（mac 应用、iOS）只是消费者。

## 术语

- **Gateway**：一个长期运行的 Gateway 进程，拥有状态（会话、配对、节点注册）并运行频道。多数设置每台主机一个；也支持隔离多 Gateway。
- **Gateway WS（控制平面）**：默认 `127.0.0.1:18789` 的 WebSocket 端点；可通过 `gateway.bind` 绑定到 LAN/tailnet。
- **直连 WS 传输**：LAN/tailnet 可达的 Gateway WS 端点（无需 SSH）。
- **SSH 传输（回退）**：通过 SSH 转发 `127.0.0.1:18789`。
- **遗留 TCP bridge（已弃用/移除）**：旧节点传输（见 [桥接协议(../gateway/bridge-protocol.html)）；不再广告。

协议详情：
- [Gateway 协议(../gateway/protocol.html)
- [桥接协议（遗留）(../gateway/bridge-protocol.html)

## 为什么同时保留直连和 SSH

- **直连 WS** 是同网/同 tailnet 下体验最佳：
  - LAN 上 Bonjour 自动发现
  - Gateway 拥有配对 token + ACL
  - 不需要 shell 访问；协议表面可保持紧凑可审计
- **SSH** 仍是通用回退：
  - 只要你有 SSH 访问，就能跨任意网络
  - 避免多播/mDNS 问题
  - 不需要新的入站端口（除了 SSH）

## 发现输入（客户端如何知道 Gateway）

### 1) Bonjour / mDNS（仅 LAN）

Bonjour 是尽力而为，不跨网络，仅用于"同一 LAN"的便利性。

目标方向：
- **Gateway** 广播其 WS 端点 via Bonjour。
- 客户端浏览并显示“选择 Gateway”的列表，然后保存所选端点。

排查与 beacon 详情：[Bonjour(../gateway/bonjour.html)。

#### 服务 beacon 详情

- 服务类型：
  - `_openclaw-gw._tcp`（Gateway 传输 beacon）
- TXT 键（非敏感）：
  - `role=gateway`
  - `lanHost=<hostname>.local`
  - `sshPort=22`（或广告的端口）
  - `gatewayPort=18789`（Gateway WS + HTTP）
  - `gatewayTls=1`（仅当 TLS 启用）
  - `gatewayTlsSha256=<sha256>`（仅当 TLS 启用且指纹可用）
  - `canvasPort=18793`（默认 Canvas 主机端口；提供 `/__openclaw__/canvas/`）
  - `cliPath=<path>`（可选；可运行的 `openclaw` 入口或二进制的绝对路径）
  - `tailnetDns=<magicdns>`（可选提示；Tailscale 可用时自动检测）

禁用/覆盖：
- `OPENCLAW_DISABLE_BONJOUR=1` 禁用广播。
- `gateway.bind` 控制 Gateway 绑定模式。
- `OPENCLAW_SSH_PORT` 覆盖 TXT 中广告的 SSH 端口（默认 22）。
- `OPENCLAW_TAILNET_DNS` 发布 `tailnetDns` 提示（MagicDNS）。
- `OPENCLAW_CLI_PATH` 覆盖广告的 CLI 路径。

### 2) Tailnet（跨网络）

对跨城市设置，Bonjour 无效。推荐的直连目标是：
- Tailscale MagicDNS 名称（优先）或稳定 tailnet IP。

如果 Gateway 检测到运行在 Tailscale 下，它会发布 `tailnetDns` 作为可选提示（包括广域 beacon）。

### 3) 手动 / SSH 目标

当没有直连路由（或直连被禁用），客户端总可以通过 SSH 转发 loopback Gateway 端口。

参见 [远程访问(../gateway/remote.html)。

## 传输选择（客户端策略）

推荐客户端行为：

1) 如果配置了已配对的直连端点且可达，使用它。
2) 否则，如果 Bonjour 在 LAN 发现 Gateway，提供一键“使用此 Gateway”并保存为直连端点。
3) 否则，如果配置了 tailnet DNS/IP，尝试直连。
4) 否则，回退到 SSH。

## 配对 + 认证（直连传输）

Gateway 是节点/客户端接入的真相来源。

- 配对请求在 Gateway 中创建/批准/拒绝（见 [Gateway 配对(../gateway/pairing.html)）。
- Gateway 强制：
  - 认证（token / keypair）
  - 范围/ACL（Gateway 不是无差别代理）
  - 速率限制

## 组件职责

- **Gateway**：广播发现 beacon、掌握配对决策并托管 WS 端点。
- **macOS 应用**：帮你选择 Gateway，显示配对提示，并在必要时使用 SSH 回退。
- **iOS/Android 节点**：浏览 Bonjour 作为便利入口并连接到已配对的 Gateway WS。
