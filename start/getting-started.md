---
summary: "入门指南：从零开始到第一条消息（向导、认证、频道、配对）"
read_when:
  - 从零开始首次设置
  - 想要最快的路径：安装 → 配置 → 第一条消息
---

# 入门指南

目标：让你从**零**快速上手 → 到**第一条可用的聊天消息**（使用合理的默认配置）。

最快的聊天方式：打开 Control UI（无需设置频道）。运行 `openclaw dashboard`，
然后在浏览器中聊天，或在 Gateway 主机上打开 `http://127.0.0.1:18789/`。
文档：[Dashboard](../web/dashboard.html) 和 [Control UI](../web/control-ui.html)。

推荐路径：使用 **CLI 配置向导** (`openclaw onboard`)。它会帮你设置：
- 模型/认证（推荐 OAuth）
- Gateway 设置
- 频道（WhatsApp/Telegram/Discord/Mattermost (插件)/...）
- 配对默认设置（安全的私聊）
- 工作空间引导 + Skills
- 可选的后台服务

如果你想看更深入的参考页面，跳转到：[向导](./wizard.html)、[设置](./setup.html)、[配对](./pairing.html)、[安全](../gateway/security.html)。

沙盒说明：`agents.defaults.sandbox.mode: "non-main"` 使用 `session.mainKey`（默认 `"main"`），
所以群组/频道会话会被沙盒隔离。如果你希望 main Agent 始终在主机上运行，请设置明确的每 Agent 覆盖：

```json
{
  "routing": {
    "agents": {
      "main": {
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      }
    }
  }
}
```

## 0) 前置条件

- Node `>=22`
- `pnpm`（可选；如果从源码构建则推荐）
- **推荐：** Brave Search API 密钥用于网页搜索。最简单的方式：
  `openclaw configure --section web`（存储 `tools.web.search.apiKey`）。
  参见 [Web 工具](../tools/web.html)。

macOS：如果你计划构建应用，安装 Xcode / CLT。仅使用 CLI + Gateway 的话，Node 就够了。
Windows：使用 **WSL2**（推荐 Ubuntu）。强烈建议使用 WSL2；原生 Windows 未经充分测试，问题较多，且工具兼容性较差。先安装 WSL2，然后在 WSL 中运行 Linux 步骤。参见 [Windows (WSL2)](../platforms/windows.html)。

## 1) 安装 CLI（推荐）

```bash
# 使用官方安装脚本
curl -fsSL https://openclaw.bot/install.sh | bash
```

安装选项（安装方式、非交互式、从 GitHub）：[安装](../install/updating.html)。

Windows (PowerShell)：

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

替代方案（全局安装）：

```bash
# 使用 npm
npm install -g openclaw@latest

# 或使用 pnpm（更快）
pnpm add -g openclaw@latest
```

## 2) 运行配置向导（并安装服务）

```bash
# 运行向导并安装后台服务
openclaw onboard --install-daemon
```

你会选择：
- **本地 vs 远程** Gateway
- **认证**：OpenAI Code (Codex) 订阅（OAuth）或 API 密钥。对于 Anthropic，我们推荐 API 密钥；也支持 `claude setup-token`。
- **Provider**：WhatsApp QR 登录、Telegram/Discord Bot Token、Mattermost 插件 Token 等。
- **Daemon**：后台安装（launchd/systemd；WSL2 使用 systemd）
  - **运行时**：Node（推荐；WhatsApp/Telegram 必需）。**不推荐** Bun。
- **Gateway Token**：向导默认会生成一个（即使是回环地址）并存储在 `gateway.auth.token`。

向导文档：[向导](./wizard.html)

### 认证：存储位置（重要）

- **推荐的 Anthropic 路径：** 设置 API 密钥（向导可以为服务使用存储它）。如果你想复用 Claude Code 凭据，也支持 `claude setup-token`。

- OAuth 凭据（传统导入）：`~/.openclaw/credentials/oauth.json`
- 认证配置（OAuth + API 密钥）：`~/.openclaw/agents/<agentId>/agent/auth-profiles.json`

无头/服务器提示：先在普通机器上做 OAuth，然后将 `oauth.json` 复制到 Gateway 主机。

## 3) 启动 Gateway

如果在配置期间安装了服务，Gateway 应该已经在运行了：

```bash
# 检查 Gateway 状态
openclaw gateway status
```

手动运行（前台）：

```bash
# 前台运行 Gateway，便于查看日志
openclaw gateway --port 18789 --verbose
```

Dashboard（本地回环）：`http://127.0.0.1:18789/`
如果配置了 Token，请将其粘贴到 Control UI 设置中（存储为 `connect.params.auth.token`）。

⚠️ **Bun 警告（WhatsApp + Telegram）：** Bun 与这些频道有已知问题。
如果使用 WhatsApp 或 Telegram，请使用 **Node** 运行 Gateway。

## 3.5) 快速验证（2 分钟）

```bash
# 检查 OpenClaw 整体状态
openclaw status
# 检查 Gateway 健康状态
openclaw health
# 运行深度安全审计
openclaw security audit --deep
```

## 4) 配对并连接你的第一个聊天界面

### WhatsApp（QR 登录）

```bash
# 登录 WhatsApp 频道
openclaw channels login
```

通过 WhatsApp → 设置 → 已关联设备 扫描二维码。

WhatsApp 文档：[WhatsApp](../channels/whatsapp.html)

### Telegram / Discord / 其他

向导可以帮你写入 Token/配置。如果你喜欢手动配置，从以下开始：
- Telegram：[Telegram](../channels/telegram.html)
- Discord：[Discord](../channels/discord.html)
- Mattermost（插件）：[Mattermost](../channels/mattermost.html)

**Telegram 私聊提示：** 你的第一条私聊会返回一个配对码。批准它（见下一步）否则 Bot 不会回复。

## 5) 私聊安全（配对批准）

默认策略：未知私聊会收到一个短码，在批准前消息不会被处理。
如果你的第一条私聊没有回复，请批准配对：

```bash
# 列出 WhatsApp 的待处理配对
openclaw pairing list whatsapp
# 批准特定配对码
openclaw pairing approve whatsapp <code>
```

配对文档：[配对](./pairing.html)

## 从源码运行（开发）

如果你要 hack OpenClaw 本身，从源码运行：

```bash
# 克隆仓库
git clone https://github.com/openclaw/openclaw.git
cd openclaw
# 安装依赖
pnpm install
# 构建 UI（首次运行会自动安装 UI 依赖）
pnpm ui:build
# 构建项目
pnpm build
# 运行配置向导并安装服务
openclaw onboard --install-daemon
```

如果你还没有全局安装，从仓库通过 `pnpm openclaw ...` 运行配置步骤。
`pnpm build` 也会打包 A2UI 资源；如果你只需要运行这一步，使用 `pnpm canvas:a2ui:bundle`。

Gateway（从此仓库）：

```bash
# 使用 node 直接运行 Gateway
node openclaw.mjs gateway --port 18789 --verbose
```

## 7) 端到端验证

在新终端中，发送测试消息：

```bash
# 发送测试消息到指定目标
openclaw message send --target +15555550123 --message "Hello from OpenClaw"
```

如果 `openclaw health` 显示 "no auth configured"，返回向导设置 OAuth/密钥认证 —— 没有认证 Agent 无法回复。

提示：`openclaw status --all` 是最佳的、可粘贴的、只读调试报告。
健康探测：`openclaw health`（或 `openclaw status --deep`）会向运行的 Gateway 请求健康快照。

## 后续步骤（可选，但很推荐）

- macOS 菜单栏应用 + 语音唤醒：[macOS 应用](../platforms/macos.html)
- iOS/Android 节点（Canvas/相机/语音）：[节点](../nodes/index.html)
- 远程访问（SSH 隧道 / Tailscale Serve）：[远程访问](../gateway/remote.html) 和 [Tailscale](../gateway/tailscale.html)
- 始终在线 / VPN 设置：[远程访问](../gateway/remote.html)、[exe.dev](../platforms/exe-dev.html)、[Hetzner](../platforms/hetzner.html)、[macOS 远程](../platforms/mac/remote.html)
