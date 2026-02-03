---
summary: "聊天频道概述"
read_when:
  - 你想了解支持哪些消息平台
  - 你需要选择要集成的频道
  - 你在比较不同频道的功能
---

# 聊天频道

OpenClaw 通过其 Gateway 系统与各种消息平台集成。"文本在所有地方都支持；媒体和回应因频道而异。"

## 支持的频道

文档列出了两类共 **19 个频道**：

### 内置频道：
- **WhatsApp** — 使用 Baileys 库，需要二维码配对，被描述为"最受欢迎"
- **Telegram** — 使用 grammY Bot API，支持群组
- **Discord** — Bot API + Gateway，用于服务器、频道和私信
- **Slack** — 使用 Bolt SDK 的工作区应用
- **Google Chat** — HTTP webhook 集成
- **Signal** — 使用 signal-cli，注重隐私
- **BlueBubbles** — "推荐用于 iMessage"，功能完整支持（注意：在 macOS 26 Tahoe 上编辑功能损坏）
- **iMessage** — 通过 imsg 的旧版 macOS 专用选项
- **WebChat** — 通过 WebSocket 的 Gateway UI

### 插件频道（需单独安装）：
Mattermost、Microsoft Teams、LINE、Nextcloud Talk、Matrix、Nostr、Tlon、Twitch、Zalo（机器人）和 Zalo Personal

## 关键说明

- 多个频道可以同时运行，自动路由
- **Telegram 设置最快**（只需要一个机器人令牌）
- WhatsApp 需要更多设置，包括二维码配对和存储额外状态
- 群组行为因平台而异
- 安全功能包括私信配对和允许列表

## 相关文档链接
参考群组、安全、grammY 说明、频道故障排除和模型提供者页面获取更多详情。
