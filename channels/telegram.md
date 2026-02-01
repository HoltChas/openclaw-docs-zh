---
summary: "Telegram Bot 支持状态、功能和配置"
read_when:
  - 处理 Telegram 功能或 Webhooks
---
# Telegram（Bot API）

状态：通过 grammY 支持 Bot 私聊 + 群组的生产就绪。默认长轮询；Webhook 可选。

## 快速设置（初学者）
1) 使用 **@BotFather** 创建 Bot 并复制 token。
2) 设置 token：
   - 环境变量：`TELEGRAM_BOT_TOKEN=...`
   - 或配置：`channels.telegram.botToken: "..."`。
   - 如果两者都设置，配置优先（环境变量回退仅用于默认账户）。
3) 启动 Gateway。
4) 私聊访问默认是配对；首次联系时批准配对码。

最小配置：
```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing"
    }
  }
}
```

## 它是什么
- Gateway 拥有的 Telegram Bot API 频道。
- 确定性路由：回复返回给 Telegram；模型从不选择频道。
- 私聊共享 Agent 的主会话；群组保持隔离（`agent:<agentId>:telegram:group:<chatId>`）。

## 设置（快速路径）
### 1) 创建 Bot Token（BotFather）
1) 打开 Telegram 并与 **@BotFather** 聊天。
2) 运行 `/newbot`，然后按照提示操作（名称 + 以 `bot` 结尾的用户名）。
3) 复制 token 并安全存储。

可选的 BotFather 设置：
- `/setjoingroups` — 允许/拒绝将 Bot 添加到群组。
- `/setprivacy` — 控制 Bot 是否看到所有群组消息。

### 2) 配置 Token（环境变量或配置）
示例：

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } }
    }
  }
}
```

环境变量选项：`TELEGRAM_BOT_TOKEN=...`（适用于默认账户）。
如果环境变量和配置都设置，配置优先。

多账户支持：使用 `channels.telegram.accounts` 和每账户 token 及可选的 `name`。参见 [`gateway/configuration`](/gateway/configuration#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts) 了解共享模式。

3) 启动 Gateway。Telegram 在 token 解析时启动（配置优先，环境变量回退）。
4) 私聊访问默认为配对。Bot 首次被联系时批准代码。
5) 对于群组：添加 Bot，决定隐私/管理员行为（如下），然后设置 `channels.telegram.groups` 来控制提及门控 + 白名单。

## Token + 隐私 + 权限（Telegram 端）

### Token 创建（BotFather）
- `/newbot` 创建 Bot 并返回 token（保密）。
- 如果 token 泄露，通过 @BotFather 撤销/重新生成并更新配置。

### 群组消息可见性（隐私模式）
Telegram Bot 默认为**隐私模式**，这限制它们接收哪些群组消息。
如果你的 Bot 必须看到*所有*群组消息，你有两个选项：
- 使用 `/setprivacy` 禁用隐私模式 **或**
- 将 Bot 添加为群组**管理员**（管理员 Bot 接收所有消息）。

**注意：** 切换隐私模式时，Telegram 需要移除 + 重新添加 Bot
到每个群组以使更改生效。

### 群组权限（管理员权限）
管理员状态在群组内设置（Telegram UI）。管理员 Bot 总是接收所有
群组消息，因此如果你需要完全可见性，请使用管理员。

## 工作原理（行为）
- 入站消息被标准化为共享频道信封，带有回复上下文和媒体占位符。
- 群组回复默认需要提及（原生 @提及或 `agents.list[].groupChat.mentionPatterns` / `messages.groupChat.mentionPatterns`）。
- 多 Agent 覆盖：在 `agents.list[].groupChat.mentionPatterns` 上设置每 Agent 模式。
- 回复总是路由回相同的 Telegram 聊天。
- 长轮询使用 grammY runner 和每聊天排序；整体并发由 `agents.defaults.maxConcurrent` 限制。
- Telegram Bot API 不支持已读回执；没有 `sendReadReceipts` 选项。

## 格式化（Telegram HTML）
