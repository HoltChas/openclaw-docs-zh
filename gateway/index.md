---
summary: "OpenClaw Gateway 运行手册"
read_when:
  - 你想了解如何运行和管理 Gateway
  - 你需要配置 Gateway 服务
  - 你在调试 Gateway 连接问题
---

# Gateway 运行手册

## 什么是 Gateway？

Gateway 是一个"始终运行的进程，拥有单个 Baileys/Telegram 连接以及控制/事件平面"。它持续运行，在致命错误时以非零状态退出，以便监控程序可以重启它。

## 本地运行

```bash
openclaw gateway --port 18789
openclaw gateway --port 18789 --verbose  # 调试日志
openclaw gateway --force  # 先终止现有监听器
```

关键配置点：

- 默认端口：**18789**（WebSocket + HTTP 复用）
- 配置文件：`~/.openclaw/openclaw.json`
- Canvas 文件服务器默认运行在端口 **18793**
- 默认需要通过令牌或密码进行身份验证

## 远程访问

推荐使用 Tailscale/VPN。或者使用 SSH 隧道：

```bash
ssh -N -L 18789:127.0.0.1:18789 user@host
```

## 协议基础

客户端必须发送 `connect` 请求作为第一帧。Gateway 响应 `hello-ok`，包含存在状态、健康状况和状态的快照。握手后，通信使用请求/响应对和事件流。

**可用方法**：`health`、`status`、`system-presence`、`send`、`agent`、`node.list`、`node.invoke` 以及配对操作。

**事件**：`agent`、`presence`、`tick`、`shutdown`

## 服务管理

```bash
openclaw gateway install
openclaw gateway status
openclaw gateway stop
openclaw gateway restart
openclaw logs --follow
```

在 **macOS** 上，使用 launchd 和 LaunchAgents。在 **Linux/WSL2** 上，使用 systemd 用户服务（使用 `sudo loginctl enable-linger youruser` 启用持久化）。

## 多 Gateway

通常不需要——一个 Gateway 可以处理多个频道。如果需要隔离或冗余，请确保每个实例使用唯一的端口、配置路径、状态目录和工作区。

## 运维检查

- **存活检查**：通过 WebSocket 连接，期望收到 `hello-ok`
- **就绪检查**：调用 `health` 方法，验证已链接频道的状态
