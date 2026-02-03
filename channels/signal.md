---
summary: "Signal 频道集成指南"
read_when:
  - 你想将 OpenClaw 连接到 Signal
  - 你需要配置 signal-cli
  - 你在调试 Signal 消息问题
---

# Signal

本文档介绍 OpenClaw 的 Signal 集成，它作为"外部 CLI 集成"运行，Gateway 通过 HTTP JSON-RPC 和 SSE（服务器发送事件）与 `signal-cli` 通信。

## 设置要求

- 建议为机器人使用**单独的 Signal 电话号码**
- 需要安装 Java（signal-cli 依赖）
- 使用 `signal-cli link -n "OpenClaw"` 链接设备并扫描二维码

## 最小配置

基本配置需要启用频道、指定账户电话号码、CLI 路径、私信策略和允许的发送者列表。

## 核心概念

### 号码模型
Gateway 连接到一个 Signal 设备。在个人账户上运行机器人会触发"循环保护"，忽略你自己的消息。建议使用专用的机器人号码以实现私信功能。

### 会话处理
私信共享 Agent 的主会话，而群组使用隔离会话，模式为 `agent:<agentId>:signal:group:<groupId>`。

## 访问控制

### 私信策略
- **pairing**（默认）：未知发送者获得配对码；消息在通过 CLI 命令批准前被忽略
- **allowlist**：仅预先批准的号码可以发消息
- **open**：需要在 allowFrom 中设置 `"*"`
- **disabled**：不接受私信

### 群组策略
选项包括 `open`、`allowlist` 或 `disabled`，`groupAllowFrom` 控制允许的发送者。

## 外部守护进程模式

如需单独管理 `signal-cli`（适用于 JVM 启动慢或容器化环境），配置 `httpUrl` 并设置 `autoStart: false`。

## 媒体和消息限制

- 文本分块默认为 4000 字符（`textChunkLimit`）
- 可通过 `chunkMode="newline"` 启用基于段落的分块
- 媒体上限默认为 8MB（`mediaMaxMb`）
- 可通过 `ignoreAttachments` 禁用附件

## 功能特性

### 输入状态和已读回执
- 回复期间发送并刷新输入指示器
- 启用后可为私信转发已读回执
- signal-cli 不支持群组已读回执

### 表情回应
消息工具支持可配置级别的表情回应（`off`、`ack`、`minimal`、`extensive`）。群组回应需要指定目标作者。

## 投递目标

- 私信：`signal:+15551234567` 或 E.164 格式
- 基于 UUID：`uuid:<id>`
- 群组：`signal:group:<groupId>`
- 用户名：`username:<name>`（如支持）

## 配置选项

关键设置包括守护进程绑定（`httpHost`、`httpPort`）、启动超时、接收模式、群组和私信的历史限制，以及各种策略控制。Signal 缺乏原生提及支持，因此必须通过 Agent 或全局设置配置自定义提及模式。
