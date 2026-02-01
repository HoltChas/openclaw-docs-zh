---
summary: "WhatsApp 群消息处理行为与配置（mentionPatterns 跨平台共用）"
read_when:
  - 修改群消息规则或提及配置
---
# 群消息（WhatsApp web 频道）

目标：让 Clawd 在 WhatsApp 群里待命，只有被点名才唤醒，并且群聊与个人 DM 会话分开。

注意：`agents.list[].groupChat.mentionPatterns` 现在也被 Telegram/Discord/Slack/iMessage 使用；本文聚焦 WhatsApp 的具体行为。多 Agent 设置下，请给每个 Agent 设置 `agents.list[].groupChat.mentionPatterns`（或用 `messages.groupChat.mentionPatterns` 作为全局回退）。

## 已实现内容（2025-12-03）
- 激活模式：`mention`（默认）或 `always`。`mention` 需要被点名（真实的 WhatsApp @mention，通过 `mentionedJids`，正则匹配或机器人 E.164 出现在文本中）。`always` 会在每条消息上唤醒 Agent，但它应该只在有价值时回复，否则返回静默 token `NO_REPLY`。默认值可在配置中设置（`channels.whatsapp.groups`），并可通过 `/activation` 在每个群覆盖。当设置 `channels.whatsapp.groups` 时，它也作为群允许列表（包含 `"*"` 允许所有）。
- 群策略：`channels.whatsapp.groupPolicy` 控制是否接受群消息（`open|disabled|allowlist`）。`allowlist` 使用 `channels.whatsapp.groupAllowFrom`（回退：明确 `channels.whatsapp.allowFrom`）。默认是 `allowlist`（在你添加发送者之前会阻止）。
- 群会话隔离：会话键形如 `agent:<agentId>:whatsapp:group:<jid>`，因此 `/verbose on` 或 `/think high`（作为独立消息发送）仅作用于该群；个人 DM 状态不受影响。群聊会话不运行 Heartbeat。
- 上下文注入：**仅待处理**的群消息（默认 50 条）且未触发运行时会被前缀为 `[Chat messages since your last reply - for context]`，触发消息在 `[Current message - respond to this]` 中。已在会话里的消息不会重复注入。
- 发送者显示：每个群批次末尾附加 `[from: Sender Name (+E164)]`，方便 Agent 知道是谁在说话。
- 临时/阅后即焚消息：解析文本/提及时先展开，因此其中的提及仍可触发。
- 群系统提示：群会话第一次运行时（以及 `/activation` 改变模式时），系统提示会注入一段短说明，例如：`你正在 WhatsApp 群 "<subject>" 中回复。群成员：Alice (+44...) ... 激活模式：仅触发 ... 请对上下文中标记的发送者回复。` 如果元数据不可用，也会提示这是群聊。

## 配置示例（WhatsApp）

在 `~/.openclaw/openclaw.json` 中添加 `groupChat`，即使 WhatsApp 文本中不显示 `@`，显示名的 ping 也能工作：

```json5
{
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: true } // 中文注释：所有群都需要被提及才触发
      }
    }
  },
  agents: {
    list: [
      {
        id: "main",
        groupChat: {
          historyLimit: 50, // 中文注释：注入的历史上限
          mentionPatterns: [
            "@?openclaw", // 中文注释：匹配显示名提及
            "\\+?15555550123" // 中文注释：匹配号码（可带 +）
          ]
        }
      }
    ]
  }
}
```

说明：
- 正则是大小写不敏感；覆盖显示名 ping（如 `@openclaw`）和原始号码（带或不带 `+`/空格）。
- WhatsApp 仍会在有人点击联系人时通过 `mentionedJids` 发送标准提及，所以号码回退很少需要，但它是个安全网。

### 激活命令（仅所有者）

在群聊中使用：
- `/activation mention`
- `/activation always`

只有所有者号码（来自 `channels.whatsapp.allowFrom`，或当未设置时使用机器人自己的 E.164）可以更改该设置。在群里发送 `/status` 作为独立消息可查看当前激活模式。

## 如何使用
1) 将运行 OpenClaw 的 WhatsApp 账号加入群。
2) 说 `@openclaw ...`（或包含号码）。除非你设置 `groupPolicy: "open"`，否则只有允许列表发送者能触发。
3) Agent 提示会包含最近群上下文，并带 `[from: …]` 标记以便对正确的人回复。
4) 会话级指令（`/verbose on`、`/think high`、`/new` 或 `/reset`、`/compact`）仅作用于该群的会话；请作为独立消息发送以便注册。个人 DM 会话保持独立。

## 测试 / 验证
- 手动冒烟测试：
  - 在群里发送 `@openclaw` 并确认回复引用发送者姓名。
  - 发送第二次 ping 并验证历史块被包含，然后在下一次轮次被清除。
- 检查 Gateway 日志（用 `--verbose`）查看 `inbound web message` 条目显示 `from: <groupJid>` 和 `[from: …]` 后缀。

## 已知注意事项
- 群聊故意跳过 Heartbeat，避免噪声广播。
- 回声抑制使用合并批次字符串；如果你两次发送相同文本且未提及，只有第一次会收到回复。
- 会话存储条目会出现在 `agent:<agentId>:whatsapp:group:<jid>`（默认在 `~/.openclaw/agents/<agentId>/sessions/sessions.json`）；缺失条目只意味着群还没触发运行。
- 群内输入指示遵循 `agents.defaults.typingMode`（默认：未提及时为 `message`）。
