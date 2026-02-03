---
summary: "Linux 浏览器故障排除"
read_when:
  - 你在 Linux 上遇到浏览器启动问题
  - 你看到 CDP 端口 18800 失败错误
  - 你在使用 snap Chromium
---

# 浏览器故障排除（Linux）

## 主要问题：CDP 端口 18800 失败

主要问题发生在 OpenClaw 的浏览器控制服务器无法启动基于 Chromium 的浏览器时，显示"Failed to start Chrome CDP on port 18800"错误。

### 为什么会发生

在 Ubuntu 和类似发行版上的根本原因是默认的 Chromium 安装使用 **snap 打包**。Snap 的 AppArmor 限制与 OpenClaw 管理浏览器进程的方式冲突。当你运行 `apt install chromium` 时，你实际上得到的是一个重定向到 snap 的存根包，而不是原生浏览器安装。

## 解决方案 1：安装 Google Chrome（推荐）

下载并安装官方 Chrome `.deb` 包：

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt --fix-broken install -y
```

在 `~/.openclaw/openclaw.json` 中配置 OpenClaw，将可执行路径设置为 `/usr/bin/google-chrome-stable`，启用浏览器控制、无头模式和 noSandbox 选项。

## 解决方案 2：使用 snap Chromium 的仅附加模式

如果需要 snap Chromium，在配置中将 `attachOnly` 设置为 true，然后手动启动 Chromium，使用无头模式、no-sandbox 标志、禁用 GPU、端口 18800 上的远程调试和自定义用户数据目录。

你可以选择在 `~/.config/systemd/user/openclaw-browser.service` 创建 **systemd 用户服务**来自动启动浏览器，使用 `systemctl --user enable --now openclaw-browser.service` 启用它。

## 验证命令

- 检查状态：`curl -s http://127.0.0.1:18791/ | jq '{running, pid, chosenBrowser}'`
- 通过 POST 到 `/start` 和 GET 到 `/tabs` 端点测试浏览

## 配置选项

| 选项 | 用途 | 默认值 |
|------|------|--------|
| `browser.enabled` | 激活浏览器控制 | `true` |
| `browser.executablePath` | 浏览器二进制位置 | 自动检测 |
| `browser.headless` | 无 GUI 操作 | `false` |
| `browser.noSandbox` | 添加 --no-sandbox 标志 | `false` |
| `browser.attachOnly` | 仅连接到现有浏览器 | `false` |
| `browser.cdpPort` | DevTools 协议端口 | `18800` |

## 次要问题：扩展中继未连接

使用 `chrome` 配置文件时，扩展中继需要 OpenClaw 浏览器扩展附加到活动标签页。解决方案包括使用 `--browser-profile openclaw` 的托管浏览器或手动安装和激活扩展。
