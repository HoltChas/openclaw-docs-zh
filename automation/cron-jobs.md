---
summary: "Cron 任务和 Gateway 调度器的唤醒机制"
read_when:
  - 需要调度后台任务或唤醒
  - 需要配置与 Heartbeat 并行运行的自动化
  - 需要决定使用 Heartbeat 还是 Cron 进行定时任务
---
# 定时任务 (Gateway 调度器)

> **Cron 还是 Heartbeat？** 不确定用哪个？看看 [Cron vs Heartbeat](/automation/cron-vs-heartbeat) 了解如何选择。

Cron 是 Gateway 内置的调度器。它会持久化存储任务，在正确的时间唤醒 Agent，还可以选择将输出返回到聊天中。

如果你想实现"每天早上运行"或者"20分钟后提醒我"，Cron 就是你要用的机制。

## 快速了解
- Cron 在 **Gateway 内部**运行（不是在模型内部）。
- 任务存储在 `~/.openclaw/cron/` 下，重启也不会丢失。
- 两种执行方式：
  - **主会话**：将系统事件加入队列，在下次 Heartbeat 时运行。
  - **独立模式**：在 `cron:<jobId>` 中运行一个专门的 Agent 轮次，可选择输出到聊天。
- 唤醒是一等公民：任务可以请求"立即唤醒"或"下次 Heartbeat 唤醒"。

## 新手指南
把 Cron 任务想象成：**什么时候**运行 + **做什么**。

1) **选择调度方式**
   - 一次性提醒 → `schedule.kind = "at"` (CLI: `--at`)
   - 重复任务 → `schedule.kind = "every"` 或 `schedule.kind = "cron"`
   - 如果你的 ISO 时间戳省略了时区，会按 **UTC** 处理。

2) **选择运行位置**
   - `sessionTarget: "main"` → 在下次 Heartbeat 中使用主上下文运行。
   - `sessionTarget: "isolated"` → 在 `cron:<jobId>` 中运行专门的 Agent 轮次。

3) **选择负载内容**
   - 主会话 → `payload.kind = "systemEvent"`
   - 独立会话 → `payload.kind = "agentTurn"`

可选：`deleteAfterRun: true` 在一次性任务成功运行后从存储中删除。

## 核心概念

### 任务
Cron 任务是一个存储记录，包含：
- **调度**（什么时候运行）
- **负载**（做什么）
- 可选的 **传递**（输出到哪里）
- 可选的 **Agent 绑定** (`agentId`)：在特定 Agent 下运行任务；如果缺失或未知，Gateway 会回退到默认 Agent。

任务由稳定的 `jobId` 标识（CLI/Gateway API 使用）。在 Agent 工具调用中，`jobId` 是标准格式；为了兼容也接受旧的 `id`。
任务可以通过 `deleteAfterRun: true` 在成功运行一次性任务后自动删除。

### 调度
Cron 支持三种调度类型：
- `at`：一次性时间戳（毫秒）。Gateway 接受 ISO 8601 并转换为 UTC。
- `every`：固定间隔（毫秒）。
- `cron`：5 字段 Cron 表达式，可选 IANA 时区。

Cron 表达式使用 `croner`。如果省略时区，使用 Gateway 主机的本地时区。

### 主会话 vs 独立执行

#### 主会话任务（系统事件）
主任务将一个系统事件加入队列，并可选地唤醒 Heartbeat 运行器。它们必须使用 `payload.kind = "systemEvent"`。

- `wakeMode: "next-heartbeat"`（默认）：事件等待下一次计划的 Heartbeat。
- `wakeMode: "now"`：事件触发立即的 Heartbeat。

这是最适合使用正常 Heartbeat 提示 + 主会话上下文的场景。
参见 [Heartbeat](/gateway/heartbeat)。

#### 独立任务（专门的 Cron 会话）
独立任务在会话 `cron:<jobId>` 中运行一个专门的 Agent 轮次。

主要行为：
- 提示词前缀为 `[cron:<jobId> <任务名称>]` 以便追踪。
- 每次运行启动一个 **新的会话 ID**（不保留之前的对话）。
- 摘要会发布到主会话（前缀 `Cron`，可配置）。
- `wakeMode: "now"` 在发布摘要后触发立即的 Heartbeat。
- 如果 `payload.deliver: true`，输出会传递到频道；否则保持内部。

对嘈杂的、频繁的或"后台杂务"使用独立任务，这样不会干扰你的主聊天历史。

### 负载格式（做什么）
支持两种负载类型：
- `systemEvent`：仅主会话，通过 Heartbeat 提示路由。
- `agentTurn`：仅独立会话，运行专门的 Agent 轮次。

常见的 `agentTurn` 字段：
- `message`：必需的文本提示。
- `model` / `thinking`：可选覆盖（见下文）。
- `timeoutSeconds`：可选超时覆盖。
- `deliver`：`true` 将输出发送到频道目标。
- `channel`：`last` 或特定频道。
- `to`：频道特定的目标（电话/聊天/频道 ID）。
- `bestEffortDeliver`：如果传递失败，避免任务失败。

隔离选项（仅用于 `session=isolated`）：
- `postToMainPrefix` (CLI: `--post-prefix`)：主会话中系统事件的前缀。
- `postToMainMode`：`summary`（默认）或 `full`。
- `postToMainMaxChars`：`postToMainMode=full` 时的最大字符数（默认 8000）。

### 模型和思考级别覆盖
独立任务 (`agentTurn`) 可以覆盖模型和思考级别：
- `model`：Provider/模型字符串（如 `anthropic/claude-sonnet-4-20250514`）或别名（如 `opus`）
- `thinking`：思考级别（`off`、`minimal`、`low`、`medium`、`high`、`xhigh`；仅 GPT-5.2 + Codex 模型）

注意：你也可以在主会话任务上设置 `model`，但这会改变共享主会话的模型。我们建议仅在独立任务上使用模型覆盖，以避免意外的上下文切换。

解析优先级：
1. 任务负载覆盖（最高）
2. Hook 特定默认值（如 `hooks.gmail.model`）
3. Agent 配置默认值

### 传递（频道 + 目标）
独立任务可以将输出传递到频道。任务负载可以指定：
- `channel`：`whatsapp` / `telegram` / `discord` / `slack` / `mattermost`（插件） / `signal` / `imessage` / `last`
- `to`：频道特定的接收目标

如果省略 `channel` 或 `to`，Cron 可以回退到主会话的"最后路由"（Agent 最后回复的地方）。

传递说明：
- 如果设置了 `to`，即使没有显式的 `deliver`，Cron 也会自动传递 Agent 的最终输出。
- 当你想要最后路由传递而不需要显式 `to` 时，使用 `deliver: true`。
- 使用 `deliver: false` 即使有 `to` 也保持输出内部。

目标格式提醒：
- Slack/Discord/Mattermost（插件）目标应该使用显式前缀（如 `channel:<id>`、`user:<id>`）以避免歧义。
- Telegram 主题应该使用 `:topic:` 形式（见下文）。

#### Telegram 传递目标（主题 / 论坛线程）
Telegram 通过 `message_thread_id` 支持论坛主题。对于 Cron 传递，你可以将主题/线程编码到 `to` 字段：

- `-1001234567890`（仅聊天 ID）
- `-1001234567890:topic:123`（推荐：显式主题标记）
- `-1001234567890:123`（简写：数字后缀）

带前缀的目标如 `telegram:...` / `telegram:group:...` 也被接受：
- `telegram:group:-1001234567890:topic:123`

## 存储和历史
- 任务存储：`~/.openclaw/cron/jobs.json`（Gateway 管理的 JSON）。
- 运行历史：`~/.openclaw/cron/runs/<jobId>.jsonl`（JSONL，自动清理）。
- 覆盖存储路径：配置中的 `cron.store`。

## 配置

```json5
{
  cron: {
    enabled: true, // 默认 true
    store: "~/.openclaw/cron/jobs.json",
    maxConcurrentRuns: 1 // 默认 1
  }
}
```

完全禁用 Cron：
- `cron.enabled: false`（配置）
- `OPENCLAW_SKIP_CRON=1`（环境变量）

## CLI 快速开始

一次性提醒（UTC ISO，成功后自动删除）：
```bash
openclaw cron add \
  --name "发送提醒" \
  --at "2026-01-12T18:00:00Z" \
  --session main \
  --system-event "提醒：提交费用报告。" \
  --wake now \
  --delete-after-run
```

一次性提醒（主会话，立即唤醒）：
```bash
openclaw cron add \
  --name "日历检查" \
  --at "20m" \
  --session main \
  --system-event "下次 Heartbeat：检查日历。" \
  --wake now
```

重复独立任务（传递到 WhatsApp）：
```bash
openclaw cron add \
  --name "早间状态" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "总结今天的收件箱 + 日历。" \
  --deliver \
  --channel whatsapp \
  --to "+15551234567"
```

重复独立任务（传递到 Telegram 主题）：
```bash
openclaw cron add \
  --name "夜间摘要（主题）" \
  --cron "0 22 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "总结今天；发送到夜间主题。" \
  --deliver \
  --channel telegram \
  --to "-1001234567890:topic:123"
```

带模型和思考覆盖的独立任务：
```bash
openclaw cron add \
  --name "深度分析" \
  --cron "0 6 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "每周对项目进度进行深度分析。" \
  --model "opus" \
  --thinking high \
  --deliver \
  --channel whatsapp \
  --to "+15551234567"

Agent 选择（多 Agent 设置）：
```bash
# 将任务绑定到 Agent "ops"（如果该 Agent 缺失则回退到默认）
openclaw cron add --name "Ops 扫描" --cron "0 6 * * *" --session isolated --message "检查 Ops 队列" --agent ops

# 在现有任务上切换或清除 Agent
openclaw cron edit <jobId> --agent ops
openclaw cron edit <jobId> --clear-agent
```

手动运行（调试）：
```bash
openclaw cron run <jobId> --force
```

编辑现有任务（修补字段）：
```bash
openclaw cron edit <jobId> \
  --message "更新的提示" \
  --model "opus" \
  --thinking low
```

运行历史：
```bash
openclaw cron runs --id <jobId> --limit 50
```

无需创建任务的立即系统事件：
```bash
openclaw system event --mode now --text "下次 Heartbeat：检查电池。"
```

## Gateway API 接口
- `cron.list`, `cron.status`, `cron.add`, `cron.update`, `cron.remove`
- `cron.run`（强制或到期运行）, `cron.runs`
对于无需任务的立即系统事件，使用 [`openclaw system event`](/cli/system)。

## 故障排查

### "什么都没运行"
- 检查 Cron 是否启用：`cron.enabled` 和 `OPENCLAW_SKIP_CRON`。
- 检查 Gateway 是否持续运行（Cron 在 Gateway 进程内部运行）。
- 对于 `cron` 调度：确认时区（`--tz`）与主机时区。

### Telegram 传递到错误的地方
- 对于论坛主题，使用 `-100…:topic:<id>` 使其明确无歧义。
- 如果你在日志或存储的"最后路由"目标中看到 `telegram:...` 前缀，这是正常的；Cron 传递接受它们并仍能正确解析主题 ID。