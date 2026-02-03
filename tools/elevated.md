---
summary: "提升模式"
read_when:
  - 你想了解如何在主机上执行命令
  - 你需要配置提升权限
  - 你在调试提升模式问题
---

# 提升模式

提升模式允许执行命令在 Gateway 主机上运行，而不是在沙箱环境中。该功能通过 `/elevated` 或 `/elev` 指令控制。

## 可用模式

- **`/elevated on`** 或 **`/elevated ask`**：在 Gateway 主机上执行，同时保持审批要求
- **`/elevated full`**：在 Gateway 主机上运行并"自动批准 exec（跳过 exec 审批）"
- **`/elevated off`**：禁用提升模式

文档指出"只接受 `on|off|ask|full`；其他任何内容返回提示且不改变状态"。

## 作用域和控制

该功能管理几个方面：

- **可用性门控**：在全局（`tools.elevated`）和每 Agent 级别控制
- **会话状态**：指令为当前会话设置提升级别
- **内联使用**：消息中的指令仅应用于该特定消息
- **群组行为**：群聊中的指令需要提及 Agent

重要限制："如果 `exec` 被工具策略拒绝，则无法使用提升模式"。

## 解析优先级

1. 内联指令（消息特定）
2. 会话覆盖
3. 通过 `agents.defaults.elevatedDefault` 的全局默认值

## 配置和允许列表

关键配置选项包括：
- `tools.elevated.enabled` - 功能门控
- `tools.elevated.allowFrom` - 按提供者的发送者允许列表（discord、whatsapp 等）
- 在 `agents.list[].tools.elevated` 的每 Agent 设置

对于 Discord，如果未配置允许列表，系统回退到 `channels.discord.dm.allowFrom`。

## 监控

提升执行调用以 info 级别记录，会话状态显示当前提升模式。
