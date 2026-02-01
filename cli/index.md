---
summary: "OpenClaw CLI 命令参考，包含 `openclaw` 命令、子命令和选项"
read_when:
  - 添加或修改 CLI 命令或选项
  - 编写新命令的文档
---

# CLI 参考

这篇文档描述了当前 CLI 的行为。如果命令有变动，记得更新本文档。

## 命令页面

- [`setup`(../cli/setup.html) — 初始化配置
- [`onboard`(../cli/onboard.html) — 引导式设置向导
- [`configure`(../cli/configure.html) — 交互式配置
- [`config`(../cli/config.html) — 非交互式配置管理
- [`doctor`(../cli/doctor.html) — 健康检查与修复
- [`dashboard`(../cli/dashboard.html) — 打开控制台
- [`reset`(../cli/reset.html) — 重置本地状态
- [`uninstall`(../cli/uninstall.html) — 卸载服务
- [`update`(../cli/update.html) — 更新 OpenClaw
- [`message`(../cli/message.html) — 统一的消息发送与频道操作
- [`agent`(../cli/agent.html) — 运行单次 Agent 对话
- [`agents`(../cli/agents.html) — 管理隔离的 Agent
- [`acp`(../cli/acp.html) — 运行 ACP 桥接
- [`status`(../cli/status.html) — 显示会话健康状态
- [`health`(../cli/health.html) — 获取 Gateway 健康状态
- [`sessions`(../cli/sessions.html) — 列出存储的会话
- [`gateway`(../cli/gateway.html) — 管理 Gateway 服务
- [`logs`(../cli/logs.html) — 查看 Gateway 日志
- [`system`(../cli/system.html) — 系统事件与心跳
- [`models`(../cli/models.html) — 模型管理
- [`memory`(../cli/memory.html) — 向量搜索记忆
- [`nodes`(../cli/nodes.html) — 管理节点
- [`devices`(../cli/devices.html) — 设备管理
- [`node`(../cli/node.html) — 节点主机管理
- [`approvals`(../cli/approvals.html) — 管理审批
- [`sandbox`(../cli/sandbox.html) — 沙盒管理
- [`tui`(../cli/tui.html) — 终端 UI
- [`browser`(../cli/browser.html) — 浏览器控制
- [`cron`(../cli/cron.html) — 定时任务
- [`dns`(../cli/dns.html) — DNS 配置
- [`docs`(../cli/docs.html) — 文档搜索
- [`hooks`(../cli/hooks.html) — 钩子管理
- [`webhooks`(../cli/webhooks.html) — Webhook 管理
- [`pairing`(../cli/pairing.html) — 配对管理
- [`plugins`(../cli/plugins.html) — 插件管理
- [`channels`(../cli/channels.html) — 频道管理
- [`security`(../cli/security.html) — 安全审计
- [`skills`(../cli/skills.html) — 技能管理
- [`voicecall`(../cli/voicecall.html) — 语音通话（需安装插件）

## 全局标志

- `--dev`: 将状态隔离到 `~/.openclaw-dev` 并切换默认端口
- `--profile <name>`: 将状态隔离到 `~/.openclaw-<name>`
- `--no-color`: 禁用 ANSI 颜色
- `--update`: 简写为 `openclaw update`（仅源码安装有效）
- `-V`, `--version`, `-v`: 打印版本并退出

## 输出样式

- 仅在 TTY 会话中渲染 ANSI 颜色和进度指示器
- OSC-8 超链接在支持的终端中显示为可点击链接；否则回退为纯文本 URL
- `--json`（以及支持的 `--plain`）禁用样式以获得干净的输出
- `--no-color` 禁用 ANSI 样式；也支持 `NO_COLOR=1`
- 长时间运行的命令显示进度指示器（支持 OSC 9;4）

## 配色方案

OpenClaw 使用龙虾配色方案进行 CLI 输出。

- `accent` (#FF5A2D): 标题、标签、主要高亮
- `accentBright` (#FF7A3D): 命令名称、强调
- `accentDim` (#D14A22): 次要高亮文本
- `info` (#FF8A5B): 信息值
- `success` (#2FBF71): 成功状态
- `warn` (#FFB020): 警告、回退、注意
- `error` (#E23D2D): 错误、失败
- `muted` (#8B7F77): 淡化、元数据

配色方案源文件：`src/terminal/palette.ts`（又称 "lobster seam"）

## 命令树

```
openclaw [--dev] [--profile <name>] <command>
  setup                    # 初始化配置
  onboard                  # 交互式引导
  configure                # 配置向导
  config                   # 配置管理
    get                    # 获取配置值
    set                    # 设置配置值
    unset                  # 删除配置值
  doctor                   # 健康检查
  security                 # 安全相关
    audit                  # 安全审计
  reset                    # 重置
  uninstall                # 卸载
  update                   # 更新
  channels                 # 频道管理
    list                   # 列出频道
    status                 # 检查频道状态
    logs                   # 查看频道日志
    add                    # 添加频道
    remove                 # 移除频道
    login                  # 登录频道
    logout                 # 登出频道
  skills                   # 技能管理
    list                   # 列出技能
    info                   # 技能详情
    check                  # 检查技能状态
  plugins                  # 插件管理
    list                   # 列出插件
    info                   # 插件详情
    install                # 安装插件
    enable                 # 启用插件
    disable                # 禁用插件
    doctor                 # 插件诊断
  memory                   # 记忆搜索
    status                 # 索引状态
    index                  # 重新索引
    search                 # 语义搜索
  message                  # 消息操作
  agent                    # 单次 Agent 运行
  agents                   # Agent 管理
    list                   # 列出 Agent
    add                    # 添加 Agent
    delete                 # 删除 Agent
  acp                      # ACP 桥接
  status                   # 状态查看
  health                   # 健康检查
  sessions                 # 会话管理
  gateway                  # Gateway 管理
    call                   # RPC 调用
    health                 # 健康检查
    status                 # 状态查看
    probe                  # 探针测试
    discover               # 发现服务
    install                # 安装服务
    uninstall              # 卸载服务
    start                  # 启动服务
    stop                   # 停止服务
    restart                # 重启服务
    run                    # 运行 Gateway
  logs                     # 日志查看
  system                   # 系统管理
    event                  # 系统事件
    heartbeat              # 心跳控制
    presence               # 在线状态
  models                   # 模型管理
    list                   # 列出模型
    status                 # 模型状态
    set                    # 设置默认模型
    set-image              # 设置图像模型
    aliases                # 模型别名
    fallbacks              # 回退模型
    image-fallbacks        # 图像回退
    scan                   # 扫描模型
    auth                   # 认证管理
  sandbox                  # 沙盒管理
    list                   # 列出沙盒
    recreate               # 重建沙盒
    explain                # 解释策略
  cron                     # 定时任务
    status                 # 查看状态
    list                   # 列出任务
    add                    # 添加任务
    edit                   # 编辑任务
    rm                     # 删除任务
    enable                 # 启用任务
    disable                # 禁用任务
    runs                   # 运行记录
    run                    # 立即运行
  nodes                    # 节点管理
  devices                  # 设备管理
  node                     # 节点主机
    run                    # 运行节点
    status                 # 查看状态
    install                # 安装服务
    uninstall              # 卸载服务
    start                  # 启动服务
    stop                   # 停止服务
    restart                # 重启服务
  approvals                # 审批管理
    get                    # 获取审批
    set                    # 设置审批
    allowlist              # 白名单管理
  browser                  # 浏览器控制
    status                 # 查看状态
    start                  # 启动浏览器
    stop                   # 停止浏览器
    reset-profile          # 重置配置
    tabs                   # 标签页列表
    open                   # 打开页面
    focus                  # 聚焦标签页
    close                  # 关闭标签页
    profiles               # 配置文件列表
    create-profile         # 创建配置
    delete-profile         # 删除配置
    screenshot             # 截图
    snapshot               # 页面快照
    navigate               # 导航
    resize                 # 调整大小
    click                  # 点击元素
    type                   # 输入文本
    press                  # 按键
    hover                  # 悬停
    drag                   # 拖拽
    select                 # 选择
    upload                 # 上传文件
    fill                   # 填充表单
    dialog                 # 处理对话框
    wait                   # 等待
    evaluate               # 执行代码
    console                # 控制台日志
    pdf                    # 导出 PDF
  hooks                    # 钩子管理
    list                   # 列出钩子
    info                   # 钩子详情
    check                  # 检查可用性
    enable                 # 启用钩子
    disable                # 禁用钩子
    install                # 安装钩子
    update                 # 更新钩子
  webhooks                 # Webhook 管理
    gmail                  # Gmail 集成
  pairing                  # 配对管理
    list                   # 列出请求
    approve                # 批准配对
  docs                     # 文档搜索
  dns                      # DNS 配置
    setup                  # 设置 DNS
  tui                      # 终端 UI
```

注意：插件可以添加额外的顶级命令（例如 `openclaw voicecall`）。

## 安全

- `openclaw security audit` — 审计配置和本地状态是否存在常见安全问题
- `openclaw security audit --deep` — 最佳努力的实时 Gateway 探测
- `openclaw security audit --fix` — 收紧安全默认值并设置权限

## 插件

管理扩展及其配置：

- `openclaw plugins list` — 发现插件（使用 `--json` 获取机器可读输出）
- `openclaw plugins info <id>` — 显示插件详情
- `openclaw plugins install <path|.tgz|npm-spec>` — 安装插件（或添加插件路径到 `plugins.load.paths`）
- `openclaw plugins enable <id>` / `disable <id>` — 切换 `plugins.entries.<id>.enabled`
- `openclaw plugins doctor` — 报告插件加载错误

大多数插件更改需要重启 Gateway。详见 [/plugin](../plugin.html)。

## 记忆（Memory）

对 `MEMORY.md` + `memory/*.md` 进行向量搜索：

- `openclaw memory status` — 显示索引统计
- `openclaw memory index` — 重新索引记忆文件
- `openclaw memory search "<query>"` — 对记忆进行语义搜索

## 聊天斜杠命令

聊天消息支持 `/...` 命令（文本和原生）。详见 [/tools/slash-commands(../tools/slash-commands.html)。

亮点：
- `/status` 快速诊断
- `/config` 持久化配置更改
- `/debug` 运行时配置覆盖（内存中，不写入磁盘；需要 `commands.debug: true`）

## 设置与引导

### `setup`
初始化配置 + 工作空间。

选项：
- `--workspace <dir>`: Agent 工作空间路径（默认 `~/.openclaw/workspace`）
- `--wizard`: 运行引导向导
- `--non-interactive`: 无提示运行向导
- `--mode <local|remote>`: 向导模式
- `--remote-url <url>`: 远程 Gateway URL
- `--remote-token <token>`: 远程 Gateway 令牌

当存在任何向导标志时（`--non-interactive`, `--mode`, `--remote-url`, `--remote-token`），向导会自动运行。

### `onboard`
交互式向导，设置 Gateway、工作空间和技能。

选项：
- `--workspace <dir>`
- `--reset`（在向导前重置配置 + 凭证 + 会话 + 工作空间）
- `--non-interactive`
- `--mode <local|remote>`
- `--flow <quickstart|advanced|manual>`（manual 是 advanced 的别名）
- `--auth-choice <选项>`: 选择认证方式
- `--token-provider <id>`: 令牌提供者
- `--token <token>`: 令牌
- `--token-profile-id <id>`: 令牌配置文件 ID
- `--token-expires-in <duration>`: 令牌过期时间
- `--anthropic-api-key <key>`
- `--openai-api-key <key>`
- `--openrouter-api-key <key>`
- `--ai-gateway-api-key <key>`
- `--moonshot-api-key <key>`
- `--kimi-code-api-key <key>`
- `--gemini-api-key <key>`
- `--zai-api-key <key>`
- `--minimax-api-key <key>`
- `--opencode-zen-api-key <key>`
- `--gateway-port <port>`: Gateway 端口
- `--gateway-bind <loopback|lan|tailnet|auto|custom>`: 绑定模式
- `--gateway-auth <token|password>`: 认证方式
- `--gateway-token <token>`: 令牌
- `--gateway-password <password>`: 密码
- `--remote-url <url>`: 远程 URL
- `--remote-token <token>`: 远程令牌
- `--tailscale <off|serve|funnel>`: Tailscale 模式
- `--tailscale-reset-on-exit`
- `--install-daemon`: 安装守护进程
- `--no-install-daemon`: 跳过守护进程
- `--daemon-runtime <node|bun>`: 运行时
- `--skip-channels`: 跳过频道
- `--skip-skills`: 跳过技能
- `--skip-health`: 跳过健康检查
- `--skip-ui`: 跳过 UI
- `--node-manager <npm|pnpm|bun>`: 节点管理器（推荐 pnpm）
- `--json`: JSON 输出

### `configure`
交互式配置向导（模型、频道、技能、Gateway）。

### `config`
非交互式配置助手（get/set/unset）。不带子命令运行 `openclaw config` 会启动向导。

子命令：
- `config get <path>`: 打印配置值（点号/括号路径）
- `config set <path> <value>`: 设置值（JSON5 或原始字符串）
- `config unset <path>`: 删除值

### `doctor`
健康检查 + 快速修复（配置 + Gateway + 旧版服务）。

选项：
- `--no-workspace-suggestions`: 禁用工作空间记忆提示
- `--yes`: 无提示接受默认值（无头模式）
- `--non-interactive`: 跳过提示；仅应用安全的迁移
- `--deep`: 扫描系统服务以查找额外的 Gateway 安装

## 频道助手

### `channels`
管理聊天频道账户（WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost/Signal/iMessage/MS Teams）。

子命令：
- `channels list`: 显示已配置的频道和认证配置文件
- `channels status`: 检查 Gateway 可访问性和频道健康（`--probe` 运行额外检查；使用 `openclaw health` 或 `openclaw status --deep` 进行 Gateway 健康探测）
  - 提示：`channels status` 在检测到常见错误配置时会打印警告和建议修复（然后指向 `openclaw doctor`）
- `channels logs`: 从 Gateway 日志文件显示最近的频道日志
- `channels add`: 无标志时向导式设置；标志切换到非交互模式
- `channels remove`: 默认禁用；传递 `--delete` 可无提示删除配置条目
- `channels login`: 交互式频道登录（仅 WhatsApp Web）
- `channels logout`: 登出频道会话（如果支持）

常用选项：
- `--channel <name>`: `whatsapp|telegram|discord|googlechat|slack|mattermost|signal|imessage|msteams`
- `--account <id>`: 频道账户 ID（默认 `default`）
- `--name <label>`: 账户显示名称

`channels login` 选项：
- `--channel <channel>`（默认 `whatsapp`；支持 `whatsapp`/`web`）
- `--account <id>`
- `--verbose`

`channels logout` 选项：
- `--channel <channel>`（默认 `whatsapp`）
- `--account <id>`

`channels list` 选项：
- `--no-usage`: 跳过模型提供者使用/配额快照（仅限 OAuth/API 支持的）
- `--json`: JSON 输出

`channels logs` 选项：
- `--channel <name|all>`（默认 `all`）
- `--lines <n>`（默认 `200`）
- `--json`

更多详情：[/concepts/oauth(../concepts/oauth.html)

示例：
```bash
# 添加 Telegram 频道
openclaw channels add --channel telegram --account alerts --name "Alerts Bot" --token $TELEGRAM_BOT_TOKEN

# 添加 Discord 频道
openclaw channels add --channel discord --account work --name "Work Bot" --token $DISCORD_BOT_TOKEN

# 移除 Discord 频道
openclaw channels remove --channel discord --account work --delete

# 检查状态
openclaw channels status --probe
openclaw status --deep
```

### `skills`
列出并检查可用技能及其就绪信息。

子命令：
- `skills list`: 列出技能（无子命令时默认）
- `skills info <name>`: 显示单个技能详情
- `skills check`: 就绪与缺失需求的摘要

选项：
- `--eligible`: 仅显示就绪技能
- `--json`: JSON 输出（无样式）
- `-v`, `--verbose`: 包含缺失需求详情

提示：使用 `npx clawdhub` 搜索、安装和同步技能。

### `pairing`
批准跨频道的 DM 配对请求。

子命令：
- `pairing list <channel> [--json]`
- `pairing approve <channel> <code> [--notify]`

### `webhooks gmail`
Gmail Pub/Sub 钩子设置 + 运行器。详见 [/automation/gmail-pubsub(../automation/gmail-pubsub.html)。

子命令：
- `webhooks gmail setup`（需要 `--account <email>`；支持 `--project`, `--topic`, `--subscription`, `--label`, `--hook-url`, `--hook-token`, `--push-token`, `--bind`, `--port`, `--path`, `--include-body`, `--max-bytes`, `--renew-minutes`, `--tailscale`, `--tailscale-path`, `--tailscale-target`, `--push-endpoint`, `--json`）
- `webhooks gmail run`（相同标志的运行时覆盖）

### `dns setup`
广域发现 DNS 助手（CoreDNS + Tailscale）。详见 [/gateway/discovery(../gateway/discovery.html)。

选项：
- `--apply`: 安装/更新 CoreDNS 配置（需要 sudo；仅 macOS）

## 消息与 Agent

### `message`
统一出站消息 + 频道操作。

详见：[/cli/message(../cli/message.html)

子命令：
- `message send|poll|react|reactions|read|edit|delete|pin|unpin|pins|permissions|search|timeout|kick|ban`
- `message thread <create|list|reply>`
- `message emoji <list|upload>`
- `message sticker <send|upload>`
- `message role <info|add|remove>`
- `message channel <info|list>`
- `message member info`
- `message voice status`
- `message event <list|create>`

示例：
```bash
# 发送消息
openclaw message send --target +15555550123 --message "Hi"

# 创建投票
openclaw message poll --channel discord --target channel:123 --poll-question "Snack?" --poll-option Pizza --poll-option Sushi
```

### `agent`
通过 Gateway 运行单次 Agent 对话（或 `--local` 嵌入式）。

必需：
- `--message <text>`

选项：
- `--to <dest>`（用于会话键和可选投递）
- `--session-id <id>`
- `--thinking <off|minimal|low|medium|high|xhigh>`（仅 GPT-5.2 + Codex 模型）
- `--verbose <on|full|off>`
- `--channel <whatsapp|telegram|discord|slack|mattermost|signal|imessage|msteams>`
- `--local`
- `--deliver`
- `--json`
- `--timeout <seconds>`

### `agents`
管理隔离的 Agent（工作空间 + 认证 + 路由）。

#### `agents list`
列出已配置的 Agent。

选项：
- `--json`
- `--bindings`

#### `agents add [name]`
添加新的隔离 Agent。除非传递标志（或 `--non-interactive`），否则运行引导向导；非交互模式需要 `--workspace`。

选项：
- `--workspace <dir>`
- `--model <id>`
- `--agent-dir <dir>`
- `--bind <channel[:accountId]>`（可重复）
- `--non-interactive`
- `--json`

绑定规格使用 `channel[:accountId]`。对于 WhatsApp，省略 `accountId` 时使用默认账户 ID。

#### `agents delete <id>`
删除 Agent 并清理其工作空间 + 状态。

选项：
- `--force`
- `--json`

### `acp`
运行连接 IDE 到 Gateway 的 ACP 桥接。

详见 [`acp`(../cli/acp.html) 获取完整选项和示例。

### `status`
显示链接的会话健康和最近收件人。

选项：
- `--json`
- `--all`（完整诊断；只读，可粘贴）
- `--deep`（探测频道）
- `--usage`（显示模型提供者使用/配额）
- `--timeout <ms>`
- `--verbose`
- `--debug`（`--verbose` 的别名）

注意：
- 概览包括 Gateway + 节点主机服务状态（如果可用）

### 使用跟踪
OpenClaw 可以在 OAuth/API 凭证可用时显示提供者使用/配额。

显示位置：
- `/status`（可用时添加简短的提供者使用行）
- `openclaw status --usage`（打印完整的提供者细分）
- macOS 菜单栏（Context 下的 Usage 部分）

注意：
- 数据直接来自提供者使用端点（无估算）
- 提供者：Anthropic、GitHub Copilot、OpenAI Codex OAuth，以及启用了相应提供者插件时的 Gemini CLI/Antigravity
- 如果没有匹配的凭证，使用信息隐藏
- 详情：参见 [使用跟踪(../concepts/usage-tracking.html)

### `health`
从运行的 Gateway 获取健康状态。

选项：
- `--json`
- `--timeout <ms>`
- `--verbose`

### `sessions`
列出存储的对话会话。

选项：
- `--json`
- `--verbose`
- `--store <path>`
- `--active <minutes>`

## 重置 / 卸载

### `reset`
重置本地配置/状态（保留 CLI 安装）。

选项：
- `--scope <config|config+creds+sessions|full>`
- `--yes`
- `--non-interactive`
- `--dry-run`

注意：
- `--non-interactive` 需要 `--scope` 和 `--yes`

### `uninstall`
卸载 Gateway 服务 + 本地数据（保留 CLI）。

选项：
- `--service`
- `--state`
- `--workspace`
- `--app`
- `--all`
- `--yes`
- `--non-interactive`
- `--dry-run`

注意：
- `--non-interactive` 需要 `--yes` 和显式范围（或 `--all`）

## Gateway

### `gateway`
运行 WebSocket Gateway。

选项：
- `--port <port>`
- `--bind <loopback|tailnet|lan|auto|custom>`
- `--token <token>`
- `--auth <token|password>`
- `--password <password>`
- `--tailscale <off|serve|funnel>`
- `--tailscale-reset-on-exit`
- `--allow-unconfigured`
- `--dev`
- `--reset`（重置 dev 配置 + 凭证 + 会话 + 工作空间）
- `--force`（杀死端口上的现有监听器）
- `--verbose`
- `--claude-cli-logs`
- `--ws-log <auto|full|compact>`
- `--compact`（`--ws-log compact` 的别名）
- `--raw-stream`
- `--raw-stream-path <path>`

### `gateway service`
管理 Gateway 服务（launchd/systemd/schtasks）。

子命令：
- `gateway status`（默认探测 Gateway RPC）
- `gateway install`（服务安装）
- `gateway uninstall`
- `gateway start`
- `gateway stop`
- `gateway restart`

注意：
- `gateway status` 默认使用服务的解析端口/配置探测 Gateway RPC（用 `--url/--token/--password` 覆盖）
- `gateway status` 支持 `--no-probe`, `--deep`, 和 `--json` 用于脚本
- `gateway status` 还显示检测到的旧版或额外 Gateway 服务（`--deep` 添加系统级扫描）
- `gateway status` 打印 CLI 使用的配置路径与服务可能使用的配置路径（服务环境），以及解析的探测目标 URL
- `gateway install|uninstall|start|stop|restart` 支持 `--json` 用于脚本（默认输出保持人类友好）
- `gateway install` 默认使用 Node 运行时；**不推荐** bun（WhatsApp/Telegram bug）
- `gateway install` 选项：`--port`, `--runtime`, `--token`, `--force`, `--json`

### `logs`
通过 RPC 跟踪 Gateway 文件日志。

注意：
- TTY 会话渲染彩色结构化视图；非 TTY 回退为纯文本
- `--json` 发出换行分隔的 JSON（每行一个日志事件）

示例：
```bash
openclaw logs --follow
openclaw logs --limit 200
openclaw logs --plain
openclaw logs --json
openclaw logs --no-color
```

### `gateway <subcommand>`
Gateway CLI 助手（RPC 子命令使用 `--url`, `--token`, `--password`, `--timeout`, `--expect-final`）。

子命令：
- `gateway call <method> [--params <json>]`
- `gateway health`
- `gateway status`
- `gateway probe`
- `gateway discover`
- `gateway install|uninstall|start|stop|restart`
- `gateway run`

常用 RPC：
- `config.apply`（验证 + 写入配置 + 重启 + 唤醒）
- `config.patch`（合并部分更新 + 重启 + 唤醒）
- `update.run`（运行更新 + 重启 + 唤醒）

提示：直接调用 `config.set`/`config.apply`/`config.patch` 时，如果配置已存在，传递 `baseHash` 来自 `config.get`。

## 模型

详见 [/concepts/models(../concepts/models.html) 了解回退行为和扫描策略。

首选 Anthropic 认证（setup-token）：

```bash
claude setup-token
openclaw models auth setup-token --provider anthropic
openclaw models status
```

### `models` (根命令)
`openclaw models` 是 `models status` 的别名。

根选项：
- `--status-json`（`models status --json` 的别名）
- `--status-plain`（`models status --plain` 的别名）

### `models list`
选项：
- `--all`
- `--local`
- `--provider <name>`
- `--json`
- `--plain`

### `models status`
选项：
- `--json`
- `--plain`
- `--check`（退出码 1=过期/缺失，2=即将过期）
- `--probe`（配置的认证配置文件的实时探测）
- `--probe-provider <name>`
- `--probe-profile <id>`（重复或逗号分隔）
- `--probe-timeout <ms>`
- `--probe-concurrency <n>`
- `--probe-max-tokens <n>`

始终包含认证概览和 auth 存储中配置文件的 OAuth 过期状态。
`--probe` 运行实时请求（可能消耗令牌并触发速率限制）。

### `models set <model>`
设置 `agents.defaults.model.primary`。

### `models set-image <model>`
设置 `agents.defaults.imageModel.primary`。

### `models aliases list|add|remove`
选项：
- `list`: `--json`, `--plain`
- `add <alias> <model>`
- `remove <alias>`

### `models fallbacks list|add|remove|clear`
选项：
- `list`: `--json`, `--plain`
- `add <model>`
- `remove <model>`
- `clear`

### `models image-fallbacks list|add|remove|clear`
选项：
- `list`: `--json`, `--plain`
- `add <model>`
- `remove <model>`
- `clear`

### `models scan`
选项：
- `--min-params <b>`
- `--max-age-days <days>`
- `--provider <name>`
- `--max-candidates <n>`
- `--timeout <ms>`
- `--concurrency <n>`
- `--no-probe`
- `--yes`
- `--no-input`
- `--set-default`
- `--set-image`
- `--json`

### `models auth add|setup-token|paste-token`
选项：
- `add`: 交互式认证助手
- `setup-token`: `--provider <name>`（默认 `anthropic`）, `--yes`
- `paste-token`: `--provider <name>`, `--profile-id <id>`, `--expires-in <duration>`

### `models auth order get|set|clear`
选项：
- `get`: `--provider <name>`, `--agent <id>`, `--json`
- `set`: `--provider <name>`, `--agent <id>`, `<profileIds...>`
- `clear`: `--provider <name>`, `--agent <id>`

## 系统

### `system event`
入队系统事件并可选触发心跳（Gateway RPC）。

必需：
- `--text <text>`

选项：
- `--mode <now|next-heartbeat>`
- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

### `system heartbeat last|enable|disable`
心跳控制（Gateway RPC）。

选项：
- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

### `system presence`
列出系统在线状态条目（Gateway RPC）。

选项：
- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

## Cron 定时任务

管理计划任务（Gateway RPC）。详见 [/automation/cron-jobs(../automation/cron-jobs.html)。

子命令：
- `cron status [--json]`
- `cron list [--all] [--json]`（默认表格输出；使用 `--json` 获取原始数据）
- `cron add`（别名：`create`；需要 `--name` 和 `--at`|`--every`|`--cron` 之一，以及 `--system-event`|`--message` 之一作为负载）
- `cron edit <id>`（修补字段）
- `cron rm <id>`（别名：`remove`, `delete`）
- `cron enable <id>`
- `cron disable <id>`
- `cron runs --id <id> [--limit <n>]`
- `cron run <id> [--force]`

所有 `cron` 命令接受 `--url`, `--token`, `--timeout`, `--expect-final`。

## 节点主机

`node` 运行**无头节点主机**或将其作为后台服务管理。详见 [`openclaw node`(../cli/node.html)。

子命令：
- `node run --host <gateway-host> --port 18789`
- `node status`
- `node install [--host <gateway-host>] [--port <port>] [--tls] [--tls-fingerprint <sha256>] [--node-id <id>] [--display-name <name>] [--runtime <node|bun>] [--force]`
- `node uninstall`
- `node stop`
- `node restart`

## 节点

`nodes` 与 Gateway 通信并定位配对节点。详见 [/nodes](../nodes/index.html)。

常用选项：
- `--url`, `--token`, `--timeout`, `--json`

子命令：
- `nodes status [--connected] [--last-connected <duration>]`
- `nodes describe --node <id|name|ip>`
- `nodes list [--connected] [--last-connected <duration>]`
- `nodes pending`
- `nodes approve <requestId>`
- `nodes reject <requestId>`
- `nodes rename --node <id|name|ip> --name <displayName>`
- `nodes invoke --node <id|name|ip> --command <command> [--params <json>] [--invoke-timeout <ms>] [--idempotency-key <key>]`
- `nodes run --node <id|name|ip> [--cwd <path>] [--env KEY=VAL] [--command-timeout <ms>] [--needs-screen-recording] [--invoke-timeout <ms>] <command...>`（mac 节点或无头节点主机）
- `nodes notify --node <id|name|ip> [--title <text>] [--body <text>] [--sound <name>] [--priority <passive|active|timeSensitive>] [--delivery <system|overlay|auto>] [--invoke-timeout <ms>]`（仅 mac）

相机：
- `nodes camera list --node <id|name|ip>`
- `nodes camera snap --node <id|name|ip> [--facing front|back|both] [--device-id <id>] [--max-width <px>] [--quality <0-1>] [--delay-ms <ms>] [--invoke-timeout <ms>]`
- `nodes camera clip --node <id|name|ip> [--facing front|back] [--device-id <id>] [--duration <ms|10s|1m>] [--no-audio] [--invoke-timeout <ms>]`

画布 + 屏幕：
- `nodes canvas snapshot --node <id|name|ip> [--format png|jpg|jpeg] [--max-width <px>] [--quality <0-1>] [--invoke-timeout <ms>]`
- `nodes canvas present --node <id|name|ip> [--target <urlOrPath>] [--x <px>] [--y <px>] [--width <px>] [--height <px>] [--invoke-timeout <ms>]`
- `nodes canvas hide --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes canvas navigate <url> --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes canvas eval [<js>] --node <id|name|ip> [--js <code>] [--invoke-timeout <ms>]`
- `nodes canvas a2ui push --node <id|name|ip> (--jsonl <path> | --text <text>) [--invoke-timeout <ms>]`
- `nodes canvas a2ui reset --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes screen record --node <id|name|ip> [--screen <index>] [--duration <ms|10s>] [--fps <n>] [--no-audio] [--out <path>] [--invoke-timeout <ms>]`

位置：
- `nodes location get --node <id|name|ip> [--max-age <ms>] [--accuracy <coarse|balanced|precise>] [--location-timeout <ms>] [--invoke-timeout <ms>]`

## 浏览器

浏览器控制 CLI（专用 Chrome/Brave/Edge/Chromium）。详见 [`openclaw browser`(../cli/browser.html) 和 [Browser 工具(../tools/browser.html)。

常用选项：
- `--url`, `--token`, `--timeout`, `--json`
- `--browser-profile <name>`

管理：
- `browser status`
- `browser start`
- `browser stop`
- `browser reset-profile`
- `browser tabs`
- `browser open <url>`
- `browser focus <targetId>`
- `browser close [targetId]`
- `browser profiles`
- `browser create-profile --name <name> [--color <hex>] [--cdp-url <url>]`
- `browser delete-profile --name <name>`

检查：
- `browser screenshot [targetId] [--full-page] [--ref <ref>] [--element <selector>] [--type png|jpeg]`
- `browser snapshot [--format aria|ai] [--target-id <id>] [--limit <n>] [--interactive] [--compact] [--depth <n>] [--selector <sel>] [--out <path>]`

操作：
- `browser navigate <url> [--target-id <id>]`
- `browser resize <width> <height> [--target-id <id>]`
- `browser click <ref> [--double] [--button <left|right|middle>] [--modifiers <csv>] [--target-id <id>]`
- `browser type <ref> <text> [--submit] [--slowly] [--target-id <id>]`
- `browser press <key> [--target-id <id>]`
- `browser hover <ref> [--target-id <id>]`
- `browser drag <startRef> <endRef> [--target-id <id>]`
- `browser select <ref> <values...> [--target-id <id>]`
- `browser upload <paths...> [--ref <ref>] [--input-ref <inputRef>] [--element <selector>] [--target-id <id>] [--timeout-ms <ms>]`
- `browser fill [--fields <json>] [--fields-file <path>] [--target-id <id>]`
- `browser dialog --accept|--dismiss [--prompt <text>] [--target-id <id>] [--timeout-ms <ms>]`
- `browser wait [--time <ms>] [--text <value>] [--text-gone <value>] [--target-id <id>]`
- `browser evaluate --fn <code> [--ref <ref>] [--target-id <id>]`
- `browser console [--level <error|warn|info>] [--target-id <id>]`
- `browser pdf [--target-id <id>]`

## 文档搜索

### `docs [query...]`
搜索实时文档索引。

## TUI

### `tui`
打开连接到 Gateway 的终端 UI。

选项：
- `--url <url>`
- `--token <token>`
- `--password <password>`
- `--session <key>`
- `--deliver`
- `--thinking <level>`
- `--message <text>`
- `--timeout-ms <ms>`（默认 `agents.defaults.timeoutSeconds`）
- `--history-limit <n>`
