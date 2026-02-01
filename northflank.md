---
title: 在 Northflank 上部署
---

使用一键模板在 Northflank 上部署 OpenClaw，并在浏览器中完成设置。
这是最简单的"服务器上无终端"路径：Northflank 为你运行 Gateway，
你通过 `/setup` Web 向导配置一切。

## 如何开始

1. 点击 [部署 OpenClaw](https://northflank.com/stacks/deploy-openclaw) 打开模板。  
2. 如果还没有，在 [Northflank 创建账户](https://app.northflank.com/signup)。  
3. 点击 **立即部署 OpenClaw**。  
4. 设置必需的环境变量：`SETUP_PASSWORD`。
5. 点击 **部署堆栈** 构建并运行 OpenClaw 模板。
6. 等待部署完成，然后点击 **查看资源**。
7. 打开 OpenClaw 服务。
8. 打开公共 OpenClaw URL 并在 `/setup` 完成设置。
9. 在 `/openclaw` 打开控制台 UI。

## 你将获得什么

- 托管的 OpenClaw Gateway + 控制台 UI
- `/setup` 的 Web 设置向导（无需终端命令）
- 通过 Northflank Volume（`/data`）的持久存储，配置/凭证/工作空间在重新部署后保留

## 设置流程

1) 访问 `https://<your-northflank-domain>/setup` 并输入你的 `SETUP_PASSWORD`。
2) 选择模型/认证提供者并粘贴你的密钥。
3) （可选）添加 Telegram/Discord/Slack 令牌。
4) 点击 **运行设置**。
5) 在 `https://<your-northflank-domain>/openclaw` 打开控制台 UI

如果 Telegram DM 设置为配对，设置向导可以批准配对码。

## 获取聊天令牌

### Telegram 机器人令牌

1) 在 Telegram 中给 `@BotFather` 发消息
2) 运行 `/newbot`
3) 复制令牌（看起来像 `123456789:AA...`）
4) 粘贴到 `/setup`

### Discord 机器人令牌

1) 前往 https://discord.com/developers/applications
2) **新建应用** → 选择一个名称
3) **Bot** → **添加 Bot**
4) **在 Bot → Privileged Gateway Intents 下启用 MESSAGE CONTENT INTENT**（必需，否则机器人启动时会崩溃）
5) 复制 **Bot Token** 并粘贴到 `/setup`
6) 邀请机器人到你的服务器（OAuth2 URL Generator；范围：`bot`, `applications.commands`）
