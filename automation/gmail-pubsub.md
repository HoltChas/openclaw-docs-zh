---
summary: "通过 gogcli 将 Gmail Pub/Sub 推送接入 OpenClaw Webhooks"
read_when:
  - 将 Gmail 收件箱触发器接入 OpenClaw
  - 为 Agent 唤醒设置 Pub/Sub 推送
---
# Gmail Pub/Sub -> OpenClaw

目标：Gmail 监视 -> Pub/Sub 推送 -> `gog gmail watch serve` -> OpenClaw Webhook。

## 前置条件

- 已安装并登录 `gcloud`（[安装指南](https://docs.cloud.google.com/sdk/docs/install-sdk)）。
- 已安装并授权 `gog`（gogcli）用于 Gmail 账户（[gogcli.sh](https://gogcli.sh/)）。
- OpenClaw Hooks 已启用（参见 [Webhooks(../automation/webhook.html)）。
- 已登录 `tailscale`（[tailscale.com](https://tailscale.com/)）。支持的设置使用 Tailscale Funnel 作为公共 HTTPS 端点。
  其他隧道服务也可以工作，但需要 DIY/不支持，需要手动接线。
  目前，Tailscale 是我们支持的。

示例 Hook 配置（启用 Gmail 预设映射）：

```json5
{
  hooks: {
    enabled: true,
    token: "OPENCLAW_HOOK_TOKEN",
    path: "/hooks",
    presets: ["gmail"]
  }
}
```

要将 Gmail 摘要传递到聊天界面，用设置 `deliver` + 可选 `channel`/`to` 的映射覆盖预设：

```json5
{
  hooks: {
    enabled: true,
    token: "OPENCLAW_HOOK_TOKEN",
    presets: ["gmail"],
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        wakeMode: "now",
        name: "Gmail",
        sessionKey: "hook:gmail:{{messages[0].id}}",
        messageTemplate:
          "新邮件来自 {{messages[0].from}}\n主题：{{messages[0].subject}}\n{{messages[0].snippet}}\n{{messages[0].body}}",
        model: "openai/gpt-5.2-mini",
        deliver: true,
        channel: "last"
        // to: "+15551234567"
      }
    ]
  }
}
```

如果你想使用固定频道，设置 `channel` + `to`。否则 `channel: "last"` 使用最后传递路由（回退到 WhatsApp）。

要为 Gmail 运行强制使用更便宜的模型，在映射中设置 `model`（`provider/model` 或别名）。如果你强制执行 `agents.defaults.models`，请将其包含在其中。

要专门为 Gmail Hooks 设置默认模型和思考级别，在配置中添加 `hooks.gmail.model` / `hooks.gmail.thinking`：

```json5
{
  hooks: {
    gmail: {
      model: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
      thinking: "off"
    }
  }
}
```

说明：
- 映射中的每个 Hook `model`/`thinking` 仍然覆盖这些默认值。
- 回退顺序：`hooks.gmail.model` → `agents.defaults.model.fallbacks` → 主模型（认证/速率限制/超时）。
- 如果设置了 `agents.defaults.models`，Gmail 模型必须在允许列表中。
- Gmail Hook 内容默认用外部内容安全边界包装。
  要禁用（危险），设置 `hooks.gmail.allowUnsafeExternalContent: true`。

要进一步自定义负载处理，添加 `hooks.mappings` 或 `hooks.transformsDir` 下的 JS/TS 转换模块
（参见 [Webhooks(../automation/webhook.html)）。

## 向导（推荐）

使用 OpenClaw 助手将所有内容连接在一起（在 macOS 上通过 brew 安装依赖）：

```bash
openclaw webhooks gmail setup \
  --account openclaw@gmail.com
```

默认值：
- 使用 Tailscale Funnel 作为公共推送端点。
- 为 `openclaw webhooks gmail run` 写入 `hooks.gmail` 配置。
- 启用 Gmail Hook 预设（`hooks.presets: ["gmail"]`）。

路径说明：当 `tailscale.mode` 启用时，OpenClaw 自动将 `hooks.gmail.serve.path` 设置为 `/`，并将公共路径保持在
`hooks.gmail.tailscale.path`（默认 `/gmail-pubsub`），因为 Tailscale 在代理前会剥离设置的路径前缀。
如果你需要后端接收带前缀的路径，设置 `hooks.gmail.tailscale.target`（或 `--tailscale-target`）为完整 URL 如
`http://127.0.0.1:8788/gmail-pubsub` 并匹配 `hooks.gmail.serve.path`。

想要自定义端点？使用 `--push-endpoint <url>` 或 `--tailscale off`。

平台说明：在 macOS 上，向导通过 Homebrew 安装 `gcloud`、`gogcli` 和 `tailscale`；
在 Linux 上先手动安装它们。

Gateway 自动启动（推荐）：
- 当 `hooks.enabled=true` 且 `hooks.gmail.account` 设置时，Gateway 在启动时启动
  `gog gmail watch serve` 并自动续订监视。
- 设置 `OPENCLAW_SKIP_GMAIL_WATCHER=1` 选择退出（如果你自己运行守护进程）。
- 不要同时运行手动守护进程，否则会遇到
  `listen tcp 127.0.0.1:8788: bind: address already in use`。

手动守护进程（启动 `gog gmail watch serve` + 自动续订）：

```bash
openclaw webhooks gmail run
```

## 一次性设置

1) 选择 **拥有 OAuth 客户端**的 GCP 项目，该客户端用于 `gog`。

```bash
gcloud auth login
gcloud config set project <project-id>
```

注意：Gmail 监视要求 Pub/Sub 主题与 OAuth 客户端在同一项目中。

2) 启用 API：

```bash
gcloud services enable gmail.googleapis.com pubsub.googleapis.com
```

3) 创建主题：

```bash
gcloud pubsub topics create gog-gmail-watch
```

4) 允许 Gmail 推送发布：

```bash
gcloud pubsub topics add-iam-policy-binding gog-gmail-watch \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
  --role=roles/pubsub.publisher
```

## 启动监视

```bash
gog gmail watch start \
  --account openclaw@gmail.com \
  --label INBOX \
  --topic projects/<project-id>/topics/gog-gmail-watch
```

保存输出中的 `history_id`（用于调试）。

## 运行推送处理器

本地示例（共享 token 认证）：

```bash
gog gmail watch serve \
  --account openclaw@gmail.com \
  --bind 127.0.0.1 \
  --port 8788 \
  --path /gmail-pubsub \
  --token <shared> \
  --hook-url http://127.0.0.1:18789/hooks/gmail \
  --hook-token OPENCLAW_HOOK_TOKEN \
  --include-body \
  --max-bytes 20000
```

说明：
- `--token` 保护推送端点（`x-gog-token` 或 `?token=`）。
- `--hook-url` 指向 OpenClaw `/hooks/gmail`（已映射；独立运行 + 摘要到主会话）。
- `--include-body` 和 `--max-bytes` 控制发送到 OpenClaw 的正文片段。

推荐：`openclaw webhooks gmail run` 包装相同的流程并自动续订监视。

## 暴露处理器（高级，不支持）

如果你需要非 Tailscale 隧道，手动接线并使用公共 URL 作为推送订阅（不支持，无保护）：

```bash
cloudflared tunnel --url http://127.0.0.1:8788 --no-autoupdate
```

使用生成的 URL 作为推送端点：

```bash
gcloud pubsub subscriptions create gog-gmail-watch-push \
  --topic gog-gmail-watch \
  --push-endpoint "https://<public-url>/gmail-pubsub?token=<shared>"
```

生产环境：使用稳定的 HTTPS 端点并配置 Pub/Sub OIDC JWT，然后运行：

```bash
gog gmail watch serve --verify-oidc --oidc-email <svc@...>
```

## 测试

发送消息到监视的收件箱：

```bash
gog gmail send \
  --account openclaw@gmail.com \
  --to openclaw@gmail.com \
  --subject "watch test" \
  --body "ping"
```

检查监视状态和历史：

```bash
gog gmail watch status --account openclaw@gmail.com
gog gmail history --account openclaw@gmail.com --since <historyId>
```

## 故障排查

- `Invalid topicName`：项目不匹配（主题不在 OAuth 客户端项目中）。
- `User not authorized`：主题上缺少 `roles/pubsub.publisher`。
- 空消息：Gmail 推送仅提供 `historyId`；通过 `gog gmail history` 获取。

## 清理

```bash
gog gmail watch stop --account openclaw@gmail.com
gcloud pubsub subscriptions delete gog-gmail-watch-push
gcloud pubsub topics delete gog-gmail-watch
```