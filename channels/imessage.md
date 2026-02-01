---
summary: "通过 imsg（stdio 上的 JSON-RPC）的 iMessage 支持、设置和 chat_id 路由"
read_when:
  - 设置 iMessage 支持
  - 调试 iMessage 发送/接收
---
# iMessage（imsg）

状态：外部 CLI 集成。Gateway 生成 `imsg rpc`（stdio 上的 JSON-RPC）。

## 快速设置（初学者）
1) 确保 Messages 在此 Mac 上登录。
2) 安装 `imsg`：
   - `brew install steipete/tap/imsg`
3) 使用 `channels.imessage.cliPath` 和 `channels.imessage.dbPath` 配置 OpenClaw。
4) 启动 Gateway 并批准任何 macOS 提示（自动化 + 完全磁盘访问）。

最小配置：
```json5
{
  channels: {
    imessage: {
      enabled: true,
      cliPath: "/usr/local/bin/imsg",
      dbPath: "/Users/<you>/Library/Messages/chat.db"
    }
  }
}
```

## 它是什么
- 由 macOS 上的 `imsg` 支持的 iMessage 频道。
- 确定性路由：回复总是返回到 iMessage。
- 私聊共享 Agent 的主会话；群组是隔离的（`agent:<agentId>:imessage:group:<chat_id>`）。
- 如果多参与者线程以 `is_group=false` 到达，你仍然可以使用 `channels.imessage.groups` 通过 `chat_id` 隔离它（参见下面的"类群组线程"）。

## 配置写入
默认情况下，iMessage 允许写入由 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

禁用：
```json5
{
  channels: { imessage: { configWrites: false } }
}
```

## 要求
- 登录 Messages 的 macOS。
- OpenClaw + `imsg` 的完全磁盘访问（Messages DB 访问）。
- 发送时的自动化权限。
- `channels.imessage.cliPath` 可以指向任何代理 stdin/stdout 的命令（例如，一个包装脚本，SSH 到另一台 Mac 并运行 `imsg rpc`）。

## 设置（快速路径）
1) 确保 Messages 在此 Mac 上登录。
2) 配置 iMessage 并启动 Gateway。

### 专用 Bot macOS 用户（用于隔离身份）
如果你希望 Bot 从**单独的 iMessage 身份**发送（并保持个人 Messages 干净），使用专用 Apple ID + 专用 macOS 用户。

1) 创建专用 Apple ID（例如：`my-cool-bot@icloud.com`）。
   - Apple 可能要求电话号码进行验证 / 2FA。
2) 创建 macOS 用户（例如：`openclawhome`）并登录。
3) 在该 macOS 用户中打开 Messages 并使用 Bot Apple ID 登录 iMessage。
4) 启用远程登录（系统设置 → 通用 → 共享 → 远程登录）。
5) 安装 `imsg`：
   - `brew install steipete/tap/imsg`
6) 设置 SSH，使 `ssh <bot-macos-user>@localhost true` 无需密码即可工作。
7) 将 `channels.imessage.accounts.bot.cliPath` 指向运行 `imsg` 作为 Bot 用户的 SSH 包装器。

首次运行注意：发送/接收可能需要 *Bot macOS 用户* 中的 GUI 批准（自动化 + 完全磁盘访问）。如果 `imsg rpc` 看起来卡住或退出，登录到该用户（屏幕共享有帮助），运行一次 `imsg chats --limit 1` / `imsg send ...`，批准提示，然后重试。

示例包装器（`chmod +x`）。将 `<bot-macos-user>` 替换为你的实际 macOS 用户名：
```bash
#!/usr/bin/env bash
set -euo pipefail

# 首先运行一次交互式 SSH 以接受主机密钥：
#   ssh <bot-macos-user>@localhost true
exec /usr/bin/ssh -o BatchMode=yes -o ConnectTimeout=5 -T <bot-macos-user>@localhost \
  "/usr/local/bin/imsg" "$@"
```

示例配置：
```json5
{
  channels: {
    imessage: {
      enabled: true,
      accounts: {
        bot: {
          name: "Bot",
          enabled: true,
          cliPath: "/path/to/imsg-bot",
          dbPath: "/Users/<bot-macos-user>/Library/Messages/chat.db"
        }
      }
    }
  }
}
