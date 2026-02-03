---
summary: "Gateway 日志系统"
read_when:
  - 你想了解如何查看和配置日志
  - 你需要调试 Gateway 问题
  - 你在配置日志级别
---

# 日志

OpenClaw 提供两个日志界面：**控制台输出**（终端/调试 UI）和**文件日志**（来自 Gateway 日志记录器的 JSON 行）。

## 基于文件的日志记录器

- 默认位置：`/tmp/openclaw/`，每日滚动文件命名为 `openclaw-YYYY-MM-DD.log`
- 通过 `~/.openclaw/openclaw.json` 配置：
  - `logging.file` - 设置日志文件路径
  - `logging.level` - 控制文件日志详细程度

通过 CLI 跟踪日志：
```bash
openclaw logs --follow
```

**关键区别**：`--verbose` 标志仅影响控制台详细程度，不影响文件日志。要在文件中捕获详细信息，请将 `logging.level` 设置为 `debug` 或 `trace`。

## 控制台捕获

CLI 捕获标准控制台方法并将其写入文件日志，同时打印到 stdout/stderr。配置选项：
- `logging.consoleLevel`（默认：`info`）
- `logging.consoleStyle`（`pretty` | `compact` | `json`）

## 工具摘要脱敏

敏感令牌可以在控制台工具摘要中屏蔽（不影响文件日志）：
- `logging.redactSensitive`：`off` | `tools`（默认：`tools`）
- `logging.redactPatterns`：用于自定义模式的正则表达式字符串数组

## Gateway WebSocket 日志

**正常模式**：仅显示错误、慢调用（≥50ms）和解析错误。

**详细模式**：显示所有 WS 请求/响应流量。

通过 `--ws-log` 的样式选项：
- `auto`（默认）
- `compact` - 配对的请求/响应输出
- `full` - 完整的每帧输出

示例命令：
```bash
openclaw gateway --verbose --ws-log compact
openclaw gateway --verbose --ws-log full
```

## 控制台格式化

格式化器具有 TTY 感知能力，带有子系统前缀（如 `[gateway]`、`[canvas]`），支持遵循 `NO_COLOR` 的颜色，以及独立的控制台/文件日志级别。
