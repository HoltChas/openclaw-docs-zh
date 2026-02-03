---
summary: "语音唤醒"
read_when:
  - 你想了解如何配置唤醒词
  - 你需要管理语音触发器
  - 你在调试语音唤醒问题
---

# 语音唤醒

OpenClaw 将唤醒词作为"**Gateway** 拥有的单一全局列表"管理。没有每节点自定义唤醒词——任何客户端都可以编辑列表，更改会广播到所有连接的设备。各设备在本地维护自己的启用/禁用开关。

## 存储位置

唤醒词存储在 gateway 主机上：
- `~/.openclaw/settings/voicewake.json`

JSON 结构包含 `triggers` 数组（例如"openclaw"、"claude"、"computer"）和 `updatedAtMs` 时间戳。

## 协议

### 方法
- **voicewake.get** — 返回包含 `triggers` 字符串数组的对象
- **voicewake.set** — 接受并返回 `triggers` 字符串数组参数

触发器经过标准化（修剪、移除空值）。空列表恢复为默认值，安全限制限制数量/长度。

### 事件
- **voicewake.changed** — 向所有 WebSocket 客户端（macOS、WebChat）和连接的节点（iOS/Android）广播当前触发器数组。节点在初始连接时也会收到此事件。

## 客户端行为

**macOS 应用**：使用全局列表用于 `VoiceWakeRuntime`，在设置中编辑触发词时调用 `voicewake.set`。

**iOS 节点**：使用全局列表用于 `VoiceWakeManager` 检测，通过 Gateway WebSocket 同步编辑。

**Android 节点**：在设置中提供唤醒词编辑器，通过 Gateway WebSocket 调用 `voicewake.set` 以在各处同步更改。
