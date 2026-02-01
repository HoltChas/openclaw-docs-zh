---
summary: "WhatsApp（网页频道）集成：登录、收件箱、回复、媒体和操作"
read_when:
  - 处理 WhatsApp/网页频道行为或收件箱路由
---
# WhatsApp（网页频道）

状态：仅通过 Baileys 使用 WhatsApp Web。Gateway 拥有会话。

## 快速设置（初学者）
1) 如果可能，使用**单独的电话号码**（推荐）。
2) 在 `~/.openclaw/openclaw.json` 中配置 WhatsApp。
3) 运行 `openclaw channels login` 扫描二维码（已关联设备）。
4) 启动 Gateway。

最小配置：
```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551234567"]
    }
  }
}
```

## 目标
- 在一个 Gateway 进程中支持多个 WhatsApp 账户（多账户）。
- 确定性路由：回复返回到 WhatsApp，无需模型路由。
- 模型看到足够的上下文来理解引用回复。

## 配置写入
默认情况下，WhatsApp 允许写入由 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

禁用：
```json5
{
  channels: { whatsapp: { configWrites: false } }
}
```

## 架构（谁拥有什么）
- **Gateway** 拥有 Baileys 套接字和收件箱循环。
- **CLI / macOS 应用** 与 Gateway 通信；不直接使用 Baileys。
- **活动监听器** 是出站发送必需的；否则发送快速失败。

## 获取电话号码（两种模式）

WhatsApp 需要真实的手机号码进行验证。VoIP 和虚拟号码通常被阻止。有两种支持的方式在 WhatsApp 上运行 OpenClaw：

### 专用号码（推荐）
为 OpenClaw 使用**单独的电话号码**。最佳用户体验、清晰路由、无自聊问题。理想设置：**备用/旧 Android 手机 + eSIM**。保持 Wi-Fi 和电源连接，并通过 QR 链接。

**WhatsApp Business：** 你可以在同一设备上使用不同的号码运行 WhatsApp Business。非常适合保持个人 WhatsApp 分开 —— 安装 WhatsApp Business 并在那里注册 OpenClaw 号码。

**示例配置（专用号码，单用户白名单）：**
```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551234567"]
    }
  }
}
```

**配对模式（可选）：**
如果你想要配对而不是白名单，将 `channels.whatsapp.dmPolicy` 设置为 `pairing`。未知发送者获得配对码；批准使用：
`openclaw pairing approve whatsapp <code>`

### 个人号码（备用）
快速备用：在**你自己的号码**上运行 OpenClaw。给自己发消息（WhatsApp "给自己发消息"）进行测试，这样不会骚扰联系人。预计在设置和实验期间在主手机上读取验证码。**必须启用自聊模式。**
当向导询问你的个人 WhatsApp 号码时，输入你将从中发送消息的 phone（所有者/发送者），而不是助手号码。

**示例配置（个人号码，自聊）：**
```json
{
