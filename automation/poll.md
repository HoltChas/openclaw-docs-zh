---
summary: "投票功能"
read_when:
  - 你想了解如何创建投票
  - 你需要在不同频道发送投票
  - 你在使用投票工具
---

# 投票

## 支持的频道

投票功能在三个平台上工作：WhatsApp（web 频道）、Discord 和 MS Teams（使用 Adaptive Cards）。

## CLI 使用

命令结构遵循 `openclaw message poll` 模式，带有各种标志：

**关键选项：**
- `--channel`：指定平台（"whatsapp"是默认值，也可以是"discord"或"msteams"）
- `--target`：接收者（电话号码、群组 ID 或频道/对话 ID）
- `--poll-question`：问题文本
- `--poll-option`：每个选项（多次使用）
- `--poll-multi`：启用多选
- `--poll-duration-hours`：设置投票持续时间（仅 Discord，默认 24 小时）

## Gateway RPC

RPC 方法是 `poll`，参数如下：
- **必需：** `to`、`question`、`options`（数组）、`idempotencyKey`
- **可选：** `maxSelections`、`durationHours`、`channel`

## 频道特定行为

| 平台 | 允许的选项数 | 持续时间支持 | 备注 |
|------|-------------|-------------|------|
| WhatsApp | 2-12 | 忽略 | maxSelections 必须在选项数量内 |
| Discord | 2-10 | 1-768 小时（默认 24） | 无严格选择数量支持 |
| MS Teams | 不定 | 忽略 | 使用 Adaptive Cards；"需要 gateway 保持在线" |

## Agent 工具集成

投票可以通过 `message` 工具使用 `poll` 操作触发，参数包括 `to`、`pollQuestion`、`pollOption`，以及可选的 `pollMulti`、`pollDurationHours` 和 `channel`。

Teams 投票数据存储在 `~/.openclaw/msteams-polls.json`。
