---
summary: "流式传输 + 分块行为（块回复、草稿流式传输、限制）"
read_when:
  - 解释频道上流式传输或分块的工作原理
  - 更改块流式传输或频道分块行为
  - 调试重复/提前块回复或草稿流式传输
---
# 流式传输 + 分块

OpenClaw 有两个独立的"流式传输"层：
- **块流式传输（频道）：** 在助手写入时发出完成的**块**。这些是普通频道消息（不是 token delta）。
- **类 token 流式传输（仅限 Telegram）：** 在生成时用部分文本更新**草稿气泡**；最终消息在末尾发送。

今天**没有真正的 token 流式传输**到外部频道消息。Telegram 草稿流式传输是唯一的部分流表面。

## 块流式传输（频道消息）

块流式传输在助手输出可用时以粗粒度块发送。

```
模型输出
  └─ text_delta/事件
       ├─ (blockStreamingBreak=text_end)
       │    └─ 分块器在缓冲区增长时发出块
       └─ (blockStreamingBreak=message_end)
            └─ 分块器在 message_end 时刷新
                   └─ 频道发送（块回复）
```
图例：
- `text_delta/事件`：模型流事件（对于非流式模型可能稀疏）。
- `分块器`：`EmbeddedBlockChunker` 应用最小/最大边界 + 中断偏好。
- `频道发送`：实际出站消息（块回复）。

**控制：**
- `agents.defaults.blockStreamingDefault`：`"on"`/`"off"`（默认关闭）。
- 频道覆盖：`*.blockStreaming`（和每账户变体）以强制每频道 `"on"`/`"off"`。
- `agents.defaults.blockStreamingBreak`：`"text_end"` 或 `"message_end"`。
- `agents.defaults.blockStreamingChunk`：`{ minChars, maxChars, breakPreference? }`。
- `agents.defaults.blockStreamingCoalesce`：`{ minChars?, maxChars?, idleMs? }`（发送前合并流式块）。
- 频道硬上限：`*.textChunkLimit`（例如 `channels.whatsapp.textChunkLimit`）。
- 频道分块模式：`*.chunkMode`（默认 `length`，`newline` 在长度分块前按空行（段落边界）分割）。
- Discord 软上限：`channels.discord.maxLinesPerMessage`（默认 17）分割高回复以避免 UI 裁剪。

**边界语义：**
- `text_end`：分块器发出时立即流式传输块；在每个 `text_end` 时刷新。
- `message_end`：等待助手消息完成，然后刷新缓冲的输出。

如果缓冲的文本超过 `maxChars`，`message_end` 仍然使用分块器，因此它可以在末尾发出多个块。

## 分块算法（低/高边界）

块分块由 `EmbeddedBlockChunker` 实现：
- **低边界：** 缓冲区 >= `minChars` 之前不发出（除非强制）。
- **高边界：** 优先在 `maxChars` 之前分割；如果强制，在 `maxChars` 处分割。
- **中断偏好：** `paragraph` → `newline` → `sentence` → `whitespace` → 硬中断。
- **代码围栏：** 永不在围栏内分割；当在 `maxChars` 处强制时，关闭 + 重新打开围栏以保持 Markdown 有效。

`maxChars` 被限制到频道 `textChunkLimit`，因此你不能超过每频道上限。

## 合并（合并流式块）

启用块流式传输时，OpenClaw 可以**在发送前合并连续的块块**。
这减少了"单行垃圾邮件"，同时仍然提供渐进输出。

- 合并在刷新前等待**空闲间隙**（`idleMs`）。
- 缓冲区由 `maxChars` 限制，如果超过将刷新。
- `minChars` 防止微小片段发送，直到累积足够的文本
  （最终刷新总是发送剩余文本）。
- 连接符派生自 `blockStreamingChunk.breakPreference`
  （`paragraph` → `\n\n`，`newline` → `\n`，`sentence` → 空格）。
- 频道覆盖通过 `*.blockStreamingCoalesce` 可用（包括每账户配置）。
- 默认合并 `minChars` 对于 Signal/Slack/Discord 增加到 1500，除非覆盖。

## 块之间的人性化节奏

启用块流式传输时，你可以在块回复之间添加**随机暂停**（在第一块之后）。这使多气泡响应感觉更自然。
