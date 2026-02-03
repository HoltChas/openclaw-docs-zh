---
summary: "工具系统概述"
read_when:
  - 你想了解 OpenClaw 提供哪些工具
  - 你需要配置工具访问权限
  - 你在设置工具配置文件
---

# 工具

OpenClaw 提供"一流的 Agent 工具"，用于浏览器自动化、画布渲染、节点管理和定时任务。这些类型化工具取代了旧的 `openclaw-*` 技能方式。

## 工具配置

### 禁用工具

在 `openclaw.json` 中使用 `tools.allow` 和 `tools.deny` 配置工具访问（deny 优先）。匹配不区分大小写，支持通配符。

### 工具配置文件

四个基础配置文件控制工具可用性：
- **minimal**：仅 `session_status`
- **coding**：文件系统、运行时、会话、记忆和图像工具
- **messaging**：消息工具加会话管理
- **full**：无限制（默认）

配置文件可通过 `agents.list[].tools.profile` 全局或按 Agent 设置。

### 提供者特定策略

使用 `tools.byProvider` 为特定模型提供者限制工具。这在基础配置文件之后但在 allow/deny 列表之前应用，因此只能缩小可用工具集。

## 工具组

简写引用展开为多个工具：
- `group:runtime` → exec、bash、process
- `group:fs` → read、write、edit、apply_patch
- `group:sessions` → 会话管理工具
- `group:memory` → memory_search、memory_get
- `group:web` → web_search、web_fetch
- `group:ui` → browser、canvas
- `group:automation` → cron、gateway
- `group:messaging` → message
- `group:nodes` → nodes

## 核心工具

### 执行工具
- **exec**：运行 shell 命令，支持超时、后台运行和主机定向参数
- **process**：管理后台会话（list、poll、log、write、kill、clear、remove）
- **apply_patch**：应用结构化多文件补丁（实验性）

### Web 工具
- **web_search**：Brave Search API 集成（需要 API 密钥）
- **web_fetch**：从 URL 提取可读内容为 markdown 或文本

### 浏览器工具
控制托管浏览器，支持导航、快照、截图和 UI 交互操作。支持多个配置文件，可定向到沙箱、主机或节点环境。

### 画布工具
驱动节点 Canvas 功能，包括 present、hide、navigate、eval、snapshot 和 A2UI 操作。

### 节点工具
管理配对节点，具有通知、命令执行、摄像头/屏幕捕获和位置获取功能。

### 消息工具
支持 Discord、Slack、Telegram、WhatsApp、Signal、iMessage、Google Chat 和 MS Teams，具有发送、轮询、回应、线程和管理操作。

### 会话工具
- **sessions_list/history/send/spawn**：管理和在会话间通信
- **session_status**：检查或修改当前会话状态
- **agents_list**：列出可用于生成的 Agent

### 自动化工具
- **cron**：管理定时任务和唤醒
- **gateway**：重启或更新 Gateway 进程

## 推荐工作流

**浏览器自动化**：启动浏览器 → 快照 → 操作 → 截图

**画布渲染**：Present → a2ui_push → 快照

**节点定向**：检查状态 → 描述节点 → 执行命令

## 安全指南

文档强调对摄像头/屏幕捕获获取"明确的用户同意"，并在调用媒体命令前使用状态/描述检查。

## 工具呈现

工具通过两个渠道到达 Agent：人类可读的系统提示文本和发送到模型 API 的结构化函数模式。
