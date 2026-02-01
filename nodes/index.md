---
summary: "节点：配对、能力、权限和 Canvas/相机/屏幕/系统的 CLI 助手"
read_when:
  - 将 iOS/Android 节点配对到 Gateway
  - 使用节点 Canvas/相机获取 Agent 上下文
  - 添加新节点命令或 CLI 助手
---
# 节点

**节点** 是连接到 Gateway **WebSocket**（与操作员相同端口）的配套设备（macOS/iOS/Android/无头），带有 `role: "node"` 并通过 `node.invoke` 暴露命令表面（例如 `canvas.*`、`camera.*`、`system.*`）。协议详情：[Gateway 协议(../gateway/protocol.html)。

遗留传输：[桥接协议(../gateway/bridge-protocol.html)（TCP JSONL；当前节点已弃用/移除）。

macOS 也可以运行在 **节点模式**：菜单栏应用连接到 Gateway 的 WS 服务器并将其本地 Canvas/相机命令作为节点暴露（因此 `openclaw nodes …` 可以针对此 Mac 工作）。

说明：
- 节点是 **外围设备**，不是 Gateway。它们不运行 Gateway 服务。
- Telegram/WhatsApp/等消息到达 **Gateway**，不在节点上。

## 配对 + 状态

**WS 节点使用设备配对。** 节点在 `connect` 期间展示设备标识；Gateway
为 `role: node` 创建设备配对请求。通过设备 CLI（或 UI）批准。

快速 CLI：

```bash
openclaw devices list
openclaw devices approve <requestId>
openclaw devices reject <requestId>
openclaw nodes status
openclaw nodes describe --node <idOrNameOrIp>
```

说明：
- 当设备配对角色包括 `node` 时，`nodes status` 将节点标记为 **已配对**。
- `node.pair.*`（CLI: `openclaw nodes pending/approve/reject`）是独立的 Gateway 拥有的
  节点配对存储；它 **不** 控制 WS `connect` 握手。

## 远程节点主机（system.run）

当你的 Gateway 在一台机器上运行但你想在另一台机器上执行命令时，使用 **节点主机**。模型仍然与 **Gateway** 通信；Gateway 在选择了 `host=node` 时将 `exec` 调用转发给 **节点主机**。

### 什么在哪里运行
- **Gateway 主机**：接收消息，运行模型，路由工具调用。
- **节点主机**：在节点机器上执行 `system.run`/`system.which`。
- **批准**：通过 `~/.openclaw/exec-approvals.json` 在节点主机上强制执行。

### 启动节点主机（前台）

在节点机器上：

```bash
openclaw node run --host <gateway-host> --port 18789 --display-name "Build Node"
```

### 启动节点主机（服务）

```bash
openclaw node install --host <gateway-host> --port 18789 --display-name "Build Node"
openclaw node restart
```

### 配对 + 命名

在 Gateway 主机上：

```bash
openclaw nodes pending
openclaw nodes approve <requestId>
openclaw nodes list
```

命名选项：
- `openclaw node run` / `openclaw node install` 上的 `--display-name`（持久化在节点上的 `~/.openclaw/node.json` 中）。
- `openclaw nodes rename --node <id|name|ip> --name "Build Node"`（Gateway 覆盖）。

### 允许列表命令

Exec 批准是 **每个节点主机** 的。从 Gateway 添加允许列表条目：

```bash
openclaw approvals allowlist add --node <id|name|ip> "/usr/bin/uname"
openclaw approvals allowlist add --node <id|name|ip> "/usr/bin/sw_vers"
```

批准存在于节点主机的 `~/.openclaw/exec-approvals.json` 中。

### 将 exec 指向节点

配置默认值（Gateway 配置）：

```bash
openclaw config set tools.exec.host node
openclaw config set tools.exec.security allowlist
openclaw config set tools.exec.node "<id-or-name>"
```

或每个会话：

```
/exec host=node security=allowlist node=<id-or-name>
```

设置后，任何带有 `host=node` 的 `exec` 调用在节点主机上运行（受节点允许列表/批准约束）。

相关：
- [节点主机 CLI(../cli/node.html)
- [Exec 工具(../tools/exec.html)
- [Exec 批准(../tools/exec-approvals.html)

## 调用命令

低级（原始 RPC）：

```bash
openclaw nodes invoke --node <idOrNameOrIp> --command canvas.eval --params '{"javaScript":"location.href"}'
```

高级助手存在于常见的"给 Agent 一个 MEDIA 附件"工作流。

## 截图（Canvas 快照）

如果节点显示 Canvas（WebView），`canvas.snapshot` 返回 `{ format, base64 }`。

CLI 助手（写入临时文件并打印 `MEDIA:<path>`）：

```bash
openclaw nodes canvas snapshot --node <idOrNameOrIp> --format png
openclaw nodes canvas snapshot --node <idOrNameOrIp> --format jpg --max-width 1200 --quality 0.9
```

### Canvas 控制

```bash
openclaw nodes canvas present --node <idOrNameOrIp> --target https://example.com
openclaw nodes canvas hide --node <idOrNameOrIp>
openclaw nodes canvas navigate https://example.com --node <idOrNameOrIp>
openclaw nodes canvas eval --node <idOrNameOrIp> --js "document.title"
```

说明：
- `canvas present` 接受 URL 或本地文件路径（`--target`），加上可选的 `--x/--y/--width/--height` 用于定位。
- `canvas eval` 接受内联 JS（`--js`）或位置参数。

### A2UI（Canvas）

```bash
openclaw nodes canvas a2ui push --node <idOrNameOrIp> --text "Hello"
openclaw nodes canvas a2ui push --node <idOrNameOrIp> --jsonl ./payload.jsonl
openclaw nodes canvas a2ui reset --node <idOrNameOrIp>
```

说明：
- 仅支持 A2UI v0.8 JSONL（v0.9/createSurface 被拒绝）。

## 照片 + 视频（节点相机）

照片（`jpg`）：

```bash
openclaw nodes camera list --node <idOrNameOrIp>
openclaw nodes camera snap --node <idOrNameOrIp>            # 默认：两个朝向（2 个 MEDIA 行）
openclaw nodes camera snap --node <idOrNameOrIp> --facing front
```

视频片段（`mp4`）：

```bash
openclaw nodes camera clip --node <idOrNameOrIp> --duration 10s
openclaw nodes camera clip --node <idOrNameOrIp> --duration 3000 --no-audio
```

说明：
- 节点必须 **前台化** 才能使用 `canvas.*` 和 `camera.*`（后台调用返回 `NODE_BACKGROUND_UNAVAILABLE`）。
- 片段持续时间被限制（当前 `<= 60s`）以避免超大 base64 负载。
- Android 会在可能时提示 `CAMERA`/`RECORD_AUDIO` 权限；拒绝的权限失败并返回 `*_PERMISSION_REQUIRED`。

## 屏幕录制（节点）

节点暴露 `screen.record` (mp4)。示例：

```bash
openclaw nodes screen record --node <idOrNameOrIp> --duration 10s --fps 10
openclaw nodes screen record --node <idOrNameOrIp> --duration 10s --fps 10 --no-audio
```

说明：
- `screen.record` 需要节点应用在前台。
- Android 会在录制前显示系统屏幕捕获提示。
- 屏幕录制被限制为 `<= 60s`。
- `--no-audio` 禁用麦克风捕获（iOS/Android 支持；macOS 使用系统捕获音频）。
- 当有多个屏幕可用时使用 `--screen <index>` 选择显示器。

## 位置（节点）

当设置中启用位置时，节点暴露 `location.get`。

CLI 助手：

```bash
openclaw nodes location get --node <idOrNameOrIp>
openclaw nodes location get --node <idOrNameOrIp> --accuracy precise --max-age 15000 --location-timeout 10000
```

说明：
- 位置 **默认关闭**。
- "始终" 需要系统权限；后台获取是尽力而为。
- 响应包括纬度/经度、精度（米）和时间戳。

## SMS（Android 节点）

当用户授予 **SMS** 权限且设备支持电话时，Android 节点可以暴露 `sms.send`。

低级调用：

```bash
openclaw nodes invoke --node <idOrNameOrIp> --command sms.send --params '{"to":"+15555550123","message":"Hello from OpenClaw"}'
```

说明：
- 必须在 Android 设备上接受权限提示，然后能力才会被广告。
- 没有电话的纯 Wi-Fi 设备不会广告 `sms.send`。

## 系统命令（节点主机 / mac 节点）

macOS 节点暴露 `system.run`、`system.notify` 和 `system.execApprovals.get/set`。
无头节点主机暴露 `system.run`、`system.which` 和 `system.execApprovals.get/set`。

示例：

```bash
openclaw nodes run --node <idOrNameOrIp> -- echo "Hello from mac node"
openclaw nodes notify --node <idOrNameOrIp> --title "Ping" --body "Gateway ready"
```

说明：
- `system.run` 在负载中返回 stdout/stderr/退出代码。
- `system.notify` 尊重 macOS 应用上的通知权限状态。
- `system.run` 支持 `--cwd`、`--env KEY=VAL`、`--command-timeout` 和 `--needs-screen-recording`。
- `system.notify` 支持 `--priority <passive|active|timeSensitive>` 和 `--delivery <system|overlay|auto>`。
- macOS 节点丢弃 `PATH` 覆盖；无头节点主机仅在它前置节点主机 PATH 时接受 `PATH`。
- 在 macOS 节点模式下，`system.run` 由 macOS 应用中的 exec 批准控制（设置 → Exec 批准）。
  询问/允许列表/完整的行为与无头节点主机相同；拒绝的提示返回 `SYSTEM_RUN_DENIED`。
- 在无头节点主机上，`system.run` 由 exec 批准控制（`~/.openclaw/exec-approvals.json`）。

## Exec 节点绑定

当有多个节点可用时，你可以将 exec 绑定到特定节点。
这会为 `exec host=node` 设置默认节点（并且可以被每个 Agent 覆盖）。

全局默认值：

```bash
openclaw config set tools.exec.node "node-id-or-name"
```

每个 Agent 覆盖：

```bash
openclaw config get agents.list
openclaw config set agents.list[0].tools.exec.node "node-id-or-name"
```

取消设置以允许任何节点：

```bash
openclaw config unset tools.exec.node
openclaw config unset agents.list[0].tools.exec.node
```

## 权限映射

节点可能在 `node.list` / `node.describe` 中包含 `permissions` 映射，按键为权限名称（例如 `screenRecording`、`accessibility`）带有布尔值（`true` = 已授予）。

## 无头节点主机（跨平台）

OpenClaw 可以运行 **无头节点主机**（无 UI），它连接到 Gateway
WebSocket 并暴露 `system.run` / `system.which`。这在 Linux/Windows 上或作为服务器旁的最小节点运行非常有用。

启动它：

```bash
openclaw node run --host <gateway-host> --port 18789
```

说明：
- 仍然需要配对（Gateway 会显示节点批准提示）。
- 节点主机将其节点 ID、令牌、显示名称和 Gateway 连接信息存储在 `~/.openclaw/node.json` 中。
- Exec 批准通过 `~/.openclaw/exec-approvals.json` 在本地强制执行
  （参见 [Exec 批准(../tools/exec-approvals.html)）。
- 在 macOS 上，无头节点主机在可到达时优先使用配套应用 exec 主机，如果应用不可用则回退到本地执行。设置 `OPENCLAW_NODE_EXEC_HOST=app` 要求使用应用，或 `OPENCLAW_NODE_EXEC_FALLBACK=0` 禁用回退。
- 当 Gateway WS 使用 TLS 时添加 `--tls` / `--tls-fingerprint`。

## Mac 节点模式

- macOS 菜单栏应用作为节点连接到 Gateway WS 服务器（因此 `openclaw nodes …` 可以针对此 Mac 工作）。
- 在远程模式下，应用为 Gateway 端口打开 SSH 隧道并连接到 `localhost`。