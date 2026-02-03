---
summary: "终端 UI"
read_when:
  - 你想使用终端界面与 Gateway 交互
  - 你需要了解 TUI 快捷键
  - 你在调试 TUI 连接问题
---

# TUI

TUI（终端 UI）是用于与 OpenClaw Gateway 交互的基于终端的界面。

## 快速开始
首先使用 `openclaw gateway` 启动 Gateway，然后使用 `openclaw tui` 启动 TUI。对于远程连接，使用 `--url` 和 `--token` 标志，如果启用了密码认证则添加 `--password`。

## 界面组件
TUI 显示一个标题，显示连接 URL、Agent 和会话信息。主区域包含聊天日志，包括消息、回复和工具卡片。状态行显示连接状态，页脚显示 Agent/会话/模型详情以及 token 计数。

## Agent 和会话模型
Agent 由唯一的 slug 标识，如 `main` 或 `research`。会话属于 Agent，使用格式为 `agent:<agentId>:<sessionKey>` 的键。会话作用域可以是"per-sender"（默认，每个 Agent 多个会话）或"global"（单个共享会话）。

## 消息投递
默认情况下，向提供者的投递是禁用的。通过 `/deliver on`、设置面板或 `--deliver` 启动标志启用。

## 键盘快捷键
- **Enter**：发送消息
- **Esc**：中止运行
- **Ctrl+C**：清除输入（两次退出）
- **Ctrl+D**：退出
- **Ctrl+L/G/P**：模型/Agent/会话选择器
- **Ctrl+O**：切换工具输出展开
- **Ctrl+T**：切换思考可见性

## 斜杠命令
**核心**：`/help`、`/status`、`/agent`、`/session`、`/model`

**会话控制**：`/think`、`/verbose`、`/reasoning`、`/usage`、`/elevated`、`/activation`、`/deliver`

**生命周期**：`/new`、`/reset`、`/abort`、`/settings`、`/exit`

## 本地 Shell 命令
以 `!` 为前缀的行执行本地 shell 命令。TUI 每个会话提示一次权限。命令在新 shell 中运行，没有持久的环境更改。

## 命令行选项
- `--url`：Gateway WebSocket URL
- `--token`：认证令牌
- `--password`：密码认证
- `--session`：会话键（默认：`main`）
- `--deliver`：启用提供者投递
- `--thinking`：覆盖思考级别
- `--timeout-ms`：Agent 超时
- `--history-limit`：要加载的历史条目（默认 200）

## 故障排除
如果发送后没有输出，检查 `/status`，使用 `openclaw logs --follow` 查看 Gateway 日志，如果需要验证投递是否启用。对于连接问题，确认 Gateway 正在运行且凭据正确。空选择器可能表示全局作用域或缺少 Agent 配置。
