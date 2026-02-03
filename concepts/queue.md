---
summary: "命令队列系统"
read_when:
  - 你想了解消息如何排队处理
  - 你需要配置队列模式
  - 你在调试消息处理顺序问题
---

# 命令队列

命令队列系统使用进程内队列在所有频道间序列化入站自动回复运行。这可以防止 Agent 运行冲突，同时"允许跨会话的安全并行"。

## 设计原理

- LLM 调用成本高昂，当消息快速连续到达时可能发生冲突
- 序列化防止对共享资源（如会话文件、日志和 CLI stdin）的竞争
- 有助于避免上游速率限制

## 架构

系统使用**通道感知的 FIFO 队列**，具有可配置的并发性：
- 未配置的通道默认 1 个并发运行
- 主通道默认 4 个
- 子 Agent 通道默认 8 个

会话运行按会话键入队，然后进入由 `agents.defaults.maxConcurrent` 限制的全局通道。输入指示器在入队时立即触发以维护用户体验。

## 队列模式

| 模式 | 行为 |
|------|------|
| `steer` | 立即注入当前运行；如果未在流式传输则回退到 followup |
| `followup` | 在当前运行完成后为下一个 Agent 轮次入队 |
| `collect` | 将排队的消息合并为单个后续轮次（默认） |
| `steer-backlog` | 立即引导并保留消息用于后续 |
| `interrupt` | 旧版：中止活动运行，运行最新消息 |
| `queue` | 旧版 steer 别名 |

## 配置

通过 `messages.queue` 进行全局/每频道配置：

```json5
{
  messages: {
    queue: {
      mode: "collect",
      debounceMs: 1000,
      cap: 20,
      drop: "summarize",
      byChannel: { discord: "collect" },
    },
  },
}
```

## 队列选项

- **debounceMs**：开始后续处理前的静默期（默认：1000）
- **cap**：每个会话的最大排队消息数（默认：20）
- **drop**：溢出策略 - `old`、`new` 或 `summarize`（默认：summarize）

## 每会话覆盖

用户可以发送 `/queue <mode>` 命令，组合选项如 `/queue collect debounce:2s cap:25 drop:summarize`。使用 `/queue default` 或 `/queue reset` 清除覆盖。

## 支持的频道

适用于 WhatsApp web、Telegram、Slack、Discord、Signal、iMessage、webchat 和其他 Gateway 回复管道频道。

## 故障排除

启用详细日志可查看"queued for …ms"行，确认队列排空和时间信息。
