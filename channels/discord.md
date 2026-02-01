---
summary: "Discord Bot 支持状态、功能和配置"
read_when:
  - 处理 Discord 频道功能
---
# Discord（Bot API）

状态：通过官方 Discord Bot Gateway 支持私聊和公会文字频道。

## 快速设置（初学者）
1) 创建 Discord Bot 并复制 Bot Token。
2) 在 Discord 应用设置中，启用**消息内容意图**（以及**服务器成员意图**，如果你计划使用白名单或名称查找）。
3) 为 OpenClaw 设置 Token：
   - 环境变量：`DISCORD_BOT_TOKEN=...`
   - 或配置：`channels.discord.token: "..."`。
   - 如果两者都设置，配置优先（环境变量回退仅用于默认账户）。
4) 邀请 Bot 到你的服务器，具有消息权限（如果你只想要私聊，创建私有服务器）。
5) 启动 Gateway。
6) 私聊访问默认是配对；首次联系时批准配对码。

最小配置：
```json5
{
  channels: {
    discord: {
      enabled: true,
      token: "YOUR_BOT_TOKEN"
    }
  }
}
```

## 目标
- 通过 Discord 私聊或公会频道与 OpenClaw 对话。
- 直接聊天折叠到 Agent 的主会话（默认 `agent:main:main`）；公会频道保持隔离为 `agent:<agentId>:discord:channel:<channelId>`（显示名称使用 `discord:<guildSlug>#<channelSlug>`）。
- 群组私聊默认被忽略；通过 `channels.discord.dm.groupEnabled` 启用，并可选择通过 `channels.discord.dm.groupChannels` 限制。
- 保持路由确定性：回复总是返回到它们到达的频道。

## 工作原理
1. 创建 Discord 应用 → Bot，启用你需要的意图（私聊 + 公会消息 + 消息内容），并获取 Bot Token。
2. 邀请 Bot 到你的服务器，具有在你想使用它的地方读取/发送消息所需的权限。
3. 使用 `channels.discord.token`（或 `DISCORD_BOT_TOKEN` 作为回退）配置 OpenClaw。
4. 运行 Gateway；当 Token 可用时自动启动 Discord 频道（配置优先，环境变量回退）且 `channels.discord.enabled` 不为 `false`。
   - 如果你更喜欢环境变量，设置 `DISCORD_BOT_TOKEN`（配置块是可选的）。
5. 直接聊天：发送时使用 `user:<id>`（或 `<@id>` 提及）；所有轮次都落在共享的 `main` 会话中。纯数字 ID 有歧义并被拒绝。
6. 公会频道：发送时使用 `channel:<channelId>`。默认需要提及，可以为每个公会或每个频道设置。
7. 直接聊天：通过 `channels.discord.dm.policy` 默认安全（默认：`"pairing"`）。未知发送者获得配对码（1 小时后过期）；通过 `openclaw pairing approve discord <code>` 批准。
   - 保持旧的"对任何人开放"行为：设置 `channels.discord.dm.policy="open"` 和 `channels.discord.dm.allowFrom=["*"]`。
   - 硬白名单：设置 `channels.discord.dm.policy="allowlist"` 并在 `channels.discord.dm.allowFrom` 中列出发送者。
   - 忽略所有私聊：设置 `channels.discord.dm.enabled=false` 或 `channels.discord.dm.policy="disabled"`。
8. 群组私聊默认被忽略；通过 `channels.discord.dm.groupEnabled` 启用，并可选择通过 `channels.discord.dm.groupChannels` 限制。
9. 可选公会规则：通过公会 id（首选）或 slug 设置 `channels.discord.guilds`，带有每频道规则。
10. 可选原生命令：`commands.native` 默认为 `"auto"`（Discord/Telegram 开启，Slack 关闭）。使用 `channels.discord.commands.native: true|false|"auto"` 覆盖；`false` 清除先前注册的命令。文本命令由 `commands.text` 控制，必须作为独立的 `/...` 消息发送。使用 `commands.useAccessGroups: false` 绕过命令的访问组检查。
    - 完整命令列表 + 配置：[斜杠命令](/tools/slash-commands)
11. 可选公会上下文历史：设置 `channels.discord.historyLimit`（默认 20，回退到 `messages.groupChat.historyLimit`）以在回复提及时包含最后 N 条公会消息作为上下文。设置 `0` 禁用。
12. 反应：Agent 可以通过 `discord` 工具触发反应（由 `channels.discord.actions.*` 门控）。
    - 反应移除语义：参见 [/tools/reactions](/tools/reactions)。
    - `discord` 工具仅在当前频道是 Discord 时暴露。
13. 原生命令使用隔离的会话键（`agent:<agentId>:discord:slash:<userId>`）而不是共享的 `main` 会话。

注意：名称 → id 解析使用公会成员搜索并需要服务器成员意图；如果 Bot 无法搜索成员，使用 id 或 `<@id>` 提及。
注意：Slugs 是小写，空格替换为 `-`。频道名称不带前导 `#` 进行 slug 化。
注意：公会上下文 `[from:]` 行包含 `author.tag` + `id` 以便轻松进行 ping 就绪回复。

## 配置写入
默认情况下，Discord 允许写入由 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

禁用：
```json5
{
  channels: { discord: { configWrites: false } }
}
```

## 如何创建你自己的 Bot

这是在服务器（公会）频道如 `#help` 中运行 OpenClaw 的"Discord 开发者门户"设置。

### 1) 创建 Discord 应用 + Bot 用户
