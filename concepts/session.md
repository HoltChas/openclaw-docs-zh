---
summary: "会话管理规则、键和持久化"
read_when:
  - 修改会话处理或存储
---
# 会话管理

OpenClaw 将 **每个 Agent 的一个直聊会话** 视为主会话。直聊会折叠到 `agent:<agentId>:<mainKey>`（默认 `main`），而群/频道有自己的键。`session.mainKey` 会被尊重。

使用 `session.dmScope` 控制 **直聊** 如何分组：
- `main`（默认）：所有 DM 共享主会话以保持连续性。
- `per-peer`：按发送者 id 跨频道隔离。
- `per-channel-peer`：按频道 + 发送者隔离（适合多用户收件箱）。
- `per-account-channel-peer`：按账号 + 频道 + 发送者隔离（适合多账号收件箱）。
使用 `session.identityLinks` 将 provider 前缀的 peer id 映射到一个规范身份，让同一个人跨频道共享 DM 会话（在 `per-peer`、`per-channel-peer` 或 `per-account-channel-peer` 下生效）。

## Gateway 是真相来源
所有会话状态 **由 Gateway 维护**（“主” OpenClaw）。UI 客户端（macOS 应用、WebChat 等）必须向 Gateway 查询会话列表和 token 计数，而不是读取本地文件。

- 在 **远程模式** 下，你关心的会话存储在远程 Gateway 主机上，而不是你的 Mac。
- UI 显示的 token 计数来自 Gateway 的存储字段（`inputTokens`、`outputTokens`、`totalTokens`、`contextTokens`）。客户端不会解析 JSONL 转录来“修复”总数。

## 状态存储在哪里
- 在 **Gateway 主机** 上：
  - 存储文件：`~/.openclaw/agents/<agentId>/sessions/sessions.json`（每个 Agent）。
- 转录：`~/.openclaw/agents/<agentId>/sessions/<SessionId>.jsonl`（Telegram 主题会话使用 `.../<SessionId>-topic-<threadId>.jsonl`）。
- 存储是 `sessionKey -> { sessionId, updatedAt, ... }` 的映射。删除条目是安全的；它们按需重新创建。
- 群条目可能包含 `displayName`、`channel`、`subject`、`room`、`space` 用于 UI 标注。
- 会话条目包含 `origin` 元数据（标签 + 路由提示），使 UI 能解释会话来自哪里。
- OpenClaw **不读取**旧版 Pi/Tau 会话文件夹。

## 会话修剪
OpenClaw 在 LLM 调用前默认会**修剪旧工具结果**，减少上下文。
这 **不会** 重写 JSONL 历史。参见 [/concepts/session-pruning(../concepts/session-pruning.html)。

## 预压缩内存刷新
当会话接近自动压缩时，OpenClaw 可运行一个 **静默内存刷新** 轮次，提醒模型将持久笔记写入磁盘。仅在工作区可写时运行。参见 [记忆(../concepts/memory.html) 和 [压缩(../concepts/compaction.html)。

## 传输 → 会话键映射
- 直聊遵循 `session.dmScope`（默认 `main`）。
  - `main`：`agent:<agentId>:<mainKey>`（跨设备/频道连续）。
    - 多手机号和频道可映射到同一个 Agent 主键，它们作为一段对话的不同传输层。
  - `per-peer`：`agent:<agentId>:dm:<peerId>`。
  - `per-channel-peer`：`agent:<agentId>:<channel>:dm:<peerId>`。
  - `per-account-channel-peer`：`agent:<agentId>:<channel>:<accountId>:dm:<peerId>`（accountId 默认 `default`）。
  - 如果 `session.identityLinks` 匹配 provider 前缀 peer id（比如 `telegram:123`），将用规范 key 替换 `<peerId>`，让同一人跨频道共享会话。
- 群聊隔离：`agent:<agentId>:<channel>:group:<id>`（频道/空间用 `agent:<agentId>:<channel>:channel:<id>`）。
  - Telegram 论坛主题在 group id 上追加 `:topic:<threadId>` 以隔离。
  - 遗留 `group:<id>` 键仍被识别用于迁移。
- 入站上下文仍可能使用 `group:<id>`；频道从 `Provider` 推断并规范为 `agent:<agentId>:<channel>:group:<id>`。
- 其他来源：
  - Cron 任务：`cron:<job.id>`
  - Webhooks：`hook:<uuid>`（除非显式设置）
  - Node 运行：`node-<nodeId>`

## 生命周期
- 重置策略：会话复用直到过期，过期在下一条入站消息时评估。
- 每日重置：默认 **Gateway 主机本地时间上午 4:00**。如果会话最后更新早于最近一次每日重置时间，则会话过期。
- 空闲重置（可选）：`idleMinutes` 添加滑动空闲窗口。当同时设置每日和空闲重置时，**先过期的规则生效**。
- 旧版仅空闲：如果你设置了 `session.idleMinutes` 且没有 `session.reset`/`resetByType`，OpenClaw 为兼容保持仅空闲模式。
- 按类型覆盖（可选）：`resetByType` 可覆盖 `dm`、`group`、`thread` 会话（thread = Slack/Discord 线程、Telegram 主题、Matrix 线程）。
- 按频道覆盖（可选）：`resetByChannel` 覆盖某个频道的重置策略（适用于该频道所有会话类型，并优先于 `reset`/`resetByType`）。
- 重置触发：精确 `/new` 或 `/reset`（加上 `resetTriggers` 中的额外触发）启动新会话 id 并传递剩余消息。`/new <model>` 接受模型别名、`provider/model` 或 Provider 名称（模糊匹配）并设置新会话模型。如果 `/new` 或 `/reset` 单独发送，OpenClaw 会运行一个简短的“hello”确认重置。
- 手动重置：从存储删除特定键或移除 JSONL 转录；下一条消息会重建它们。
- 独立 Cron 任务每次运行都会生成新的 `sessionId`（不复用空闲）。

## 发送策略（可选）

无需列出单个 id，就能阻止某些会话类型的发送。

```json5
{
  session: {
    sendPolicy: {
      rules: [
        { action: "deny", match: { channel: "discord", chatType: "group" } }, // 中文注释：禁用 Discord 群发送
        { action: "deny", match: { keyPrefix: "cron:" } } // 中文注释：禁用 cron 会话发送
      ],
      default: "allow"
    }
  }
}
```

运行时覆盖（仅所有者）：
- `/send on` → 此会话允许发送
- `/send off` → 此会话拒绝发送
- `/send inherit` → 清除覆盖并使用配置规则
请作为独立消息发送以便注册。

## 配置（可选重命名示例）
```json5
// ~/.openclaw/openclaw.json
{
  session: {
    scope: "per-sender",      // 中文注释：保持群键分离
    dmScope: "main",          // 中文注释：DM 连续性（共享收件箱建议 per-channel-peer/per-account-channel-peer）
    identityLinks: {
      alice: ["telegram:123456789", "discord:987654321012345678"] // 中文注释：同一人跨平台共享会话
    },
    reset: {
      // 中文注释：默认 mode=daily, atHour=4（Gateway 主机本地时间）
      // 如果也设置 idleMinutes，先过期者生效
      mode: "daily",
      atHour: 4,
      idleMinutes: 120
    },
    resetByType: {
      thread: { mode: "daily", atHour: 4 },
      dm: { mode: "idle", idleMinutes: 240 },
      group: { mode: "idle", idleMinutes: 120 }
    },
    resetByChannel: {
      discord: { mode: "idle", idleMinutes: 10080 }
    },
    resetTriggers: ["/new", "/reset"],
    store: "~/.openclaw/agents/{agentId}/sessions/sessions.json",
    mainKey: "main",
  }
}
```

## 查看/排查
- `openclaw status` — 显示存储路径和最近会话。
- `openclaw sessions --json` — 输出所有条目（用 `--active <minutes>` 过滤）。
- `openclaw gateway call sessions.list --params '{}'` — 从运行中的 Gateway 获取会话（远程 Gateway 用 `--url`/`--token`）。
- 在聊天中单独发送 `/status` 查看 Agent 是否可用、会话上下文占用、当前 thinking/verbose 开关、WhatsApp web 凭证最近刷新时间（用于识别重连需求）。
- 发送 `/context list` 或 `/context detail` 查看系统提示和注入的工作区文件（最大上下文贡献者）。
- 发送 `/stop` 作为独立消息以中止当前运行、清除该会话的队列跟进，并停止由该会话启动的子 Agent 运行（回复包含停止数量）。
- 发送 `/compact`（可选说明）作为独立消息以总结旧上下文并释放窗口空间。参见 [/concepts/compaction(../concepts/compaction.html)。
- 可直接打开 JSONL 转录查看完整轮次。

## 小贴士
- 主键保持给 1:1 流量；群聊保持自己的键。
- 自动化清理时删除单个键而不是整个存储，以便保留其他上下文。

## 会话 origin 元数据
每个会话条目尽力记录来源（`origin`）：
- `label`：人类可读标签（由对话标签 + 群主题/频道解析）
- `provider`：规范化频道 id（含扩展）
- `from`/`to`：入站信封中的原始路由 id
- `accountId`：频道账号 id（多账号）
- `threadId`：频道支持的 thread/topic id

这些字段在直聊、频道和群聊中都会填充。如果某个连接器仅更新传递路由（例如保持 DM 主会话鲜活），它仍应提供入站上下文以便会话保留解释性元数据。扩展可以通过发送 `ConversationLabel`、`GroupSubject`、`GroupChannel`、`GroupSpace`、`SenderName` 并调用 `recordSessionMetaFromInbound`（或传递相同上下文给 `updateLastRoute`）来实现。
