---
summary: "跨信封、提示词、工具和连接器的日期和时间处理"
read_when:
  - 你在更改时间戳显示给模型或用户的方式
  - 你在调试消息或系统提示词输出中的时间格式
---

# 日期与时间

OpenClaw 默认为**传输时间戳使用主机本地时间**，**仅在系统提示词中使用用户时区**。
提供者时间戳被保留，因此工具保持其原生语义（当前时间可通过 `session_status` 获得）。

## 消息信封（默认本地）

入站消息包装有时间戳（精确到分钟）：

```
[Provider ... 2026-01-05 16:26 PST] message text
```

信封时间戳**默认使用主机本地时间**，无论提供者时区如何。

你可以覆盖此行为：

```json5
{
  agents: {
    defaults: {
      envelopeTimezone: "local", // "utc" | "local" | "user" | IANA 时区
      envelopeTimestamp: "on", // "on" | "off"
      envelopeElapsed: "on" // "on" | "off"
    }
  }
}
```

- `envelopeTimezone: "utc"` 使用 UTC
- `envelopeTimezone: "local"` 使用主机时区
- `envelopeTimezone: "user"` 使用 `agents.defaults.userTimezone`（回退到主机时区）
- 使用显式 IANA 时区（例如 `"America/Chicago"`）固定时区
- `envelopeTimestamp: "off"` 从信封头中移除绝对时间戳
- `envelopeElapsed: "off"` 移除经过时间后缀（`+2m` 样式）

### 示例

**本地（默认）：**

```
[WhatsApp +1555 2026-01-18 00:19 PST] hello
```

**用户时区：**

```
[WhatsApp +1555 2026-01-18 00:19 CST] hello
```

**启用经过时间：**

```
[WhatsApp +1555 +30s 2026-01-18T05:19Z] follow-up
```

## 系统提示词：当前日期与时间

如果知道用户时区，系统提示词包含一个专用的
**当前日期与时间**部分，**只包含时区**（无时钟/时间格式）
以保持提示词缓存稳定：

```
Time zone: America/Chicago
```

当 Agent 需要当前时间时，使用 `session_status` 工具；状态卡包含时间戳行。

## 系统事件行（默认本地）

排队插入 Agent 上下文的系统事件用与消息信封相同的时区选择（默认：主机本地）添加前缀。

```
System: [2026-01-12 12:19:17 PST] Model switched.
```

### 配置用户时区 + 格式

```json5
{
  agents: {
    defaults: {
      userTimezone: "America/Chicago",
      timeFormat: "auto" // auto | 12 | 24
    }
  }
}
```

- `userTimezone` 设置提示词上下文的**用户本地时区**
- `timeFormat` 控制提示词中的**12h/24h 显示**。`auto` 遵循 OS 偏好。

## 时间格式检测（自动）

当 `timeFormat: "auto"` 时，OpenClaw 检查 OS 偏好（macOS/Windows）
并回退到区域格式。检测值**每个进程缓存**以避免重复系统调用。

## 工具负载 + 连接器（原始提供者时间 + 规范字段）

频道工具返回**提供者原生时间戳**并添加规范字段以保持一致性：

- `timestampMs`: epoch 毫秒（UTC）
- `timestampUtc`: ISO 8601 UTC 字符串

保留原始提供者字段，因此不会丢失任何内容。

- Slack：来自 API 的类 epoch 字符串
- Discord：UTC ISO 时间戳
- Telegram/WhatsApp：提供者特定的数字/ISO 时间戳

如果你需要本地时间，使用已知时区在下游转换。

## 相关文档

- [系统提示词](concepts/system-prompt.html)
- [时区](concepts/timezone.html)
- [消息](concepts/messages.html)
