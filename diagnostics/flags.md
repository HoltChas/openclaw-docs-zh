---
summary: "诊断标志用于有针对性的调试日志"
read_when:
  - 你需要有针对性的调试日志，而不提高全局日志级别
  - 你需要捕获子系统特定的日志以获取支持
---

# 诊断标志

诊断标志让你能够在不打开全局详细日志的情况下启用有针对性的调试日志。标志是选择性加入的，除非子系统检查它们，否则不会产生任何效果。

## 工作原理

- 标志是字符串（不区分大小写）
- 你可以在配置中或通过环境变量覆盖启用标志
- 支持通配符：
  - `telegram.*` 匹配 `telegram.http`
  - `*` 启用所有标志

## 通过配置启用

```json
{
  "diagnostics": {
    "flags": ["telegram.http"]
  }
}
```

多个标志：

```json
{
  "diagnostics": {
    "flags": ["telegram.http", "gateway.*"]
  }
}
```

更改标志后重启 Gateway。

## 环境变量覆盖（一次性）

```bash
OPENCLAW_DIAGNOSTICS=telegram.http,telegram.payload
```

禁用所有标志：

```bash
OPENCLAW_DIAGNOSTICS=0
```

## 日志输出位置

标志将日志输出到标准诊断日志文件。默认位置：

```
/tmp/openclaw/openclaw-YYYY-MM-DD.log
```

如果设置了 `logging.file`，请使用该路径。日志格式为 JSONL（每行一个 JSON 对象）。
根据 `logging.redactSensitive` 设置，仍会进行敏感信息脱敏。

## 提取日志

选择最新的日志文件：

```bash
ls -t /tmp/openclaw/openclaw-*.log | head -n 1
```

过滤 Telegram HTTP 诊断日志：

```bash
rg "telegram http error" /tmp/openclaw/openclaw-*.log
```

或在复现时实时跟踪：

```bash
tail -f /tmp/openclaw/openclaw-$(date +%F).log | rg "telegram http error"
```

对于远程 Gateway，你也可以使用 `openclaw logs --follow`（详见 [/cli/logs(../cli/logs.html)）。

## 备注

- 如果 `logging.level` 设置为高于 `warn`，这些日志可能会被抑制。默认的 `info` 级别没问题。
- 标志可以安全地保持启用；它们只影响特定子系统的日志量。
- 使用 [/logging](../logging.html) 更改日志目标、级别和脱敏设置。
