---
summary: "设置指南：保持你的 OpenClaw 设置个性化，同时保持最新"
read_when:
  - 设置新机器
  - 你想要"最新 + 最好"而不破坏个人设置
---

# 设置

最后更新：2026-01-01

## 太长不看
- **个性化放在仓库外：** `~/.openclaw/workspace`（工作空间）+ `~/.openclaw/openclaw.json`（配置）。
- **稳定工作流：** 安装 macOS 应用；让它运行捆绑的 Gateway。
- **前沿工作流：** 通过 `pnpm gateway:watch` 自己运行 Gateway，然后让 macOS 应用以本地模式连接。

## 前置条件（从源码）
- Node `>=22`
- `pnpm`
- Docker（可选；仅用于容器化设置/e2e —— 参见 [Docker](../install/docker.html)）

## 个性化策略（这样更新不会伤害你）

如果你想要"100% 个性化"*并且*轻松更新，将你的自定义放在：

- **配置：** `~/.openclaw/openclaw.json`（JSON/JSON5 风格）
- **工作空间：** `~/.openclaw/workspace`（Skills、Prompts、记忆；做成私有 git 仓库）

引导一次：

```bash
# 运行设置
openclaw setup
```

从此仓库内部，使用本地 CLI 入口：

```bash
openclaw setup
```

如果你还没有全局安装，通过 `pnpm openclaw setup` 运行。

## 稳定工作流（macOS 应用优先）

1) 安装 + 启动 **OpenClaw.app**（菜单栏）。
2) 完成配置/权限检查清单（TCC 提示）。
3) 确保 Gateway 是**本地**且正在运行（应用管理它）。
4) 连接界面（示例：WhatsApp）：

```bash
# 登录频道
openclaw channels login
```

5) 健全检查：

```bash
# 检查健康状态
openclaw health
```

如果你的构建中没有配置：
- 运行 `openclaw setup`，然后 `openclaw channels login`，然后手动启动 Gateway（`openclaw gateway`）。

## 前沿工作流（终端中的 Gateway）

目标：在 TypeScript Gateway 上工作，获得热重载，让 macOS 应用 UI 保持连接。

### 0)（可选）也从源码运行 macOS 应用

如果你也想让 macOS 应用保持前沿：

```bash
# 重启 macOS 应用
./scripts/restart-mac.sh
```

### 1) 启动开发 Gateway

```bash
# 安装依赖
pnpm install
# 启动 Gateway 监视模式
pnpm gateway:watch
```

`gateway:watch` 以监视模式运行 Gateway，在 TypeScript 更改时重新加载。

### 2) 让 macOS 应用指向你运行的 Gateway

在 **OpenClaw.app** 中：

- 连接模式：**本地**
应用将连接到配置的端口上运行的 Gateway。

### 3) 验证

- 应用内 Gateway 状态应显示**"Using existing gateway …"**
- 或通过 CLI：

```bash
openclaw health
```

### 常见陷阱
- **端口错误：** Gateway WS 默认 `ws://127.0.0.1:18789`；保持应用 + CLI 在同一端口。
- **状态存储位置：**
  - 凭据：`~/.openclaw/credentials/`
  - 会话：`~/.openclaw/agents/<agentId>/sessions/`
  - 日志：`/tmp/openclaw/`

## 凭据存储地图

调试认证或决定备份什么时使用：

- **WhatsApp**：`~/.openclaw/credentials/whatsapp/<accountId>/creds.json`
- **Telegram bot token**：配置/env 或 `channels.telegram.tokenFile`
- **Discord bot token**：配置/env（尚不支持 token 文件）
- **Slack tokens**：配置/env (`channels.slack.*`)
- **配对白名单**：`~/.openclaw/credentials/<channel>-allowFrom.json`
- **模型认证配置**：`~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
- **旧版 OAuth 导入**：`~/.openclaw/credentials/oauth.json`
更多详情：[安全](../gateway/security#credential-storage-map.html)。

## 更新（不破坏你的设置）

- 保持 `~/.openclaw/workspace` 和 `~/.openclaw/` 作为"你的东西"；不要把个人 prompts/config 放进 `openclaw` 仓库。
- 更新源码：`git pull` + `pnpm install`（当 lockfile 改变时）+ 继续使用 `pnpm gateway:watch`。

## Linux（systemd 用户服务）

Linux 安装使用 systemd **用户**服务。默认情况下，systemd 在登出/空闲时停止用户
服务，这会杀死 Gateway。配置尝试为你启用持久化（可能会提示输入 sudo）。如果还是关闭，运行：

```bash
# 为用户启用持久化，这样服务在登出后继续运行
sudo loginctl enable-linger $USER
```

对于始终在线或多用户服务器，考虑使用**系统**服务而不是
用户服务（不需要持久化）。参见 [Gateway 手册](../gateway/index.html) 了解 systemd 说明。

## 相关文档

- [Gateway 手册](../gateway/index.html)（标志、监督、端口）
- [Gateway 配置](../gateway/configuration.html)（配置模式 + 示例）
- [Discord](../channels/discord.html) 和 [Telegram](../channels/telegram.html)（回复标签 + replyToMode 设置）
- [OpenClaw 助手设置](../start/openclaw.html)
- [macOS 应用](../platforms/macos.html)（Gateway 生命周期）
