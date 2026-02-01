---
summary: "iOS 节点应用：连接到 Gateway、配对、Canvas 和故障排查"
read_when:
  - 配对或重新连接 iOS 节点
  - 从源码运行 iOS 应用
  - 调试 Gateway 发现或 Canvas 命令
---
# iOS 应用（节点）

可用性：内部预览。iOS 应用尚未公开发布。

## 功能

- 通过 WebSocket 连接到 Gateway（LAN 或 tailnet）。
- 暴露节点能力：Canvas、屏幕快照、相机捕获、位置、对话模式、语音唤醒。
- 接收 `node.invoke` 命令并报告节点状态事件。

## 要求

- Gateway 在另一台设备上运行（macOS、Linux 或 Windows via WSL2）。
- 网络路径：
  - 通过 Bonjour 的同一 LAN，**或**
  - 通过单播 DNS-SD 的 Tailnet（示例域：`openclaw.internal.`），**或**
  - 手动主机/端口（回退）。

## 快速开始（配对 + 连接）

1) 启动 Gateway：

```bash
openclaw gateway --port 18789
```

2) 在 iOS 应用中，打开设置并选择发现的 Gateway（或启用手动主机并输入主机/端口）。

3) 在 Gateway 主机上批准配对请求：

```bash
openclaw nodes pending
openclaw nodes approve <requestId>
```

4) 验证连接：

```bash
openclaw nodes status
openclaw gateway call node.list --params "{}"
```

## 发现路径

### Bonjour（LAN）

Gateway 在 `local.` 上广播 `_openclaw-gw._tcp`。iOS 应用自动列出这些。

### Tailnet（跨网络）

如果 mDNS 被阻止，使用单播 DNS-SD 区域（选择域；示例：`openclaw.internal.`）和 Tailscale 分割 DNS。
参见 [Bonjour](/gateway/bonjour) 了解 CoreDNS 示例。

### 手动主机/端口

在设置中，启用 **手动主机** 并输入 Gateway 主机 + 端口（默认 `18789`）。

## Canvas + A2UI

iOS 节点渲染 WKWebView Canvas。使用 `node.invoke` 驱动它：

```bash
openclaw nodes invoke --node "iOS Node" --command canvas.navigate --params '{"url":"http://<gateway-host>:18793/__openclaw__/canvas/"}'
```

说明：
- Gateway Canvas 主机提供 `/__openclaw__/canvas/` 和 `/__openclaw__/a2ui/`。
- 当广告 Canvas 主机 URL 时，iOS 节点在连接时自动导航到 A2UI。
- 使用 `canvas.navigate` 和 `{"url":""}` 返回内置脚手架。

### Canvas eval / 快照

```bash
openclaw nodes invoke --node "iOS Node" --command canvas.eval --params '{"javaScript":"(() => { const {ctx} = window.__openclaw; ctx.clearRect(0,0,innerWidth,innerHeight); ctx.lineWidth=6; ctx.strokeStyle=\"#ff2d55\"; ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(innerWidth-40, innerHeight-40); ctx.stroke(); return \"ok\"; })()"}'
```

```bash
openclaw nodes invoke --node "iOS Node" --command canvas.snapshot --params '{"maxWidth":900,"format":"jpeg"}'
```

## 语音唤醒 + 对话模式

- 语音唤醒和对话模式在设置中可用。
- iOS 可能在后台暂停音频；当应用不活动时，将语音功能视为尽力而为。

## 常见错误

- `NODE_BACKGROUND_UNAVAILABLE`：将 iOS 应用带到前台（Canvas/相机/屏幕命令需要它）。
- `A2UI_HOST_NOT_CONFIGURED`：Gateway 没有广告 Canvas 主机 URL；检查 [Gateway 配置](/gateway/configuration) 中的 `canvasHost`。
- 配对提示从未出现：运行 `openclaw nodes pending` 并手动批准。
- 重新安装后重新连接失败：Keychain 配对令牌已清除；重新配对节点。

## 相关文档

- [配对](/gateway/pairing)
- [发现](/gateway/discovery)
- [Bonjour](/gateway/bonjour)