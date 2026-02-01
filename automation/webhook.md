---
summary: "用于唤醒和独立 Agent 运行的 Webhook 入口"
read_when:
  - 添加或更改 Webhook 端点
  - 将外部系统接入 OpenClaw
---
# Webhooks

Gateway 可以暴露一个简单的 HTTP Webhook 端点供外部触发。

## 启用

```json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks"
  }
}
```

说明：
- 当 `hooks.enabled=true` 时，`hooks.token` 是必需的。
- `hooks.path` 默认为 `/hooks`。

## 认证

每个请求必须包含 hook token。推荐使用 headers：
- `Authorization: Bearer <token>`（推荐）
- `x-openclaw-token: <token>`
- `?token=<token>`（已弃用；会记录警告，将在未来的主要版本中移除）

## 端点

### `POST /hooks/wake`

负载：
```json
{ "text": "系统行", "mode": "now" }
```

- `text` **必需**（字符串）：事件描述（如"收到新邮件"）。
- `mode` 可选（`now` | `next-heartbeat`）：是否触发立即的 Heartbeat（默认 `now`）或等待下一次定期检查。

效果：
- 为 **主**会话加入系统事件队列
- 如果 `mode=now`，触发立即的 Heartbeat

### `POST /hooks/agent`

负载：
```json
{
  "message": "运行这个",
  "name": "Email",
  "sessionKey": "hook:email:msg-123",
  "wakeMode": "now",
  "deliver": true,
  "channel": "last",
  "to": "+15551234567",
  "model": "openai/gpt-5.2-mini",
  "thinking": "low",
  "timeoutSeconds": 120
}
```

- `message` **必需**（字符串）：Agent 处理的提示或消息。
- `name` 可选（字符串）：Hook 的可读名称（如"GitHub"），在会话摘要中用作前缀。
- `sessionKey` 可选（字符串）：用于标识 Agent 会话的键。默认为随机的 `hook:<uuid>`。使用一致的键可以在 Hook 上下文中实现多轮对话。
- `wakeMode` 可选（`now` | `next-heartbeat`）：是否触发立即的 Heartbeat（默认 `now`）或等待下一次定期检查。
- `deliver` 可选（布尔值）：如果为 `true`，Agent 的响应将发送到消息频道。默认为 `true`。仅 Heartbeat 确认的响应会自动跳过。
- `channel` 可选（字符串）：传递的消息频道。可选值：`last`、`whatsapp`、`telegram`、`discord`、`slack`、`mattermost`（插件）、`signal`、`imessage`、`msteams`。默认为 `last`。
- `to` 可选（字符串）：频道的接收者标识符（如 WhatsApp/Signal 的电话号码，Telegram 的聊天 ID，Discord/Slack/Mattermost（插件）的频道 ID，MS Teams 的对话 ID）。默认为主会话中的最后接收者。
- `model` 可选（字符串）：模型覆盖（如 `anthropic/claude-3-5-sonnet` 或别名）。如果在限制模型列表中，则必须被包含。
- `thinking` 可选（字符串）：思考级别覆盖（如 `low`、`medium`、`high`）。
- `timeoutSeconds` 可选（数字）：Agent 运行的最大持续时间（秒）。

效果：
- 运行 **独立** Agent 轮次（自己的会话键）
- 总是向 **主**会话发布摘要
- 如果 `wakeMode=now`，触发立即的 Heartbeat

### `POST /hooks/<name>`（映射）

自定义 Hook 名称通过 `hooks.mappings` 解析（见配置）。映射可以将任意负载转换为 `wake` 或 `agent` 动作，可选模板或代码转换。

映射选项（摘要）：
- `hooks.presets: ["gmail"]` 启用内置 Gmail 映射。
- `hooks.mappings` 允许你在配置中定义 `match`、`action` 和模板。
- `hooks.transformsDir` + `transform.module` 加载 JS/TS 模块进行自定义逻辑。
- 使用 `match.source` 保持通用入口点（由负载驱动的路由）。
- TS 转换需要 TS 加载器（如 `bun` 或 `tsx`）或运行时的预编译 `.js`。
- 在映射上设置 `deliver: true` + `channel`/`to` 将回复路由到聊天界面
  （`channel` 默认为 `last` 并回退到 WhatsApp）。
- `allowUnsafeExternalContent: true` 禁用该 Hook 的外部内容安全包装器
  （危险；仅用于受信任的内部源）。
- `openclaw webhooks gmail setup` 为 `openclaw webhooks gmail run` 写入 `hooks.gmail` 配置。
参见 [Gmail Pub/Sub](/automation/gmail-pubsub) 了解完整的 Gmail 监视流程。

## 响应

- `/hooks/wake` 返回 `200`
- `/hooks/agent` 返回 `202`（异步运行已开始）
- 认证失败返回 `401`
- 无效负载返回 `400`
- 超大负载返回 `413`

## 示例

```bash
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"text":"收到新邮件","mode":"now"}'
```

```bash
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'x-openclaw-token: SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"message":"总结收件箱","name":"Email","wakeMode":"next-heartbeat"}'
```

### 使用不同模型

在 Agent 负载（或映射）中添加 `model` 以覆盖该运行的模型：

```bash
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'x-openclaw-token: SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"message":"总结收件箱","name":"Email","model":"openai/gpt-5.2-mini"}'
```

如果你强制执行 `agents.defaults.models`，请确保覆盖模型包含在其中。

```bash
curl -X POST http://127.0.0.1:18789/hooks/gmail \
  -H 'Authorization: Bearer SECRET' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gmail","messages":[{"from":"Ada","subject":"Hello","snippet":"Hi"}]}'
```

## 安全

- 将 Hook 端点保留在环回、tailnet 或受信任的反向代理后面。
- 使用专用的 Hook token；不要重用 Gateway 认证 token。
- 避免在 Webhook 日志中包含敏感原始负载。
- Hook 负载默认被视为不可信，并用安全边界包装。
  如果必须为特定 Hook 禁用此功能，在该 Hook 的映射中设置 `allowUnsafeExternalContent: true`
  （危险）。