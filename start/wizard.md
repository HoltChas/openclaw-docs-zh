---
summary: "CLI 配置向导：引导式设置 Gateway、工作空间、频道和 Skills"
read_when:
  - 运行或配置配置向导
  - 设置新机器
---

# 配置向导 (CLI)

配置向导是在 macOS、Linux 或 Windows（通过 WSL2；强烈推荐）上设置 OpenClaw 的**推荐**方式。
它在一个引导流程中配置本地 Gateway 或远程 Gateway 连接，以及频道、Skills 和工作空间默认值。

主要入口：

```bash
# 启动配置向导
openclaw onboard
```

最快的首次聊天：打开 Control UI（无需设置频道）。运行
`openclaw dashboard` 然后在浏览器中聊天。文档：[Dashboard](../web/dashboard.html)。

后续重新配置：

```bash
# 修改配置
openclaw configure
```

推荐：设置 Brave Search API 密钥，让 Agent 可以使用 `web_search`
（`web_fetch` 无需密钥即可工作）。最简单的方式：`openclaw configure --section web`
它会存储 `tools.web.search.apiKey`。文档：[Web 工具](../tools/web.html)。

## 快速开始 vs 高级设置

向导以**快速开始**（默认）vs **高级**（完全控制）开始。

**快速开始**保持默认：
- 本地 Gateway（回环）
- 工作空间默认（或现有工作空间）
- Gateway 端口 **18789**
- Gateway 认证 **Token**（自动生成，即使是回环地址）
- Tailscale 暴露 **关闭**
- Telegram + WhatsApp 私聊默认**白名单**（会提示你输入手机号）

**高级**暴露每一步（模式、工作空间、Gateway、频道、守护进程、Skills）。

## 向导做什么

**本地模式（默认）**会引导你：
  - 模型/认证（OpenAI Code (Codex) 订阅 OAuth、Anthropic API 密钥（推荐）或 setup-token（粘贴），以及 MiniMax/GLM/Moonshot/AI Gateway 选项）
- 工作空间位置 + 引导文件
- Gateway 设置（端口/绑定/认证/tailscale）
- Provider（Telegram、WhatsApp、Discord、Google Chat、Mattermost（插件）、Signal）
- 守护进程安装（LaunchAgent / systemd 用户单元）
- 健康检查
- Skills（推荐）

**远程模式**仅配置本地客户端连接到其他地方的 Gateway。
它**不会**在远程主机上安装或更改任何东西。

要添加更多隔离的 Agent（单独的工作空间 + 会话 + 认证），使用：

```bash
# 添加新 Agent
openclaw agents add <name>
```

提示：`--json`**不**意味着非交互模式。使用 `--non-interactive`（和 `--workspace`）用于脚本。

## 流程详情（本地）

1) **检测现有配置**
   - 如果 `~/.openclaw/openclaw.json` 存在，选择**保持 / 修改 / 重置**。
   - 重新运行向导**不会**擦除任何东西，除非你明确选择**重置**
     （或传入 `--reset`）。
   - 如果配置无效或包含旧版密钥，向导会停止并要求
     你先运行 `openclaw doctor` 再继续。
   - 重置使用 `trash`（从不用 `rm`）并提供范围：
     - 仅配置
     - 配置 + 凭据 + 会话
     - 完全重置（也删除工作空间）

2) **模型/认证**
   - **Anthropic API 密钥（推荐）**：使用 `ANTHROPIC_API_KEY`（如果存在）或提示输入密钥，然后保存供守护进程使用。
   - **Anthropic OAuth (Claude Code CLI)**：在 macOS 上，向导检查 Keychain 项目 "Claude Code-credentials"（选择"始终允许"，这样 launchd 启动不会阻塞）；在 Linux/Windows 上，如果存在则复用 `~/.claude/.credentials.json`。
   - **Anthropic token（粘贴 setup-token）**：在任何机器上运行 `claude setup-token`，然后粘贴 token（你可以命名它；留空 = 默认）。
   - **OpenAI Code (Codex) subscription (Codex CLI)**：如果存在 `~/.codex/auth.json`，向导可以复用它。
   - **OpenAI Code (Codex) subscription (OAuth)**：浏览器流程；粘贴 `code#state`。
     - 当模型未设置或为 `openai/*` 时，将 `agents.defaults.model` 设置为 `openai-codex/gpt-5.2`。
   - **OpenAI API key**：使用 `OPENAI_API_KEY`（如果存在）或提示输入密钥，然后保存到 `~/.openclaw/.env` 以便 launchd 可以读取。
   - **OpenCode Zen（多模型代理）**：提示输入 `OPENCODE_API_KEY`（或 `OPENCODE_ZEN_API_KEY`，在 https://opencode.ai/auth 获取）。
   - **API key**：为你存储密钥。
   - **Vercel AI Gateway（多模型代理）**：提示输入 `AI_GATEWAY_API_KEY`。
   - 更多详情：[Vercel AI Gateway](../providers/vercel-ai-gateway.html)
   - **MiniMax M2.1**：配置自动写入。
   - 更多详情：[MiniMax](../providers/minimax.html)
   - **Synthetic（Anthropic 兼容）**：提示输入 `SYNTHETIC_API_KEY`。
   - 更多详情：[Synthetic](../providers/synthetic.html)
   - **Moonshot (Kimi K2)**：配置自动写入。
   - **Kimi Code**：配置自动写入。
   - 更多详情：[Moonshot AI (Kimi + Kimi Code)](../providers/moonshot.html)
   - **跳过**：尚未配置认证。
   - 从检测到的选项中选择默认模型（或手动输入 provider/model）。
   - 向导运行模型检查，如果配置的模型未知或缺少认证会警告。
  - OAuth 凭据存储在 `~/.openclaw/credentials/oauth.json`；认证配置存储在 `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`（API 密钥 + OAuth）。
   - 更多详情：[/concepts/oauth](../concepts/oauth.html)

3) **工作空间**
   - 默认 `~/.openclaw/workspace`（可配置）。
   - 植入 Agent 引导仪式所需的文件。
   - 完整的工作空间布局 + 备份指南：[Agent 工作空间](../concepts/agent-workspace.html)

4) **Gateway**
   - 端口、绑定、认证模式、tailscale 暴露。
   - 认证建议：即使是回环地址也保持 **Token**，这样本地 WS 客户端必须认证。
   - 只有当你完全信任每个本地进程时才禁用认证。
   - 非回环绑定仍然需要认证。

5) **频道**
  - WhatsApp：可选 QR 登录。
  - Telegram：Bot Token。
  - Discord：Bot Token。
  - Google Chat：服务账户 JSON + Webhook 受众。
  - Mattermost（插件）：Bot Token + 基础 URL。
   - Signal：可选的 `signal-cli` 安装 + 账户配置。
   - iMessage：本地 `imsg` CLI 路径 + 数据库访问。
  - 私聊安全：默认是配对。第一条私聊发送一个码；通过 `openclaw pairing approve <channel> <code>` 批准或使用白名单。

6) **守护进程安装**
   - macOS：LaunchAgent
     - 需要登录的用户会话；对于无头模式，使用自定义 LaunchDaemon（未提供）。
   - Linux（和通过 WSL2 的 Windows）：systemd 用户单元
     - 向导尝试通过 `loginctl enable-linger <user>` 启用持久化，这样 Gateway 在登出后保持运行。
     - 可能会提示输入 sudo（写入 `/var/lib/systemd/linger`）；它会先尝试不用 sudo。
   - **运行时选择：** Node（推荐；WhatsApp/Telegram 必需）。**不推荐** Bun。

7) **健康检查**
   - 启动 Gateway（如果需要）并运行 `openclaw health`。
   - 提示：`openclaw status --deep` 向状态输出添加 Gateway 健康探测（需要可访问的 Gateway）。

8) **Skills（推荐）**
   - 读取可用的 Skills 并检查要求。
   - 让你选择 Node 管理器：**npm / pnpm**（不推荐 bun）。
   - 安装可选依赖（某些在 macOS 上使用 Homebrew）。

9) **完成**
   - 摘要 + 后续步骤，包括 iOS/Android/macOS 应用以获得额外功能。
  - 如果未检测到 GUI，向导会打印 SSH 端口转发指令来访问 Control UI，而不是打开浏览器。
  - 如果 Control UI 资源缺失，向导会尝试构建它们；回退是 `pnpm ui:build`（自动安装 UI 依赖）。

## 远程模式

远程模式配置本地客户端连接到其他地方的 Gateway。

你会设置：
- 远程 Gateway URL (`ws://...`)
- 如果远程 Gateway 需要认证则设置 Token（推荐）

注意：
- 不执行远程安装或守护进程更改。
- 如果 Gateway 仅限回环，使用 SSH 隧道或 tailnet。
- 发现提示：
  - macOS：Bonjour (`dns-sd`)
  - Linux：Avahi (`avahi-browse`)

## 添加另一个 Agent

使用 `openclaw agents add <name>` 创建一个独立的 Agent，有自己的工作空间、会话和认证配置。不带 `--workspace` 运行会启动向导。

它会设置：
- `agents.list[].name`
- `agents.list[].workspace`
- `agents.list[].agentDir`

注意：
- 默认工作空间遵循 `~/.openclaw/workspace-<agentId>`。
- 添加 `bindings` 来路由入站消息（向导可以帮你做）。
- 非交互式标志：`--model`、`--agent-dir`、`--bind`、`--non-interactive`。

## 非交互式模式

使用 `--non-interactive` 来自动化或脚本化配置：

```bash
# 非交互式配置示例
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice apiKey \
  --anthropic-api-key "$ANTHROPIC_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback \
  --install-daemon \
  --daemon-runtime node \
  --skip-skills
```

添加 `--json` 获取机器可读的摘要。

Gemini 示例：

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice gemini-api-key \
  --gemini-api-key "$GEMINI_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

Z.AI 示例：

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice zai-api-key \
  --zai-api-key "$ZAI_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

Vercel AI Gateway 示例：

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

Moonshot 示例：

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice moonshot-api-key \
  --moonshot-api-key "$MOONSHOT_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

Synthetic 示例：

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice synthetic-api-key \
  --synthetic-api-key "$SYNTHETIC_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

OpenCode Zen 示例：

```bash
openclaw onboard --non-interactive \
  --mode local \
  --auth-choice opencode-zen \
  --opencode-zen-api-key "$OPENCODE_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

添加 Agent（非交互式）示例：

```bash
openclaw agents add work \
  --workspace ~/.openclaw/workspace-work \
  --model openai/gpt-5.2 \
  --bind whatsapp:biz \
  --non-interactive \
  --json
```

## Gateway 向导 RPC

Gateway 通过 RPC 暴露向导流程（`wizard.start`、`wizard.next`、`wizard.cancel`、`wizard.status`）。
客户端（macOS 应用、Control UI）可以渲染步骤而无需重新实现配置逻辑。

## Signal 设置 (signal-cli)

向导可以从 GitHub releases 安装 `signal-cli`：
- 下载适当的 release 资源。
- 存储在 `~/.openclaw/tools/signal-cli/<version>/`。
- 将 `channels.signal.cliPath` 写入你的配置。

注意：
- JVM 构建需要 **Java 21**。
- 尽可能使用原生构建。
- Windows 使用 WSL2；signal-cli 安装在 WSL 内遵循 Linux 流程。

## 向导写入什么

`~/.openclaw/openclaw.json` 中的典型字段：
- `agents.defaults.workspace`
- `agents.defaults.model` / `models.providers`（如果选择了 Minimax）
- `gateway.*`（模式、绑定、认证、tailscale）
- `channels.telegram.botToken`、`channels.discord.token`、`channels.signal.*`、`channels.imessage.*`
- 频道白名单（Slack/Discord/Matrix/Microsoft Teams），当你在提示期间选择加入时（名称尽可能解析为 ID）。
- `skills.install.nodeManager`
- `wizard.lastRunAt`
- `wizard.lastRunVersion`
- `wizard.lastRunCommit`
- `wizard.lastRunCommand`
- `wizard.lastRunMode`

`openclaw agents add` 写入 `agents.list[]` 和可选的 `bindings`。

WhatsApp 凭据存储在 `~/.openclaw/credentials/whatsapp/<accountId>/`。
会话存储在 `~/.openclaw/agents/<agentId>/sessions/`。

某些频道作为插件提供。当你在配置期间选择一个时，向导
会提示在安装前安装它（npm 或本地路径），然后才能配置。

## 相关文档

- macOS 应用配置：[配置](./onboarding.html)
- 配置参考：[Gateway 配置](../gateway/configuration.html)
- Provider：[WhatsApp](../channels/whatsapp.html)、[Telegram](../channels/telegram.html)、[Discord](../channels/discord.html)、[Google Chat](../channels/googlechat.html)、[Signal](../channels/signal.html)、[iMessage](../channels/imessage.html)
- Skills：[Skills](../tools/skills.html)、[Skills 配置](../tools/skills-config.html)
