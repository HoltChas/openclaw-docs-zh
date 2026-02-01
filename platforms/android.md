---
summary: "Android 应用（节点）：连接运行手册 + Canvas/聊天/相机"
read_when:
  - 配对或重新连接 Android 节点
  - 调试 Android Gateway 发现或认证
  验证跨客户端的聊天历史一致性
---
# Android 应用（节点）

## 支持快照
- 角色：配套节点应用（Android 不托管 Gateway）。
- 需要 Gateway：是（在 macOS、Linux 或 Windows via WSL2 上运行它）。
- 安装：[入门](../start/getting-started.html) + [配对(../gateway/pairing.html)。
- Gateway：[运行手册](../gateway/index.html) + [配置(../gateway/configuration.html)。
  - 协议：[Gateway 协议(../gateway/protocol.html)（节点 + 控制平面）。

## 系统控制
系统控制（launchd/systemd）位于 Gateway 主机上。参见 [Gateway](../gateway/index.html)。

## 连接运行手册

Android 节点应用 ⇄（mDNS/NSD + WebSocket）⇄ **Gateway**

Android 直接连接到 Gateway WebSocket（默认 `ws://<host>:18789`）并使用 Gateway 拥有的配对。

### 前置条件

- 你可以在"主"机器上运行 Gateway。
- Android 设备/模拟器可以到达 Gateway WebSocket：
  - 使用 mDNS/NSD 的同一 LAN，**或**
  - 使用 Wide-Area Bonjour / 单播 DNS-SD 的同一 Tailscale tailnet（见下文），**或**
  - 手动 Gateway 主机/端口（回退）
- 你可以在 Gateway 机器上运行 CLI（`openclaw`）（或通过 SSH）。

### 1) 启动 Gateway

```bash
openclaw gateway --port 18789 --verbose
```

在日志中确认你看到类似：
- `listening on ws://0.0.0.0:18789`

对于仅 tailnet 设置（推荐用于 Vienna ⇄ London），将 Gateway 绑定到 tailnet IP：

- 在 Gateway 主机的 `~/.openclaw/openclaw.json` 中设置 `gateway.bind: "tailnet"`。
- 重启 Gateway / macOS 菜单栏应用。

### 2) 验证发现（可选）

从 Gateway 机器：

```bash
dns-sd -B _openclaw-gw._tcp local.
```

更多调试说明：[Bonjour(../gateway/bonjour.html)。

#### Tailnet（Vienna ⇄ London）通过单播 DNS-SD 发现

Android NSD/mDNS 发现不会跨网络。如果你的 Android 节点和 Gateway 在不同网络但通过 Tailscale 连接，改用 Wide-Area Bonjour / 单播 DNS-SD：

1) 在 Gateway 主机上设置 DNS-SD 区域（示例 `openclaw.internal.`）并发布 `_openclaw-gw._tcp` 记录。
2) 配置 Tailscale 分割 DNS 为你选择的域指向该 DNS 服务器。

详情和示例 CoreDNS 配置：[Bonjour(../gateway/bonjour.html)。

### 3) 从 Android 连接

在 Android 应用中：

- 应用通过 **前台服务**（持久通知）保持 Gateway 连接存活。
- 打开 **设置**。
- 在 **发现的 Gateways** 下，选择你的 Gateway 并点击 **连接**。
- 如果 mDNS 被阻止，使用 **高级 → 手动 Gateway**（主机 + 端口）和 **连接（手动）**。

首次成功配对后，Android 在启动时自动重新连接：
- 手动端点（如果启用），否则
- 最后发现的 Gateway（尽力而为）。

### 4) 批准配对（CLI）

在 Gateway 机器上：

```bash
openclaw nodes pending
openclaw nodes approve <requestId>
```

配对详情：[Gateway 配对(../gateway/pairing.html)。

### 5) 验证节点已连接

- 通过节点状态：
  ```bash
  openclaw nodes status
  ```
- 通过 Gateway：
  ```bash
  openclaw gateway call node.list --params "{}"
  ```

### 6) 聊天 + 历史

Android 节点的聊天表使用 Gateway 的 **主会话键**（`main`），因此历史和回复与 WebChat 和其他客户端共享：

- 历史：`chat.history`
- 发送：`chat.send`
- 推送更新（尽力而为）：`chat.subscribe` → `event:"chat"`

### 7) Canvas + 相机

#### Gateway Canvas 主机（推荐用于 Web 内容）

如果你想让节点显示 Agent 可以在磁盘上编辑的真实 HTML/CSS/JS，将节点指向 Gateway Canvas 主机。

注意：节点使用 `canvasHost.port`（默认 `18793`）上的独立 Canvas 主机。

1) 在 Gateway 主机上创建 `~/.openclaw/workspace/canvas/index.html`。

2) 导航节点到它（LAN）：

```bash
openclaw nodes invoke --node "<Android Node>" --command canvas.navigate --params '{"url":"http://<gateway-hostname>.local:18793/__openclaw__/canvas/"}'
```

Tailnet（可选）：如果两台设备都在 Tailscale 上，使用 MagicDNS 名称或 tailnet IP 代替 `.local`，例如 `http://<gateway-magicdns>:18793/__openclaw__/canvas/`。

此服务器将实时重新加载客户端注入 HTML 并在文件更改时重新加载。
A2UI 主机位于 `http://<gateway-host>:18793/__openclaw__/a2ui/`。

Canvas 命令（仅前台）：
- `canvas.eval`, `canvas.snapshot`, `canvas.navigate`（使用 `{"url":""}` 或 `{"url":"/"}` 返回默认脚手架）。`canvas.snapshot` 返回 `{ format, base64 }`（默认 `format="jpeg"`）。
- A2UI: `canvas.a2ui.push`, `canvas.a2ui.reset`（`canvas.a2ui.pushJSONL` 遗留别名）

相机命令（仅前台；权限门控）：
- `camera.snap` (jpg)
- `camera.clip` (mp4)

参见 [相机节点(../nodes/camera.html) 了解参数和 CLI 助手。