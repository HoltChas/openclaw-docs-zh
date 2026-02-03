---
summary: "AGENTS.default 模板"
read_when:
  - 你想了解默认个人助手配置
  - 你需要设置工作区
  - 你在配置 Agent 行为
---

# AGENTS.default 模板

## 概述
这是 OpenClaw 的默认个人助手配置，使用位于 `~/.openclaw/workspace` 的专用工作区（可配置）。

## 首次运行设置
1. 创建工作区目录
2. 将模板文件（AGENTS.md、SOUL.md、TOOLS.md）复制到工作区
3. 可选通过复制 AGENTS.default.md 使用个人助手技能名册
4. 工作区路径可通过 `agents.defaults.workspace` 配置

## 安全默认值
Agent 应避免转储目录/密钥、未经许可运行破坏性命令，以及向外部消息界面发送部分回复。

## 会话启动要求
Agent 必须在响应前读取"SOUL.md、USER.md、memory.md 以及 memory/ 中的今天+昨天"。

## 灵魂配置
SOUL.md 定义 Agent 的"身份、语气和边界"。应通知用户更改。每个会话从头开始，"连续性存在于这些文件中"。

## 记忆系统
- 每日日志存储为 `memory/YYYY-MM-DD.md`
- 长期记忆在 `memory.md` 中，用于"持久的事实、偏好和决策"
- 捕获决策、偏好、约束和待办事项

## 可用核心技能
包括以下工具：截图（Peekaboo）、安全摄像头（camsnap）、消息（imsg、wacli、discord）、Google Suite（gog）、音乐（spotify-player、Sonos CLI、blucli）、智能家居（OpenHue CLI）、语音（sag、Whisper）、社交媒体（bird）和浏览器自动化。

## 使用说明
`openclaw` CLI 是脚本编写的首选，macOS 应用处理权限。浏览器交互使用快照引用，心跳启用调度和监控功能。
