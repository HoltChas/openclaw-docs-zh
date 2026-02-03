---
summary: "时区处理"
read_when:
  - 你想了解时间戳如何标准化
  - 你需要配置用户时区
  - 你在调试时间显示问题
---

# 时区

OpenClaw 标准化时间戳，为模型提供"**单一参考时间**"。

## 消息信封

入站消息被包装在信封中，时间戳**默认为主机本地时间**，精确到分钟。格式如下：
```
[Provider ... 2026-01-05 16:26 PST] 消息文本
```

### 配置选项

`agents.defaults` 对象支持以下设置：

- **`envelopeTimezone`**：选项包括 `"local"`、`"utc"`、`"user"` 或任何 IANA 时区字符串（如 `"Europe/Vienna"`）
- **`envelopeTimestamp`**：设置为 `"on"` 或 `"off"` 以控制绝对时间戳
- **`envelopeElapsed`**：设置为 `"on"` 或 `"off"` 以控制经过时间后缀（`+2m` 格式）

当设置为 `"user"` 时，如果未配置 `userTimezone`，系统会回退到主机时区。

## 工具负载

频道工具调用（Discord、Slack 等）返回原始提供者时间戳，但也包含标准化字段：
- `timestampMs` — UTC 纪元毫秒
- `timestampUtc` — ISO 8601 UTC 字符串

## 系统提示用户时区

使用 IANA 时区（如 `"America/Chicago"`）配置 `agents.defaults.userTimezone` 以告知模型用户的本地时间。如果没有此设置，OpenClaw 会在运行时确定主机时区。

系统提示显示：
- 带时区的当前日期/时间
- 时间格式（12 小时制或 24 小时制），可通过 `timeFormat` 设置控制（`auto`、`12` 或 `24`）

文档参考了单独的 [日期和时间](/date-time) 页面以获取更多详情。
