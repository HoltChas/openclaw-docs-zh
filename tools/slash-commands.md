---
summary: "斜杠命令：文本 vs 原生、配置和支持的命令"
read_when:
  - 使用或配置聊天命令
  - 调试命令路由或权限
---
# 斜杠命令

命令由 Gateway 处理。大多数命令必须以 **独立**消息形式发送，以 `/` 开头。
仅主机 Bash 聊天命令使用 `! <cmd>`（`/bash <cmd>` 作为别名）。

有两个相关系统：

- **命令**：独立的 `/...` 消息。
- **指令**：`/think`、`/verbose`、`/reasoning`、`/elevated`、`/exec`、`/model`、`/queue`。
  - 指令在模型看到之前从消息中剥离。
  - 在正常聊天消息中（非仅指令），它们被视为"内联提示"，**不会**持久化会话设置。
  - 在仅指令消息中（消息仅包含指令），它们持久化到会话并回复确认。
  - 指令仅对**授权发送者**应用（频道允许列表/配对 + `commands.useAccessGroups`）。
    未授权发送者看到指令被视为纯文本。

还有一些**内联快捷方式**（仅允许列表/授权发送者）：`/help`、`/commands`、`/status`、`/whoami` (`/id`)。
它们立即运行，在模型看到消息之前被剥离，剩余文本继续正常流程。

## 配置

```json5
{
  commands: {
    native: "auto",
    nativeSkills: "auto",
    text: true,
    bash: false,
    bashForegroundMs: 2000,
    config: false,
    debug: false,
    restart: false,
    useAccessGroups: true
  }
}
```

- `commands.text`（默认 `true`）启用聊天消息中的 `/...` 解析。
  - 在没有原生命令的平台上（WhatsApp/WebChat/Signal/iMessage/Google Chat/MS Teams），即使设置为 `false`，文本命令仍然有效。
- `commands.native`（默认 `"auto"`）注册原生命令。
  - 自动：Discord/Telegram 开启；Slack 关闭（直到你添加斜杠命令）；没有原生支持的平台忽略。
  - 设置 `channels.discord.commands.native`、`channels.telegram.commands.native` 或 `channels.slack.commands.native` 按 Provider 覆盖（布尔值或 `"auto"`）。
  - `false` 在启动时清除 Discord/Telegram 上之前注册的命令。Slack 命令在 Slack 应用中管理，不会自动移除。
- `commands.nativeSkills`（默认 `"auto"`）在支持时原生注册 **技能** 命令。
  - 自动：Discord/Telegram 开启；Slack 关闭（Slack 需要为每个技能创建一个斜杠命令）。
  - 设置 `channels.discord.commands.nativeSkills`、`channels.telegram.commands.nativeSkills` 或 `channels.slack.commands.nativeSkills` 按 Provider 覆盖（布尔值或 `"auto"`）。
- `commands.bash`（默认 `false`）启用 `! <cmd>` 运行主机 shell 命令（`/bash <cmd>` 是别名；需要 `tools.elevated` 允许列表）。
- `commands.bashForegroundMs`（默认 `2000`）控制 Bash 切换到后台模式前的等待时间（`0` 立即后台）。
- `commands.config`（默认 `false`）启用 `/config`（读/写 `openclaw.json`）。
- `commands.debug`（默认 `false`）启用 `/debug`（仅运行时覆盖）。
- `commands.restart`（默认 `false`）启用 `/restart`。
- `commands.useAccessGroups`（默认 `true`）强制执行命令的允许列表/策略。

## 命令列表

文本 + 原生（启用时）：
- `/help`
- `/commands`
- `/skill <name> [input]`（按名称运行技能）
- `/status`（显示当前状态；当可用时包括当前模型 Provider 的使用/配额）
- `/allowlist`（列出/添加/删除允许列表条目）
- `/approve <id> allow-once|allow-always|deny`（解决 exec 批准提示）
- `/context [list|detail|json]`（解释"上下文"；`detail` 显示每个文件 + 每个工具 + 每个技能 + 系统提示大小）
- `/whoami`（显示你的发送者 ID；别名：`/id`）
- `/subagents list|stop|log|info|send`（检查、停止、记录或向当前会话的子 Agent 运行发送消息）
- `/config show|get|set|unset`（持久化配置到磁盘，仅所有者；需要 `commands.config: true`）
- `/debug show|set|unset|reset`（运行时覆盖，仅所有者；需要 `commands.debug: true`）
- `/usage off|tokens|full|cost`（每响应使用页脚或本地成本摘要）
- `/tts off|always|inbound|tagged|status|provider|limit|summary|audio`（控制 TTS；参见 [/tts](../tts.html)）
  - Discord：原生命令是 `/voice`（Discord 保留 `/tts`）；文本 `/tts` 仍然有效。
- `/stop`
- `/restart`
- `/dock-telegram`（别名：`/dock_telegram`）（切换回复到 Telegram）
- `/dock-discord`（别名：`/dock_discord`）（切换回复到 Discord）
- `/dock-slack`（别名：`/dock_slack`）（切换回复到 Slack）
- `/activation mention|always`（仅群组）
- `/send on|off|inherit`（仅所有者）
- `/reset` 或 `/new [model]`（可选模型提示；剩余内容透传）
- `/think <off|minimal|low|medium|high|xhigh>`（动态选择按模型/Provider；别名：`/thinking`、`/t`）
- `/verbose on|full|off`（别名：`/v`）
- `/reasoning on|off|stream`（别名：`/reason`；开启时，发送前缀为 `Reasoning:` 的单独消息；`stream` = 仅 Telegram 草稿）
- `/elevated on|off|ask|full`（别名：`/elev`；`full` 跳过 exec 批准）
- `/exec host=<sandbox|gateway|node> security=<deny|allowlist|full> ask=<off|on-miss|always> node=<id>`（发送 `/exec` 显示当前）
- `/model <name>`（别名：`/models`；或 `agents.defaults.models.*.alias` 中的 `/<alias>`）
- `/queue <mode>`（加上选项如 `debounce:2s cap:25 drop:summarize`；发送 `/queue` 查看当前设置）
- `/bash <command>`（仅主机；`! <command>` 的别名；需要 `commands.bash: true` + `tools.elevated` 允许列表）

仅文本：
- `/compact [instructions]`（参见 [/concepts/compaction(../concepts/compaction.html)）
- `! <command>`（仅主机；一次一个；长时间运行作业使用 `!poll` + `!stop`）
- `!poll`（检查输出/状态；接受可选 `sessionId`；`/bash poll` 也有效）
- `!stop`（停止正在运行的 Bash 作业；接受可选 `sessionId`；`/bash stop` 也有效）

说明：
- 命令接受命令和参数之间可选的 `:`（如 `/think: high`、`/send: on`、`/help:`）。
- `/new <model>` 接受模型别名、`provider/model` 或 Provider 名称（模糊匹配）；如果没有匹配，文本被视为消息正文。
- 完整的 Provider 使用明细，使用 `openclaw status --usage`。
- `/allowlist add|remove` 需要 `commands.config=true` 并遵守频道 `configWrites`。
- `/usage` 控制每响应使用页脚；`/usage cost` 从 OpenClaw 会话日志打印本地成本摘要。
- `/restart` 默认禁用；设置 `commands.restart: true` 启用。
- `/verbose` 用于调试和额外可见性；正常使用时保持 **关闭**。
- `/reasoning`（和 `/verbose`）在群组设置中有风险：它们可能暴露你不打算暴露的内部推理或工具输出。建议保持关闭，特别是在群组聊天中。
- **快速路径**：仅命令消息来自允许列表发送者立即处理（绕过队列 + 模型）。
- **群组提及门控**：仅命令消息来自允许列表发送者绕过提及要求。
- **内联快捷方式（仅允许列表发送者）**：某些命令在正常消息中嵌入时也能工作，在模型看到剩余文本之前被剥离。
  - 示例：`hey /status` 触发状态回复，剩余文本继续正常流程。
- 当前：`/help`、`/commands`、`/status`、`/whoami` (`/id`)。
- 未授权的仅命令消息被静默忽略，内联 `/...` 标记被视为纯文本。
- **技能命令**：`user-invocable` 技能作为斜杠命令暴露。名称被清理为 `a-z0-9_`（最多 32 字符）；冲突获得数字后缀（如 `_2`）。
  - `/skill <name> [input]` 按名称运行技能（当原生命令限制阻止每个技能命令时有用）。
  - 默认情况下，技能命令作为正常请求转发给模型。
  - 技能可以可选声明 `command-dispatch: tool` 直接将命令路由到工具（确定性，无模型）。
  - 示例：`/prose`（OpenProse 插件）— 参见 [OpenProse](../prose.html)。
- **原生命令参数**：Discord 对动态选项使用自动完成（当你省略必需参数时使用按钮菜单）。Telegram 和 Slack 在命令支持选项且你省略参数时显示按钮菜单。

## 使用界面（哪里显示什么）

- **Provider 使用/配额**（示例："Claude 剩余 80%"）在 `/status` 中显示当前模型 Provider 的使用情况（当启用使用跟踪时）。
- **每响应令牌/成本**由 `/usage off|tokens|full` 控制（附加到正常回复）。
- `/model status` 是关于 **模型/认证/端点** 的，不是使用。

## 模型选择 (`/model`)

`/model` 作为指令实现。

示例：

```
/model
/model list
/model 3
/model openai/gpt-5.2
/model opus@anthropic:default
/model status
```

说明：
- `/model` 和 `/model list` 显示紧凑的编号选择器（模型族 + 可用 Provider）。
- `/model <#>` 从选择器中选择（尽可能优先当前 Provider）。
- `/model status` 显示详细视图，包括配置的 Provider 端点（`baseUrl`）和 API 模式（`api`）（如果可用）。

## 调试覆盖

`/debug` 允许你设置 **仅运行时** 配置覆盖（内存，非磁盘）。仅所有者。默认禁用；用 `commands.debug: true` 启用。

示例：

```
/debug show
/debug set messages.responsePrefix="[openclaw]"
/debug set channels.whatsapp.allowFrom=["+1555","+4477"]
/debug unset messages.responsePrefix
/debug reset
```

说明：
- 覆盖立即应用到新配置读取，但 **不会** 写入 `openclaw.json`。
- 使用 `/debug reset` 清除所有覆盖并返回磁盘上的配置。

## 配置更新

`/config` 写入你的磁盘配置（`openclaw.json`）。仅所有者。默认禁用；用 `commands.config: true` 启用。

示例：

```
/config show
/config show messages.responsePrefix
/config get messages.responsePrefix
/config set messages.responsePrefix="[openclaw]"
/config unset messages.responsePrefix
```

说明：
- 配置在写入前验证；无效更改被拒绝。
- `/config` 更新在重启后持久化。

## 界面说明

- **文本命令**在正常聊天会话中运行（DM 共享 `main`，群组有自己的会话）。
- **原生命令**使用独立会话：
  - Discord: `agent:<agentId>:discord:slash:<userId>`
  - Slack: `agent:<agentId>:slack:slash:<userId>`（前缀可通过 `channels.slack.slashCommand.sessionPrefix` 配置）
  - Telegram: `telegram:slash:<userId>`（通过 `CommandTargetSessionKey` 目标聊天会话）
- **`/stop`** 目标活动聊天会话以便中止当前运行。
- **Slack：** `channels.slack.slashCommand` 仍然支持单个 `/openclaw` 风格命令。如果你启用 `commands.native`，你必须为每个内置命令创建一个 Slack 斜杠命令（与 `/help` 中的名称相同）。Slack 的命令参数菜单作为短暂 Block Kit 按钮传递。