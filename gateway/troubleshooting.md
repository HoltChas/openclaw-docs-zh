---
summary: "Gateway 故障排除指南"
read_when:
  - 你遇到 Gateway 启动或连接问题
  - 你需要诊断服务状态
  - 你在调试常见错误
---

# Gateway 故障排除

## 状态和诊断命令

文档提供了诊断命令层次：

| 命令 | 用途 |
|------|------|
| `openclaw status` | 快速本地概览：OS、Gateway、服务、Agent 和提供者状态 |
| `openclaw status --all` | 完整诊断，令牌已脱敏，适合分享 |
| `openclaw status --deep` | 运行健康检查，包括提供者探测 |
| `openclaw gateway probe` | 测试 Gateway 发现和可达性 |
| `openclaw gateway status` | 显示监控器状态、PID、退出码和最后错误 |
| `openclaw logs --follow` | 实时日志流，用于运行时问题 |

## 常见 Gateway 问题

### 缺少 API 密钥
认证是"每 Agent"的，意味着新 Agent 不会从主 Agent 继承凭据。修复方法：重新运行引导、使用 `openclaw models auth setup-token --provider anthropic`，或复制 auth-profiles.json 文件。

### OAuth 令牌刷新失败
对于没有 API 密钥的 Claude 订阅，推荐的修复方法是在 Gateway 主机上切换到 Claude Code setup-token。

### Gateway 启动被阻止
当 `gateway.mode` 未设置时，Gateway 拒绝启动。运行 `openclaw configure` 或直接使用 `openclaw config set gateway.mode local` 设置。

### 服务运行但端口未监听
关键检查：
- 验证 `gateway.mode` 设置为 `local`
- 非回环绑定需要 `gateway.auth.token` 配置
- 使用 `openclaw gateway status` 识别 CLI 和服务之间的配置不匹配

### 地址已被使用（端口 18789）
运行 `openclaw gateway status` 识别监听器，然后停止冲突服务或选择不同端口。

## 服务环境

Gateway 使用最小 PATH 运行：
- **macOS**：`/opt/homebrew/bin`、`/usr/local/bin`、`/usr/bin`、`/bin`
- **Linux**：`/usr/local/bin`、`/usr/bin`、`/bin`

版本管理器（nvm、fnm、volta、asdf）被故意排除。WhatsApp 和 Telegram 频道需要 Node（不支持 Bun）。

## 日志位置

| 类型 | 位置 |
|------|------|
| Gateway 文件日志 | `/tmp/openclaw/openclaw-YYYY-MM-DD.log` |
| macOS 服务日志 | `$OPENCLAW_STATE_DIR/logs/gateway.log` |
| Linux systemd | `journalctl --user -u openclaw-gateway.service` |
| 会话文件 | `$OPENCLAW_STATE_DIR/agents/<agentId>/sessions/` |

## 调试模式

通过在配置中设置 `{ "logging": { "level": "trace" } }` 启用详细日志，然后使用 `--verbose` 标志运行命令。

## 重置所有内容（核选项）

```bash
openclaw gateway stop
trash "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
openclaw channels login
openclaw gateway restart
```

这会删除所有会话并需要重新配对 WhatsApp。

## macOS 特定问题

**Gateway 卡在"Starting..."**：先使用 `openclaw gateway stop` 停止监控器，而不是直接杀死 PID，因为 launchd 会重新生成它。

**端口忙**：使用 `lsof -nP -iTCP:18789 -sTCP:LISTEN` 查找监听器。

## Linux 浏览器问题

Chrome CDP 失败通常由 Snap 打包的 Chromium 引起。直接安装 Google Chrome 并将 `browser.executablePath` 设置为 `/usr/bin/google-chrome-stable`。
