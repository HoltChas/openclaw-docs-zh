---
summary: "会话工具"
read_when:
  - 你想了解如何在会话间通信
  - 你需要列出或查询会话历史
  - 你在使用 sessions_spawn 生成子 Agent
---

# 会话工具

会话工具提供"小型、难以误用的工具集"，使 Agent 能够列出会话、获取历史记录并与其他会话通信。

## 四个核心工具

### 1. sessions_list
将会话列为数组，支持可选过滤。

**参数：**
- `kinds?` - 按类型过滤：main、group、cron、hook、node 或 other
- `limit?` - 返回的最大行数
- `activeMinutes?` - 过滤到 N 分钟内更新的会话
- `messageLimit?` - 包含最后 N 条消息（0 = 无，默认）

**行数据包括：** key、kind、channel、displayName、updatedAt、sessionId、model、token 计数、thinking/verbose 级别、sendPolicy、投递上下文和记录路径。

### 2. sessions_history
检索特定会话的记录。

**参数：**
- `sessionKey`（必需）- 接受 key 或 sessionId
- `limit?` - 最大消息数
- `includeTools?` - 是否包含工具结果消息（默认：false）

### 3. sessions_send
向另一个会话发送消息，支持可选等待行为。

**参数：**
- `sessionKey`（必需）
- `message`（必需）
- `timeoutSeconds?` - 0 表示即发即忘，>0 等待回复

**回复循环：** 在主运行之后，Agent 可以交替响应最多 5 轮（可配置）。使用 `REPLY_SKIP` 停止乒乓，或在宣布步骤中使用 `ANNOUNCE_SKIP` 保持静默。

### 4. sessions_spawn
为任务创建隔离的子 Agent 会话。

**参数：**
- `task`（必需）
- `label?` - 用于日志/UI
- `agentId?` - 如果允许，在不同 Agent 下生成
- `model?` - 覆盖模型
- `runTimeoutSeconds?` - N 秒后中止
- `cleanup?` - delete 或 keep（默认：keep）

子 Agent 不能生成额外的子 Agent，默认禁用会话工具。会话默认在 60 分钟后自动归档。

## 键模型

- 主聊天使用字面键 `"main"`
- 群组：`agent:<agentId>:<channel>:group:<id>`
- Cron：`cron:<job.id>`
- 钩子：`hook:<uuid>`
- 节点：`node-<nodeId>`

## 安全 / 发送策略

按频道和聊天类型的基于策略的阻止：

```json
{
  "session": {
    "sendPolicy": {
      "rules": [
        {
          "match": { "channel": "discord", "chatType": "group" },
          "action": "deny"
        }
      ],
      "default": "allow"
    }
  }
}
```

运行时覆盖可通过 `sessions.patch` 或 `/send on|off|inherit` 命令。

## 沙箱可见性

沙箱化会话默认只能看到它们生成的会话。配置：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        sessionToolsVisibility: "spawned", // 或 "all"
      },
    },
  },
}
```

## 频道值

支持的频道：whatsapp、telegram、discord、signal、imessage、webchat、internal、unknown。
