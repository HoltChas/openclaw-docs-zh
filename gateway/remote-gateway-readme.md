---
summary: "远程 Gateway 设置"
read_when:
  - 你想通过 SSH 隧道连接远程 Gateway
  - 你需要配置自动启动隧道
  - 你在设置远程访问
---

# 远程 Gateway 设置

OpenClaw.app 通过 SSH 隧道连接到远程 gateway。架构涉及客户端机器连接到本地 WebSocket 端口（18789），通过 SSH 隧道转发到运行 Gateway 的远程机器。

## 快速设置步骤

**1. SSH 配置**

在 `~/.ssh/config` 中添加条目，包含远程主机详情，包括 `HostName`、`User`、`LocalForward 18789 127.0.0.1:18789` 和 `IdentityFile` 设置。

**2. SSH 密钥设置**

使用 `ssh-copy-id` 将公钥复制到远程服务器以实现无密码认证。

**3. 环境令牌**

使用 `launchctl setenv OPENCLAW_GATEWAY_TOKEN "<your-token>"` 设置 gateway 令牌。

**4. 启动隧道**

在后台运行 SSH 隧道：`ssh -N remote-gateway &`。

**5. 重启应用**

退出并重新打开 OpenClaw.app 以通过隧道连接。

## 自动启动配置

在 `~/Library/LaunchAgents/bot.molt.ssh-tunnel.plist` 创建 macOS Launch Agent，包含指定带 `-N` 标志和 `remote-gateway` 主机的 SSH 命令的属性列表。关键设置包括 `KeepAlive`（崩溃时自动重启）和 `RunAtLoad`（登录时启动）。

加载它：`launchctl bootstrap gui/$UID ~/Library/LaunchAgents/bot.molt.ssh-tunnel.plist`

## 故障排除命令

- **检查状态**：使用 `ps aux | grep` 或 `lsof -i :18789`
- **重启**：`launchctl kickstart -k gui/$UID/bot.molt.ssh-tunnel`
- **停止**：`launchctl bootout gui/$UID/bot.molt.ssh-tunnel`

## 关键组件

| 设置 | 用途 |
|------|------|
| LocalForward | 将本地端口 18789 映射到远程端口 18789 |
| ssh -N | 仅端口转发，不执行远程命令 |
| KeepAlive | 失败时自动重启隧道 |
| RunAtLoad | 代理加载时启动隧道 |
