---
summary: "后台执行和进程工具"
read_when:
  - 你想了解如何运行后台命令
  - 你需要管理长时间运行的任务
  - 你在使用 process 工具
---

# 后台进程

本文档介绍 OpenClaw 如何处理 shell 命令和管理长时间运行的后台任务。

## exec 工具概述

exec 工具运行 shell 命令，带有几个关键参数：

- **command**（必需）：要执行的 shell 命令
- **yieldMs**（默认 10000）：在此延迟后自动后台运行进程
- **background**（bool）：立即在后台模式运行
- **timeout**（秒，默认 1800）：在此持续时间后终止进程
- **elevated**（bool）：当允许提升模式时在主机上运行
- **pty**：当需要真正的 TTY 时设置为 `true`
- **workdir**、**env**：额外的执行上下文选项

### 行为

前台命令直接返回输出。后台进程返回"status: running"以及 sessionId 和部分输出。输出保留在内存中直到被轮询或清除。当 process 工具被禁止时，exec 同步运行。

## 子进程桥接

对于标准工具之外的长时间运行子进程，文档建议附加桥接助手以转发终止信号并正确分离监听器。这可以防止孤立进程并保持一致的关闭行为。

### 环境变量

- `PI_BASH_YIELD_MS`：默认 yield 毫秒数
- `PI_BASH_MAX_OUTPUT_CHARS`：内存输出上限
- `OPENCLAW_BASH_PENDING_MAX_OUTPUT_CHARS`：每流待处理输出上限
- `PI_BASH_JOB_TTL_MS`：会话 TTL（限制在 1 分钟到 3 小时之间）

### 配置选项

- `tools.exec.backgroundMs`（默认 10000）
- `tools.exec.timeoutSec`（默认 1800）
- `tools.exec.cleanupMs`（默认 1800000）
- `tools.exec.notifyOnExit`（默认 true）：后台进程退出时触发系统事件

## process 工具

可用操作包括：**list**、**poll**、**log**、**write**、**kill**、**clear** 和 **remove**。

关键说明：会话按 Agent 作用域，不持久化到磁盘，日志仅在记录 poll/log 结果时保存到聊天历史。log 操作支持基于行的 offset 和 limit 参数。

## 使用示例

文档提供了 JSON 示例，用于运行带延迟后台的任务、立即后台执行、轮询结果以及向运行中的进程发送 stdin 输入。
