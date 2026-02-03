---
summary: "频道路由机制"
read_when:
  - 你想了解消息如何路由到 Agent
  - 你需要配置多 Agent 绑定
  - 你在调试消息路由问题
---

# 频道路由

OpenClaw 使用由主机配置控制的确定性路由——"模型不会选择频道"。回复会自动返回到发起频道。

## 关键术语

- **Channel（频道）**：支持的平台包括 WhatsApp、Telegram、Discord、Slack、Signal、iMessage 和 WebChat
- **AccountId**：每频道的账户实例
- **AgentId**：隔离的工作区和会话存储（被描述为"大脑"）
- **SessionKey**：上下文存储和并发控制的桶键

## 会话键结构

私信使用 Agent 的主会话，模式为 `agent:<agentId>:<mainKey>`。群组和频道保持隔离，使用如下模式：
- 群组：`agent:<agentId>:<channel>:group:<id>`
- 频道/房间：`agent:<agentId>:<channel>:channel:<id>`

线程附加额外标识符（Slack/Discord 为 `:thread:<threadId>`，Telegram 论坛为 `:topic:<topicId>`）。

## Agent 路由优先级

系统使用以下层次为每条入站消息选择一个 Agent：
1. 通过绑定精确匹配对等方
2. 公会匹配（Discord）
3. 团队匹配（Slack）
4. 账户匹配
5. 频道匹配
6. 默认 Agent（回退到 `main`）

## 广播组

此功能允许同时为同一对等方运行多个 Agent。配置使用带有策略（如"parallel"）和对等方到 Agent 映射的 `broadcast` 对象。

## 配置结构

配置使用 `agents.list` 定义 Agent，使用 `bindings` 将频道/账户/对等方映射到特定 Agent。绑定可以匹配频道类型、团队 ID、公会 ID 或特定对等方标识符。

## 会话存储

会话默认存储在 `~/.openclaw/agents/<agentId>/sessions/sessions.json`，JSONL 记录在旁边。路径可通过 `session.store` 自定义。

## WebChat 和回复上下文

WebChat 连接到所选 Agent 的主会话，提供跨频道上下文可见性。入站回复包含 `ReplyToId`、`ReplyToBody` 和 `ReplyToSender` 字段，引用上下文在所有频道中一致附加。
