---
summary: "Gateway 心跳机制"
read_when:
  - 你想了解定期 Agent 轮次如何工作
  - 你需要配置心跳间隔
  - 你在调试心跳问题
---

# 心跳

心跳是一个在主会话中运行"定期 Agent 轮次"的功能，允许模型在不产生过多通知的情况下呈现需要关注的项目。

## 快速开始

1. 心跳默认为 30 分钟间隔（Anthropic OAuth/setup-token 为 1 小时）
2. 可选在工作区创建 `HEARTBEAT.md` 检查清单
3. 配置消息投递目标（默认为"last"使用的频道）
4. 可选启用推理投递并限制到活动时间

**基本配置示例：**
```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last",
      },
    },
  },
}
```

## 响应契约

- 当没有需要关注的内容时，Agent 应回复 `HEARTBEAT_OK`
- 此标记在回复开头或结尾被识别，如果剩余内容 ≤ 300 字符则被剥离（可通过 `ackMaxChars` 配置）
- 对于警报，完全省略 `HEARTBEAT_OK`

## 配置选项

关键字段包括：
- **every**：间隔持续时间（使用"0m"禁用）
- **model**：可选模型覆盖
- **target**：投递目标（"last"、"none"或特定频道如"whatsapp"、"telegram"、"discord"等）
- **to**：频道特定接收者覆盖
- **prompt**：自定义提示正文
- **includeReasoning**：启用时投递单独的推理消息
- **session**：心跳运行的会话键

## 作用域优先级

设置从以下级联：`agents.defaults.heartbeat` → `agents.list[].heartbeat` → 频道默认值 → 每频道 → 每账户设置。

## 可见性控制

三个标志控制输出行为：
- **showOk**：是否发送 OK 确认（默认：false）
- **showAlerts**：是否发送警报内容（默认：true）
- **useIndicator**：是否发出指示器事件（默认：true）

## HEARTBEAT.md 文件

这个可选的工作区文件作为 Agent 在心跳期间读取的检查清单。保持它小以避免提示膨胀。如果有指示，Agent 可以更新此文件。空文件会导致跳过心跳以节省 API 成本。

## 手动唤醒

通过以下方式触发即时心跳：
```bash
openclaw system event --text "检查紧急后续" --mode now
```

## 成本考虑

由于心跳运行完整的 Agent 轮次，较短的间隔消耗更多 token。文档建议保持 `HEARTBEAT.md` 小，并考虑使用更便宜的模型或 `target: "none"` 用于仅内部更新。
