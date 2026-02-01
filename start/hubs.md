---
summary: "链接到每个 OpenClaw 文档的中心"
read_when:
  - 想要完整的文档地图
---
# 文档中心

使用这些中心来发现每个页面，包括不出现在左侧导航中的深入探讨和参考文档。

## 从这里开始

- [首页](/)
- [入门指南](/start/getting-started)
- [配置](/start/onboarding)
- [向导](/start/wizard)
- [设置](/start/setup)
- [Dashboard（本地 Gateway）](http://127.0.0.1:18789/)
- [帮助](/help)
- [配置](/gateway/configuration)
- [配置示例](/gateway/configuration-examples)
- [OpenClaw 助手](/start/openclaw)
- [展示](/start/showcase)
- [背景](/start/lore)

## 安装 + 更新

- [Docker](/install/docker)
- [Nix](/install/nix)
- [更新 / 回滚](/install/updating)
- [Bun 工作流（实验性）](/install/bun)

## 核心概念

- [架构](/concepts/architecture)
- [网络中心](/network)
- [Agent 运行时](/concepts/agent)
- [Agent 工作空间](/concepts/agent-workspace)
- [记忆](/concepts/memory)
- [Agent 循环](/concepts/agent-loop)
- [流式传输 + 分块](/concepts/streaming)
- [多 Agent 路由](/concepts/multi-agent)
- [压缩](/concepts/compaction)
- [会话](/concepts/session)
- [会话（别名）](/concepts/sessions)
- [会话修剪](/concepts/session-pruning)
- [会话工具](/concepts/session-tool)
- [队列](/concepts/queue)
- [斜杠命令](/tools/slash-commands)
- [RPC 适配器](/reference/rpc)
- [TypeBox 模式](/concepts/typebox)
- [时区处理](/concepts/timezone)
- [在线状态](/concepts/presence)
- [发现 + 传输](/gateway/discovery)
- [Bonjour](/gateway/bonjour)
- [频道路由](/concepts/channel-routing)
- [群组](/concepts/groups)
- [群组消息](/concepts/group-messages)
- [模型故障转移](/concepts/model-failover)
- [OAuth](/concepts/oauth)

## Provider + 入口

- [聊天频道中心](/channels)
- [模型 Provider 中心](/providers/models)
- [WhatsApp](/channels/whatsapp)
- [Telegram](/channels/telegram)
- [Telegram（grammY 说明）](/channels/grammy)
- [Slack](/channels/slack)
- [Discord](/channels/discord)
- [Mattermost](/channels/mattermost)（插件）
- [Signal](/channels/signal)
- [iMessage](/channels/imessage)
- [位置解析](/channels/location)
- [WebChat](/web/webchat)
- [Webhooks](/automation/webhook)
- [Gmail Pub/Sub](/automation/gmail-pubsub)

## Gateway + 操作

- [Gateway 手册](/gateway)
- [Gateway 配对](/gateway/pairing)
- [Gateway 锁定](/gateway/gateway-lock)
- [后台进程](/gateway/background-process)
- [健康](/gateway/health)
- [心跳](/gateway/heartbeat)
- [Doctor](/gateway/doctor)
- [日志](/gateway/logging)
- [沙盒](/gateway/sandboxing)
- [Dashboard](/web/dashboard)
- [Control UI](/web/control-ui)
- [远程访问](/gateway/remote)
- [远程 Gateway README](/gateway/remote-gateway-readme)
- [Tailscale](/gateway/tailscale)
- [安全](/gateway/security)
- [故障排除](/gateway/troubleshooting)

## 工具 + 自动化

- [工具界面](/tools)
- [OpenProse](/prose)
- [CLI 参考](/cli)
- [Exec 工具](/tools/exec)
- [提升模式](/tools/elevated)
- [Cron 任务](/automation/cron-jobs)
- [Cron vs 心跳](/automation/cron-vs-heartbeat)
- [思考 + 详细](/tools/thinking)
- [模型](/concepts/models)
- [子 Agent](/tools/subagents)
- [Agent 发送 CLI](/tools/agent-send)
- [终端 UI](/tui)
- [浏览器控制](/tools/browser)
- [浏览器（Linux 故障排除）](/tools/browser-linux-troubleshooting)
- [投票](/automation/poll)

## 节点、媒体、语音

- [节点概览](/nodes)
- [相机](/nodes/camera)
- [图片](/nodes/images)
- [音频](/nodes/audio)
- [位置命令](/nodes/location-command)
- [语音唤醒](/nodes/voicewake)
- [对讲模式](/nodes/talk)

## 平台

- [平台概览](/platforms)
- [macOS](/platforms/macos)
- [iOS](/platforms/ios)
- [Android](/platforms/android)
- [Windows (WSL2)](/platforms/windows)
- [Linux](/platforms/linux)
- [Web 界面](/web)

## macOS 伴侣应用（高级）

- [macOS 开发设置](/platforms/mac/dev-setup)
- [macOS 菜单栏](/platforms/mac/menu-bar)
- [macOS 语音唤醒](/platforms/mac/voicewake)
- [macOS 语音覆盖](/platforms/mac/voice-overlay)
- [macOS WebChat](/platforms/mac/webchat)
- [macOS Canvas](/platforms/mac/canvas)
- [macOS 子进程](/platforms/mac/child-process)
- [macOS 健康](/platforms/mac/health)
- [macOS 图标](/platforms/mac/icon)
- [macOS 日志](/platforms/mac/logging)
- [macOS 权限](/platforms/mac/permissions)
- [macOS 远程](/platforms/mac/remote)
- [macOS 签名](/platforms/mac/signing)
- [macOS 发布](/platforms/mac/release)
- [macOS Gateway（launchd）](/platforms/mac/bundled-gateway)
- [macOS XPC](/platforms/mac/xpc)
- [macOS Skills](/platforms/mac/skills)
- [macOS Peekaboo](/platforms/mac/peekaboo)

## 工作空间 + 模板

- [Skills](/tools/skills)
- [ClawdHub](/tools/clawdhub)
- [Skills 配置](/tools/skills-config)
- [默认 AGENTS](/reference/AGENTS.default)
- [模板：AGENTS](/reference/templates/AGENTS)
- [模板：BOOTSTRAP](/reference/templates/BOOTSTRAP)
- [模板：HEARTBEAT](/reference/templates/HEARTBEAT)
- [模板：IDENTITY](/reference/templates/IDENTITY)
- [模板：SOUL](/reference/templates/SOUL)
- [模板：TOOLS](/reference/templates/TOOLS)
- [模板：USER](/reference/templates/USER)

## 实验（探索性）

- [配置协议](/experiments/onboarding-config-protocol)
- [Cron 加固说明](/experiments/plans/cron-add-hardening)
- [群组策略加固说明](/experiments/plans/group-policy-hardening)
- [研究：记忆](/experiments/research/memory)
- [模型配置探索](/experiments/proposals/model-config)

## 测试 + 发布

- [测试](/reference/test)
- [发布检查清单](/reference/RELEASING)
- [设备模型](/reference/device-models)
