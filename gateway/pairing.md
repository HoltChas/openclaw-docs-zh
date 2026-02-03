---
summary: "Gateway 配对机制"
read_when:
  - 你想了解节点如何配对到 Gateway
  - 你需要管理配对请求
  - 你在调试配对问题
---

# Gateway 配对

Gateway 拥有的配对（选项 B）将 Gateway 建立为节点成员资格的权威来源。macOS 应用等 UI 作为批准或拒绝请求的前端。

**关键区别：** WebSocket 节点在连接期间使用设备配对，但 `node.pair.*` 系统是"独立的配对存储"，不控制 WS 握手。

## 核心概念

- **待处理请求**：寻求批准加入的节点
- **已配对节点**：已批准的节点，带有已发放的认证令牌
- **传输**：Gateway WS 端点转发请求但不决定成员资格

## 配对流程

1. 节点连接到 Gateway WS 并请求配对
2. Gateway 存储待处理请求并发出 `node.pair.requested`
3. 用户通过 CLI 或 UI 批准/拒绝
4. 批准后，Gateway 发放新令牌（重新配对时令牌轮换）
5. 节点使用令牌重新连接

待处理请求有 **5 分钟过期时间**。

## CLI 命令

```bash
openclaw nodes pending
openclaw nodes approve <requestId>
openclaw nodes reject <requestId>
openclaw nodes status
openclaw nodes rename --node <id|name|ip> --name "客厅 iPad"
```

## API 方法和事件

**事件：** `node.pair.requested` 和 `node.pair.resolved`

**方法：** `node.pair.request`、`node.pair.list`、`node.pair.approve`、`node.pair.reject`、`node.pair.verify`

request 方法是幂等的——重复调用返回相同的待处理请求。请求可以包含 `silent: true` 用于自动批准流程。

## 自动批准（macOS）

当请求标记为 silent 且 SSH 验证与同一用户成功时，尝试静默批准。如果失败则回退到手动提示。

## 存储

状态文件位于 `~/.openclaw/nodes/`（或遵循 `OPENCLAW_STATE_DIR`）：
- `paired.json`（包含敏感令牌）
- `pending.json`

## 传输说明

传输是无状态的。配对需要 Gateway 在线，远程模式配对使用远程 Gateway 的存储。
