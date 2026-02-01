---
summary: "运行具有 shell 访问权限的 AI Gateway 的安全注意事项和威胁模型"
read_when:
  - 添加扩大访问或自动化的功能
---
# 安全 🔒

## 快速检查：`openclaw security audit`

另见：[形式验证（安全模型）](../security/formal-verification.html)

定期运行（特别是在更改配置或暴露网络接口后）：

```bash
# 基础安全审计
openclaw security audit
# 深度审计
openclaw security audit --deep
# 自动修复安全问题
openclaw security audit --fix
```

它会标记常见的陷阱（Gateway 认证暴露、浏览器控制暴露、提升权限白名单、文件系统权限）。

`--fix` 应用安全护栏：
- 将 `groupPolicy="open"` 收紧为 `groupPolicy="allowlist"`（以及每账户变体）用于常见频道。
- 将 `logging.redactSensitive="off"` 改回 `"tools"`。
- 收紧本地权限（`~/.openclaw` → `700`，配置文件 → `600`，以及常见状态文件如 `credentials/*.json`、`agents/*/agent/auth-profiles.json` 和 `agents/*/sessions/sessions.json`）。

在你的机器上运行具有 shell 访问权限的 AI Agent 是……*刺激的*。以下是如何避免被攻击。

OpenClaw 既是产品也是实验：你将前沿模型行为接入真实消息界面和真实工具。**没有"完美安全"的设置。** 目标是慎重考虑：
- 谁可以与你的 Bot 对话
- Bot 被允许在哪里行动
- Bot 可以触碰什么

从仍然有效的最小访问开始，然后在获得信心后逐步放宽。

### 审计检查什么（高层次）

- **入站访问**（私聊策略、群组策略、白名单）：陌生人可以触发 Bot 吗？
- **工具爆炸半径**（提升权限工具 + 开放房间）：提示注入会变成 shell/文件/网络操作吗？
- **网络暴露**（Gateway 绑定/认证、Tailscale Serve/Funnel）。
- **浏览器控制暴露**（远程节点、中继端口、远程 CDP 端点）。
- **本地磁盘卫生**（权限、符号链接、配置包含、"同步文件夹"路径）。
- **插件**（扩展存在而没有显式白名单）。
- **模型卫生**（当配置的模型看起来是旧版时警告；不是硬阻塞）。

如果你运行 `--deep`，OpenClaw 还会尝试尽力实时的 Gateway 探测。

## 凭据存储地图

审计访问或决定备份什么时使用：

- **WhatsApp**：`~/.openclaw/credentials/whatsapp/<accountId>/creds.json`
- **Telegram bot token**：配置/env 或 `channels.telegram.tokenFile`
- **Discord bot token**：配置/env（尚不支持 token 文件）
- **Slack tokens**：配置/env (`channels.slack.*`)
- **配对白名单**：`~/.openclaw/credentials/<channel>-allowFrom.json`
- **模型认证配置**：`~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
- **旧版 OAuth 导入**：`~/.openclaw/credentials/oauth.json`

## 安全审计检查清单

当审计打印发现时，按此优先顺序处理：

1. **任何"开放" + 启用的工具**：首先锁定私聊/群组（配对/白名单），然后收紧工具策略/沙盒。
2. **公共网络暴露**（LAN 绑定、Funnel、缺失认证）：立即修复。
3. **浏览器控制远程暴露**：像操作员访问一样对待（仅限 tailnet、慎重配对节点、避免公共暴露）。
4. **权限**：确保状态/配置/凭据/认证不是组/世界可读的。
5. **插件/扩展**：只加载你明确信任的。
6. **模型选择**：对于任何带工具的 Bot，优先选择现代、指令加固的模型。

## Control UI over HTTP

Control UI 需要**安全上下文**（HTTPS 或 localhost）来生成设备
身份。如果你启用 `gateway.controlUi.allowInsecureAuth`，UI 回退到
**仅 token 认证** 并在设备身份被省略时跳过设备配对。这是安全
降级——优先选择 HTTPS（Tailscale Serve）或在 `127.0.0.1` 上打开 UI。

仅用于紧急情况的 `gateway.controlUi.dangerouslyDisableDeviceAuth`
完全禁用设备身份检查。这是严重的安全降级；
保持关闭，除非你正在积极调试并能快速恢复。

`openclaw security audit` 在启用此设置时发出警告。

## 反向代理配置

如果你在反向代理（nginx、Caddy、Traefik 等）后运行 Gateway，你应该配置 `gateway.trustedProxies` 以进行正确的客户端 IP 检测。

当 Gateway 检测到来自**不在** `trustedProxies` 中的地址的代理头（`X-Forwarded-For` 或 `X-Real-IP`）时，它**不会**将连接视为本地客户端。如果 Gateway 认证被禁用，这些连接会被拒绝。这防止了代理连接否则会显示为来自 localhost 并获得自动信任的认证绕过。

```yaml
gateway:
  trustedProxies:
    - "127.0.0.1"  # 如果你的代理在 localhost 上运行
  auth:
    mode: password
    password: ${OPENCLAW_GATEWAY_PASSWORD}
```

配置 `trustedProxies` 时，Gateway 将使用 `X-Forwarded-For` 头来确定本地客户端检测的真实客户端 IP。确保你的代理覆盖（而不是追加到）传入的 `X-Forwarded-For` 头以防止欺骗。

## 本地会话日志存储在磁盘上

OpenClaw 将会话记录存储在磁盘上 `~/.openclaw/agents/<agentId>/sessions/*.jsonl`。
这是会话连续性和（可选）会话记忆索引所必需的，但也意味着
**任何具有文件系统访问权限的进程/用户都可以读取这些日志**。将磁盘访问视为信任
边界并锁定 `~/.openclaw` 的权限（见下面的审计部分）。如果你需要
Agent 之间的更强隔离，在单独的 OS 用户或单独的主机上运行它们。

## 节点执行（system.run）

如果 macOS 节点已配对，Gateway 可以在该节点上调用 `system.run`。这是 Mac 上的**远程代码执行**：

- 需要节点配对（批准 + token）。
- 在 Mac 上通过**设置 → Exec 批准**控制（安全 + 询问 + 白名单）。
- 如果你不想远程执行，将安全设置为**拒绝**并移除该 Mac 的节点配对。

## 动态 Skills（监视器 / 远程节点）

OpenClaw 可以在会话中途刷新 Skills 列表：
- **Skills 监视器**：对 `SKILL.md` 的更改可以在下次 Agent 轮次更新 Skills 快照。
- **远程节点**：连接 macOS 节点可以使仅限 macOS 的 Skills 符合条件（基于二进制探测）。

将 Skills 文件夹视为**受信任代码**并限制谁可以修改它们。

## 威胁模型

你的 AI 助手可以：
- 执行任意 shell 命令
- 读/写文件
- 访问网络服务
- 向任何人发送消息（如果你给它 WhatsApp 访问权限）

给你发消息的人可以：
- 试图欺骗你的 AI 做坏事
- 社会工程访问你的数据
- 探测基础设施细节

## 核心概念：访问控制优先于智能

这里的大多数失败不是花哨的利用——它们是"有人给 Bot 发消息，Bot 就照做了"。

OpenClaw 的立场：
- **身份优先：** 决定谁可以与 Bot 对话（私聊配对 / 白名单 / 显式"开放"）。
- **范围其次：** 决定 Bot 被允许在哪里行动（群组白名单 + 提及门控、工具、沙盒、设备权限）。
- **模型最后：** 假设模型可以被操纵；设计使操纵的爆炸半径有限。

## 命令授权模型

斜杠命令和指令只对**授权发送者**有效。授权来自
频道白名单/配对加上 `commands.useAccessGroups`（参见 [配置(../gateway/configuration.html)

