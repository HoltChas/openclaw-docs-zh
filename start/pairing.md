---
summary: "配对概览：批准谁可以私聊你 + 哪些节点可以加入"
read_when:
  - 设置私聊访问控制
  - 配对新的 iOS/Android 节点
  - 审查 OpenClaw 安全态势
---

# 配对

"配对"是 OpenClaw 的显式**所有者批准**步骤。
它在两个地方使用：

1) **私聊配对**（谁被允许与 Bot 对话）
2) **节点配对**（哪些设备/节点被允许加入 Gateway 网络）

安全上下文：[安全](/gateway/security)

## 1) 私聊配对（入站聊天访问）

当频道配置为私聊策略 `pairing` 时，未知发送者会收到一个短码，他们的消息**不会被处理**，直到你批准。

默认私聊策略文档在：[安全](/gateway/security)

配对码：
- 8 个字符，大写，无歧义字符（`0O1I`）。
- **1 小时后过期**。Bot 只在新请求创建时发送配对消息（大约每小时每个发送者一次）。
- 待处理的私聊配对请求默认上限为**每频道 3 个**；额外请求会被忽略，直到一个过期或被批准。

### 批准发送者

```bash
# 列出待处理的 Telegram 配对请求
openclaw pairing list telegram
# 批准特定配对码
openclaw pairing approve telegram <CODE>
```

支持的频道：`telegram`、`whatsapp`、`signal`、`imessage`、`discord`、`slack`。

### 状态存储位置

存储在 `~/.openclaw/credentials/`：
- 待处理请求：`<channel>-pairing.json`
- 已批准白名单存储：`<channel>-allowFrom.json`

将这些视为敏感文件（它们控制对你的助手的访问）。


## 2) 节点设备配对（iOS/Android/macOS/无头节点）

节点以 `role: node` 的**设备**身份连接到 Gateway。Gateway
创建设备配对请求，必须被批准。

### 批准节点设备

```bash
# 列出待处理的设备
openclaw devices list
# 批准特定设备请求
openclaw devices approve <requestId>
# 拒绝设备请求
openclaw devices reject <requestId>
```

### 状态存储位置

存储在 `~/.openclaw/devices/`：
- `pending.json`（短期；待处理请求会过期）
- `paired.json`（已配对设备 + Token）

### 注意

- 旧版 `node.pair.*` API（CLI：`openclaw nodes pending/approve`）是
  单独的 Gateway 拥有的配对存储。WS 节点仍然需要设备配对。


## 相关文档

- 安全模型 + 提示注入：[安全](/gateway/security)
- 安全更新（运行 doctor）：[更新](/install/updating)
- 频道配置：
  - Telegram：[Telegram](/channels/telegram)
  - WhatsApp：[WhatsApp](/channels/whatsapp)
  - Signal：[Signal](/channels/signal)
  - iMessage：[iMessage](/channels/imessage)
  - Discord：[Discord](/channels/discord)
  - Slack：[Slack](/channels/slack)
