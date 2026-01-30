# OpenClaw 中文文档

> "去角质！去角质！" —— 一只太空龙虾，大概

适用于 AI 代理的跨平台消息网关（Pi）。支持 WhatsApp、Telegram、Discord、iMessage，插件还可扩展 Mattermost 等平台。

发送消息，即可获得代理回复 —— 随时随地。

[GitHub](https://github.com/openclaw/openclaw) · [Releases](https://github.com/openclaw/openclaw/releases) · [英文文档](https://docs.openclaw.ai/)

---

## 简介

OpenClaw 打通了以下平台与编程代理（如 [Pi](https://github.com/badlogic/pi-mono)）之间的连接：

- **WhatsApp** —— 通过 WhatsApp Web / Baileys
- **Telegram** —— Bot API / grammY
- **Discord** —— Bot API / channels.discord.js  
- **iMessage** —— imsg CLI（macOS）

插件还支持 Mattermost（Bot API + WebSocket）等更多平台。

OpenClaw 同时也是 OpenClaw 助手的核心引擎。

---

## 从这里开始

- **全新安装**：[快速入门指南](/start/getting-started)
- **引导式设置**（推荐）：[向导](/start/wizard)（`openclaw onboard`）
- **打开控制台**（本地网关）：[http://127.0.0.1:18789/](http://127.0.0.1:18789/)

> 如果网关在同一台计算机上运行，上述链接会直接打开浏览器控制界面。如果无法访问，请先启动网关：`openclaw gateway`

---

## 控制台（浏览器控制界面）

控制台是用于聊天、配置、节点管理、会话等的浏览器控制界面。

- **本地默认地址**：[http://127.0.0.1:18789/](http://127.0.0.1:18789/)
- **远程访问**：[Web 界面](/web) 和 [Tailscale](/gateway/tailscale)

---

## 工作原理

```
WhatsApp / Telegram / Discord / iMessage (+ 插件)
                    │
                    ▼
        ┌───────────────────────────┐
        │          网关              │  ws://127.0.0.1:18789（仅本地回环）
        │        (单一来源)          │
        │                           │  http://<gateway-host>:18793
        │                           │  /__openclaw__/canvas/ (Canvas 宿主)
        └───────────┬───────────────┘
                    │
        ├─ Pi 代理（RPC 模式）
        ├─ CLI（openclaw …）
        ├─ 聊天界面（SwiftUI）
        ├─ macOS 应用（OpenClaw.app）
        ├─ iOS 节点（通过网关 WS + 配对）
        └─ Android 节点（通过网关 WS + 配对）
```

大多数操作都通过**网关**（`openclaw gateway`）流转，这是一个长期运行的单一进程，负责管理所有渠道连接和 WebSocket 控制平面。

---

## 网络模型

- **每台主机一个网关**（推荐）：这是唯一被允许拥有 WhatsApp Web 会话的进程。如需隔离机器人或严格分离环境，可运行多个网关并使用独立的配置文件和端口；详见[多网关配置](/gateway/multiple-gateways)。

- **本地优先**：网关 WebSocket 默认绑定 `ws://127.0.0.1:18789`。

向导现在会默认生成网关令牌（即使仅本地访问）。

- **Tailnet 访问**：运行 `openclaw gateway --bind tailnet --token ...`（非本地回环绑定需要令牌）。

- **节点**：通过 WebSocket 连接到网关（按需通过局域网/Tailnet/SSH）；传统的 TCP 桥接已被弃用/移除。

- **Canvas 宿主**：HTTP 文件服务器，监听 `canvasHost.port`（默认 18793），为节点 WebView 提供 `/__openclaw__/canvas/` 服务；详见[网关配置](/gateway/configuration)（canvasHost）。

- **远程使用**：SSH 隧道或 Tailnet/VPN；详见[远程访问](/gateway/remote) 和 [发现机制](/gateway/discovery)。

---

## 功能特性

| 图标 | 功能 | 说明 |
|:----:|------|------|
| 📱 | WhatsApp 集成 | 使用 Baileys 实现 WhatsApp Web 协议 |
| ✈️ | Telegram 机器人 | 支持私聊和群组，基于 grammY |
| 🎮 | Discord 机器人 | 支持私聊和公会频道，基于 channels.discord.js |
| 🧩 | Mattermost 机器人（插件） | Bot Token + WebSocket 事件 |
| 💬 | iMessage | 本地 imsg CLI 集成（macOS） |
| 🤖 | 代理桥接 | Pi（RPC 模式），支持工具流式传输 |
| ⏱️ | 流式传输 + 分块 | 块级流式 + Telegram 草稿流式；详见[流式传输](/concepts/streaming) |
| 🧠 | 多代理路由 | 将不同提供商账号/对话路由到隔离的代理（工作区 + 每个代理的会话） |
| 🔐 | 订阅认证 | 支持 Anthropic（Claude Pro/Max）和 OpenAI（ChatGPT/Codex）OAuth 登录 |
| 💬 | 会话管理 | 私聊默认合并到共享主会话；群组相互隔离 |
| 👥 | 群组聊天支持 | 默认基于提及触发；所有者可切换 `/activation always\|mention` |
| 📎 | 媒体支持 | 发送和接收图片、音频、文档 |
| 🎤 | 语音消息 | 可选的语音转文字钩子 |
| 🖥️ | WebChat + macOS 应用 | 本地界面 + 菜单栏助手，支持运维和语音唤醒 |
| 📱 | iOS 节点 | 作为节点配对，暴露 Canvas 界面 |
| 📱 | Android 节点 | 作为节点配对，暴露 Canvas + 聊天 + 相机 |

> **注意**：传统的 Claude/Codex/Gemini/Opencode 路径已被移除；Pi 是唯一的编程代理路径。

---

## 快速开始

**运行时要求**：Node.js ≥ 22

### 推荐安装方式（npm/pnpm 全局安装）

```bash
npm install -g openclaw@latest
# 或：pnpm add -g openclaw@latest

# 引导配置 + 安装服务（launchd/systemd 用户服务）
openclaw onboard --install-daemon

# 配对 WhatsApp Web（会显示二维码）
openclaw channels login

# 引导完成后网关通过服务运行；也可手动运行：
openclaw gateway --port 18789
```

> 后期如需在 npm 和 git 安装方式之间切换很简单：安装另一种方式后运行 `openclaw doctor` 更新网关服务入口点。

### 从源码安装（开发环境）

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build  # 首次运行会自动安装 UI 依赖
pnpm build
openclaw onboard --install-daemon
```

> 如果尚未全局安装，可通过 `pnpm openclaw ...` 从仓库运行引导步骤。

### 多实例快速开始（可选）

```bash
OPENCLAW_CONFIG_PATH=~/.openclaw/a.json \
OPENCLAW_STATE_DIR=~/.openclaw-a \
openclaw gateway --port 19001
```

### 发送测试消息（需要运行中的网关）

```bash
openclaw message send --target +15555550123 --message "Hello from OpenClaw"
```

---

## 配置（可选）

配置文件位于 `~/.openclaw/openclaw.json`。

- 如果什么都不做，OpenClaw 会使用内置的 Pi 二进制文件，以 RPC 模式运行，并为每个发送者创建独立会话。

- 如需限制访问，可配置 `channels.whatsapp.allowFrom` 和（针对群组）提及规则。

**配置示例**：

```json
{
  "channels": {
    "whatsapp": {
      "allowFrom": ["+15555550123"],
      "groups": {
        "*": { "requireMention": true }
      }
    }
  },
  "messages": {
    "groupChat": {
      "mentionPatterns": ["@openclaw"]
    }
  }
}
```

---

## 文档导航

### 入门指南

- [文档中心（所有页面链接）](/start/hubs)
- [帮助文档](/help) ← 常见问题 + 故障排查
- [配置说明](/gateway/configuration)
- [配置示例](/gateway/configuration-examples)
- [斜杠命令](/tools/slash-commands)
- [多代理路由](/concepts/multi-agent)
- [更新/回滚](/install/updating)
- [配对（私聊 + 节点）](/start/pairing)
- [Nix 模式](/install/nix)
- [OpenClaw 助手设置](/start/openclaw)

### 工具与技能

- [技能系统](/tools/skills)
- [技能配置](/tools/skills-config)
- [工作区模板](/reference/templates/AGENTS)
- [RPC 适配器](/reference/rpc)

### 网关与节点

- [网关运维手册](/gateway)
- [节点（iOS/Android）](/nodes)
- [Web 界面（控制 UI）](/web)
- [发现机制 + 传输层](/gateway/discovery)
- [远程访问](/gateway/remote)

### 平台与用户体验

- [WebChat](/web/webchat)
- [控制 UI（浏览器）](/web/control-ui)
- [Telegram](/channels/telegram)
- [Discord](/channels/discord)
- [Mattermost（插件）](/channels/mattermost)
- [iMessage](/channels/imessage)
- [群组](/concepts/groups)
- [WhatsApp 群组消息](/concepts/group-messages)
- [媒体：图片](/nodes/images)
- [媒体：音频](/nodes/audio)

### 配套应用

- [macOS 应用](/platforms/macos)
- [iOS 应用](/platforms/ios)
- [Android 应用](/platforms/android)
- [Windows（WSL2）](/platforms/windows)
- [Linux 应用](/platforms/linux)

### 运维与安全

- [会话管理](/concepts/session)
- [定时任务](/automation/cron-jobs)
- [Webhooks](/automation/webhook)
- [Gmail 钩子（Pub/Sub）](/automation/gmail-pubsub)
- [安全](/gateway/security)
- [故障排查](/gateway/troubleshooting)

---

## 名字的由来

**OpenClaw** = CLAW + TARDIS —— 因为每只太空龙虾都需要一台时空机器。

> "我们都在玩自己的提示词。" —— 某个 AI，大概是在 token 嗨了的时候说的

---

## 致谢

- **Peter Steinberger** ([@steipete](https://twitter.com/steipete)) —— 创造者，龙虾语者
- **Mario Zechner** ([@badlogicc](https://twitter.com/badlogicgames)) —— Pi 创造者，安全渗透测试师
- **Clawd** —— 要求更好名字的太空龙虾

### 核心贡献者

- **Maxim Vovshin** ([@Hyaxia](https://github.com/Hyaxia)) —— Blogwatcher 技能
- **Nacho Iacovino** ([@nachoiacovino](https://github.com/nachoiacovino)) —— 位置解析（Telegram + WhatsApp）

---

## 许可证

MIT —— 像大海中的龙虾一样自由 🦞

> "我们都在玩自己的提示词。" —— 某个 AI，大概是在 token 嗨了的时候说的

---

*本文档由社区翻译，原文：https://docs.openclaw.ai/*
