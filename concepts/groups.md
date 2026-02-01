---
summary: "跨界面的群组聊天行为（WhatsApp/Telegram/Discord/Slack/Signal/iMessage/Microsoft Teams）"
read_when:
  - 更改群组聊天行为或提及门控
---
# 群组

OpenClaw 在跨界面处理群组聊天时保持一致：WhatsApp、Telegram、Discord、Slack、Signal、iMessage、Microsoft Teams。

## 初学者介绍（2 分钟）
OpenClaw"生活"在你自己的消息账户上。没有单独的 WhatsApp Bot 用户。
如果**你**在群组中，OpenClaw 可以看到该群组并在那里响应。

默认行为：
- 群组受限（`groupPolicy: "allowlist"`）。
- 除非明确禁用提及门控，否则回复需要提及。

翻译：白名单发送者可以通过提及触发 OpenClaw。

> 太长不看
> - **私聊访问**由 `*.allowFrom` 控制。
> - **群组访问**由 `*.groupPolicy` + 白名单（`*.groups`、`*.groupAllowFrom`）控制。
> - **回复触发**由提及门控（`requireMention`、`/activation`）控制。

快速流程（群组消息会发生什么）：
```
groupPolicy? disabled -> 丢弃
groupPolicy? allowlist -> 群组允许？否 -> 丢弃
requireMention? 是 -> 提及？否 -> 仅存储用于上下文
否则 -> 回复
```

![群组消息流程](/images/groups-flow.svg)

如果你想要...
| 目标 | 设置什么 |
|------|-------------|
| 允许所有群组但只在 @提及 时回复 | `groups: { "*": { requireMention: true } }` |
| 禁用所有群组回复 | `groupPolicy: "disabled"` |
| 仅特定群组 | `groups: { "<group-id>": { ... } }`（无 `"*"` 键） |
| 只有你可以在群组中触发 | `groupPolicy: "allowlist"`, `groupAllowFrom: ["+1555..."]` |

## 会话键
- 群组会话使用 `agent:<agentId>:<channel>:group:<id>` 会话键（房间/频道使用 `agent:<agentId>:<channel>:channel:<id>`）。
- Telegram 论坛主题将 `:topic:<threadId>` 添加到群组 id，因此每个主题有自己的会话。
- 直接聊天使用主会话（或如果配置的每发送者）。
- 群组会话跳过心跳。

## 模式：个人私聊 + 公共群组（单 Agent）

可以 —— 如果你的"个人"流量是**私聊**而你的"公共"流量是**群组**，这工作得很好。

为什么：在单 Agent 模式下，私聊通常落在**主**会话键（`agent:main:main`），而群组总是使用**非主**会话键（`agent:main:<channel>:group:<id>`）。如果你启用沙盒，`mode: "non-main"`，那些群组会话在 Docker 中运行，而你的主私聊会话保持在主机上。

这给你一个 Agent"大脑"（共享工作空间 + 记忆），但两种执行姿态：
- **私聊**：完整工具（主机）
- **群组**：沙盒 + 受限工具（Docker）

> 如果你需要真正独立的工作空间/人物（"个人"和"公共"必须永不混合），使用第二个 Agent + 绑定。参见 [多 Agent 路由](/concepts/multi-agent)。

示例（主机上的私聊，沙盒群组 + 仅消息工具）：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // 群组/频道是非主 -> 沙盒化
        scope: "session", // 最强隔离（每个群组/频道一个容器）
        workspaceAccess: "none"
      }
    }
  },
  tools: {
    sandbox: {
      tools: {
        // 如果 allow 非空，其他所有东西被阻塞（deny 仍然获胜）。
        allow: ["group:messaging", "group:sessions"],
        deny: ["group:runtime", "group:fs", "group:ui", "nodes", "cron", "gateway"]
      }
