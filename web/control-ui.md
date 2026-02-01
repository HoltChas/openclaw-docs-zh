---
summary: "基于浏览器的 Gateway Control UI（聊天、节点、配置）"
read_when:
  - 你想从浏览器操作 Gateway
  - 你想要无需 SSH 隧道的 Tailnet 访问
---
# Control UI（浏览器）

Control UI 是一个由 Gateway 提供的**Vite + Lit**单页应用：

- 默认：`http://<host>:18789/`
- 可选前缀：设置 `gateway.controlUi.basePath`（例如 `/openclaw`）

它**直接通过 WebSocket**在同一端口上与 Gateway 通信。

## 快速打开（本地）

如果 Gateway 在同一台计算机上运行，打开：

- http://127.0.0.1:18789/（或 http://localhost:18789/）

如果页面加载失败，首先启动 Gateway：`openclaw gateway`。

认证通过以下方式在 WebSocket 握手期间提供：
- `connect.params.auth.token`
- `connect.params.auth.password`
Dashboard 设置面板让你存储 token；密码不会持久化。
配置向导默认生成 Gateway token，因此首次连接时粘贴它。

## 它能做什么（今天）
- 通过 Gateway WS 与模型聊天（`chat.history`、`chat.send`、`chat.abort`、`chat.inject`）
- 流式传输工具调用 + 聊天中的实时工具输出卡片（Agent 事件）
- 频道：WhatsApp/Telegram/Discord/Slack + 插件频道（Mattermost 等）状态 + QR 登录 + 每频道配置（`channels.status`、`web.login.*`、`config.patch`）
- 实例：在线列表 + 刷新（`system-presence`）
- 会话：列表 + 每会话思考/详细覆盖（`sessions.list`、`sessions.patch`）
- Cron 任务：列表/添加/运行/启用/禁用 + 运行历史（`cron.*`）
- Skills：状态、启用/禁用、安装、API 密钥更新（`skills.*`）
- 节点：列表 + 功能（`node.list`）
- 执行批准：编辑 Gateway 或节点白名单 + `exec host=gateway/node` 的询问策略（`exec.approvals.*`）
- 配置：查看/编辑 `~/.openclaw/openclaw.json`（`config.get`、`config.set`）
- 配置：验证后应用 + 重启（`config.apply`）并唤醒最后一个活动会话
- 配置写入包括 base-hash 保护以防止覆盖并发编辑
- 配置模式 + 表单渲染（`config.schema`，包括插件 + 频道模式）；原始 JSON 编辑器仍然可用
- 调试：状态/健康/模型快照 + 事件日志 + 手动 RPC 调用（`status`、`health`、`models.list`）
- 日志：Gateway 文件日志的实时尾部，带过滤/导出（`logs.tail`）
- 更新：运行包/git 更新 + 重启（`update.run`）带重启报告

## 聊天行为

- `chat.send` 是**非阻塞**的：它立即确认 `{ runId, status: "started" }`，响应通过 `chat` 事件流式传输。
- 使用相同的 `idempotencyKey` 重新发送在运行时返回 `{ status: "in_flight" }`，完成后返回 `{ status: "ok" }`。
- `chat.inject` 将助手注释附加到会话记录并广播 `chat` 事件用于仅 UI 更新（无 Agent 运行，无频道传递）。
- 停止：
  - 点击**停止**（调用 `chat.abort`）
  - 输入 `/stop`（或 `stop|esc|abort|wait|exit|interrupt`）进行带外中止
  - `chat.abort` 支持 `{ sessionKey }`（无 `runId`）以中止该会话的所有活动运行

## Tailnet 访问（推荐）

### 集成 Tailscale Serve（首选）

让 Gateway 保持在回环上，让 Tailscale Serve 用 HTTPS 代理它：

```bash
# 使用 Tailscale Serve 启动 Gateway
openclaw gateway --tailscale serve
```

打开：
- `https://<magicdns>/`（或你配置的 `gateway.controlUi.basePath`）

默认情况下，当 `gateway.auth.allowTailscale` 为 `true` 时，Serve 请求可以通过 Tailscale 身份头
（`tailscale-user-login`）进行认证。OpenClaw
通过用 `tailscale whois` 解析 `x-forwarded-for` 地址并与头匹配来验证身份，
并且仅在请求命中带有 Tailscale 的 `x-forwarded-*` 头的回环时接受这些。设置
`gateway.auth.allowTailscale: false`（或强制 `gateway.auth.mode: "password"`）
如果你想要求 Serve 流量也需要 token/密码。

### 绑定到 tailnet + token
