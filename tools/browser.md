---
summary: "浏览器工具使用指南"
read_when:
  - 你想了解如何使用浏览器自动化
  - 你需要配置浏览器配置文件
  - 你在调试浏览器控制问题
---

# 浏览器工具

OpenClaw 提供一个**专用的、Agent 控制的浏览器**，与你的个人浏览器隔离运行。系统使用"Gateway 内部的小型本地控制服务"，仅在回环地址上运行。

## 核心概念

**两种配置文件类型：**
- **`openclaw`**：托管的隔离浏览器，无需扩展
- **`chrome`**：扩展中继，通过 OpenClaw 扩展连接到你的系统浏览器

文档强调此浏览器"是用于 Agent 自动化和验证的安全、隔离的界面"，不应作为日常使用的浏览器。

## 快速开始命令

```bash
openclaw browser --browser-profile openclaw status
openclaw browser --browser-profile openclaw start
openclaw browser --browser-profile openclaw open https://example.com
openclaw browser --browser-profile openclaw snapshot
```

## 配置

设置存储在 `~/.openclaw/openclaw.json`。关键选项包括：

- **`enabled`**：切换浏览器功能（默认：true）
- **`defaultProfile`**：选择"chrome"或"openclaw"
- **`executablePath`**：覆盖浏览器自动检测
- **`headless`**：无可见窗口运行
- **`attachOnly`**：仅附加到已运行的浏览器
- **`profiles`**：定义多个命名浏览器配置，包含 CDP 端口/URL 和颜色

## 浏览器选择优先级

本地启动时，OpenClaw 检查：Chrome → Brave → Edge → Chromium → Chrome Canary

## 控制模式

1. **本地控制**：Gateway 启动并管理本地浏览器
2. **通过节点主机远程控制**：Gateway 将操作代理到远程机器
3. **远程 CDP**：通过 CDP URL 直接连接到远程 Chromium 浏览器

## 快照和引用

存在两种快照样式：

- **AI 快照**（数字引用如 `12`）：使用 Playwright 的 aria-ref 的默认格式
- **角色快照**（引用如 `e12`）：使用 `--interactive` 标志生成，通过 getByRole 解析

重要："引用在导航间不稳定"——页面更改后始终重新运行快照。

## CLI 命令类别

**基础**：status、start、stop、tabs、open、focus、close

**检查**：screenshot、snapshot、console、errors、requests、pdf

**操作**：navigate、click、type、press、hover、drag、select、download、upload、fill、dialog、wait、evaluate、highlight

**状态管理**：cookies、storage、offline mode、headers、credentials、geolocation、media preferences、timezone、locale、device emulation

## 等待功能

支持等待 URL（带通配符）、加载状态、JS 谓词和选择器可见性——都可与超时设置组合。

## 安全注意事项

- 浏览器控制仅限回环地址
- `evaluate` 命令和 `wait --fn` 执行任意 JavaScript——如不需要可通过 `browser.evaluateEnabled=false` 禁用
- 远程 CDP URL/令牌应视为机密
- 保持 Gateway 和节点主机在私有网络上

## Agent 工具接口

Agent 接收单个 `browser` 工具，支持：status/start/stop/tabs/open/focus/close/snapshot/screenshot/navigate/act

工具接受 `profile`（哪个浏览器配置）和 `target`（sandbox/host/node）参数。沙箱会话默认使用沙箱浏览器；非沙箱默认使用主机。

## Playwright 依赖

高级功能（navigate、act、AI/角色快照、元素截图、PDF）需要安装 Playwright。没有它，托管 Chrome 只能使用基本 ARIA 快照和截图。
