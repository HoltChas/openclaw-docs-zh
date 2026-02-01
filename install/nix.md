---
summary: "使用 Nix 声明式安装 OpenClaw"
read_when:
  - 你想要可重现、可回滚的安装
  - 你已经在使用 Nix/NixOS/Home Manager
  - 你想要所有内容都被固定和管理声明式
---
# Nix 安装

使用 Nix 运行 OpenClaw 的推荐方式是通过 **[nix-openclaw](https://github.com/openclaw/nix-openclaw)** —— 一个包含电池的 Home Manager 模块。

## 快速开始

将这段粘贴给你的 AI 代理（Claude、Cursor 等）：

```text
我想在我的 Mac 上设置 nix-openclaw。
仓库：github:openclaw/nix-openclaw

我需要你做的：
1. 检查是否安装了 Determinate Nix（如果没有，安装它）
2. 使用 templates/agent-first/flake.nix 在 ~/code/openclaw-local 创建本地 flake
3. 帮我创建 Telegram 机器人（@BotFather）并获取我的聊天 ID（@userinfobot）
4. 设置 secrets（机器人 token、Anthropic 密钥）- 纯文本文件在 ~/.secrets/ 也可以
5. 填写模板占位符并运行 home-manager switch
6. 验证：launchd 运行中，机器人响应消息

参考 nix-openclaw README 了解模块选项。
```

> **📦 完整指南：[github.com/openclaw/nix-openclaw](https://github.com/openclaw/nix-openclaw)**
>
> nix-openclaw 仓库是 Nix 安装的真相来源。本页只是一个快速概述。

## 你得到什么

- Gateway + macOS 应用 + 工具（whisper、spotify、cameras）—— 全部固定
- 重启后仍然存活的 Launchd 服务
- 声明式配置的插件系统
- 即时回滚：`home-manager switch --rollback`

---

## Nix 模式运行时行为

当设置 `OPENCLAW_NIX_MODE=1` 时（nix-openclaw 自动设置）：

OpenClaw 支持 **Nix 模式**，使配置确定化并禁用自动安装流程。
通过导出启用它：

```bash
OPENCLAW_NIX_MODE=1
```

在 macOS 上，GUI 应用不会自动继承 shell 环境变量。你也可以通过 defaults 启用 Nix 模式：

```bash
defaults write bot.molt.mac openclaw.nixMode -bool true
```

### 配置 + 状态路径

OpenClaw 从 `OPENCLAW_CONFIG_PATH` 读取 JSON5 配置，并将可变数据存储在 `OPENCLAW_STATE_DIR`。

- `OPENCLAW_STATE_DIR`（默认：`~/.openclaw`）
- `OPENCLAW_CONFIG_PATH`（默认：`$OPENCLAW_STATE_DIR/openclaw.json`）

在 Nix 下运行时，显式设置这些为 Nix 管理的位置，以便运行时状态和配置保持在不
the immutable store 之外。

### Nix 模式下的运行时行为

- 禁用自动安装和自修改流程
- 缺失依赖显示 Nix 特定的修复消息
- 当存在时，UI 显示只读 Nix 模式横幅

## 打包说明（macOS）

macOS 打包流程期望在以下位置有一个稳定的 Info.plist 模板：

```
apps/macos/Sources/OpenClaw/Resources/Info.plist
```

[`scripts/package-mac-app.sh`](https://github.com/openclaw/openclaw/blob/main/scripts/package-mac-app.sh) 将此模板复制到应用包中并修补动态字段
（bundle ID、版本/构建、Git SHA、Sparkle 密钥）。这保持 plist 对 SwiftPM
打包和 Nix 构建（不依赖完整 Xcode 工具链）是确定性的。

## 相关

- [nix-openclaw](https://github.com/openclaw/nix-openclaw) —— 完整设置指南
- [向导](../start/wizard.html) —— 非 Nix CLI 设置
- [Docker(../install/docker.html) —— 容器化设置