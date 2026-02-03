---
summary: "OpenClaw Gateway 架构概述"
read_when:
  - 你想了解 Gateway 的整体架构
  - 你需要理解客户端、节点和网关之间的关系
  - 你在调试连接或配对问题
---

# Gateway 架构

本文档描述 OpenClaw Gateway 的核心架构。

## 核心概念

**Gateway（网关）**：一个长期运行的守护进程，管理所有消息平台，包括 WhatsApp（通过 Baileys）、Telegram（通过 grammY）、Slack、Discord、Signal、iMessage 和 WebChat。默认绑定到 `127.0.0.1:18789`。

**Clients（客户端）**：控制平面应用程序（macOS 应用、CLI、Web UI），通过 WebSocket 连接以发送请求和订阅事件。

**Nodes（节点）**：设备（macOS/iOS/Android/无头模式）以 `role: node` 身份连接，暴露 `canvas.*`、`camera.*`、`screen.record` 和 `location.get` 等命令。

## 通信协议

- 使用 WebSocket 和 JSON 文本帧
- 第一帧必须是 `connect` 请求
- 请求格式：`{type:"req", id, method, params}`
- 响应格式：`{type:"res", id, ok, payload|error}`
- 通过 `OPENCLAW_GATEWAY_TOKEN` 或 `--token` 标志进行身份验证
- 有副作用的方法需要幂等键

## 安全与配对

所有客户端在连接时提供设备身份。新设备需要配对批准。本地连接（回环地址）可以自动批准，而"非本地连接必须签署 `connect.challenge` 随机数，并需要显式批准"。

## 远程访问

推荐使用 Tailscale/VPN。SSH 隧道是另一种选择：

```bash
ssh -N -L 18789:127.0.0.1:18789 user@host
```

## 关键约束

- 每台主机一个 Gateway 控制单个 Baileys 会话
- 握手是强制性的；无效的第一帧会导致立即断开连接
- 事件不会重放；客户端必须在出现间隙时刷新
