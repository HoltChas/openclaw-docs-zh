---
summary: "平台支持概述"
read_when:
  - 你想了解支持哪些操作系统
  - 你需要选择托管平台
  - 你在安装 Gateway 服务
---

# 平台

OpenClaw 的核心使用 TypeScript 构建，"Node 是推荐的运行时"。文档指出 Bun 在 Gateway 中的 WhatsApp/Telegram 功能存在问题。

## 支持的操作系统

平台提供以下配套应用：
- **macOS**（菜单栏应用）
- **iOS** 和 **Android**（移动节点）
- **Windows** 和 **Linux**（配套应用计划中；Windows 的 Gateway 通过 WSL2 工作）

## VPS 和托管选项

支持的托管平台包括：
- Fly.io
- Hetzner（基于 Docker）
- GCP（Compute Engine）
- exe.dev（带 HTTPS 代理的 VM）

## Gateway 安装方法

有四种 CLI 方式可用：

1. **向导（推荐）：** `openclaw onboard --install-daemon`
2. **直接安装：** `openclaw gateway install`
3. **配置流程：** `openclaw configure` 然后选择 Gateway 服务
4. **修复/迁移：** `openclaw doctor` 用于修复或安装服务

## 按 OS 的服务目标

- **macOS：** 使用 LaunchAgent，标识符如 `bot.molt.gateway` 或配置文件特定变体
- **Linux/WSL2：** 使用 systemd 用户服务，名为 `openclaw-gateway[-<profile>].service`

## 有用的命令和链接

- 检查服务状态：`openclaw gateway status`
- 文档索引可在 llms.txt 端点获取，用于发现所有页面
