---
summary: "子 Agent 系统"
read_when:
  - 你想了解如何生成子 Agent
  - 你需要配置子 Agent 工具策略
  - 你在调试子 Agent 执行问题
---

# 子 Agent

子 Agent 是从现有 Agent 运行中生成的后台 Agent 运行。它们在自己的会话中运行，完成后将结果"宣布"回请求者聊天频道。

## 斜杠命令

`/subagents` 命令提供对子 Agent 运行的控制，选项包括：
- `list` - 查看活动的子 Agent
- `stop <id|#|all>` - 终止子 Agent
- `log <id|#> [limit] [tools]` - 查看日志
- `info <id|#>` - 显示元数据，包括状态、时间戳和记录路径
- `send <id|#> <message>` - 与子 Agent 通信

## 主要目标

系统旨在并行化长时间运行的任务而不阻塞主运行，通过会话分离保持隔离，限制工具范围（默认排除会话工具），并防止嵌套扇出，因为"子 Agent 不能生成子 Agent"。

## `sessions_spawn` 工具

**参数：**
- `task`（必需）
- `label?`、`agentId?`、`model?`、`thinking?`（可选）
- `runTimeoutSeconds?`（默认 `0`）- N 秒后中止
- `cleanup?`（`delete|keep`，默认 `keep`）

模型和思考设置从调用者继承，除非通过配置或显式参数覆盖。

## 自动归档行为

会话默认在 60 分钟后自动归档（可通过 `agents.defaults.subagents.archiveAfterMinutes` 配置）。记录被重命名而非删除。注意"自动归档是尽力而为；如果 gateway 重启，待处理的计时器会丢失"。

## 认证

认证按 Agent ID 解析。子 Agent 从其 Agent 目录加载认证，主 Agent 的配置文件作为回退合并。冲突时 Agent 配置文件优先。

## 宣布机制

子 Agent 通过宣布步骤向请求者频道报告。可以使用 `ANNOUNCE_SKIP` 抑制回复。消息遵循包含状态、结果和备注字段的模板，加上包括运行时间、token 使用量、成本估算和会话标识符的统计信息。

## 工具策略

子 Agent 接收所有工具**除了**会话工具（`sessions_list`、`sessions_history`、`sessions_send`、`sessions_spawn`）。配置允许 deny/allow 列表：

```json5
{
  tools: {
    subagents: {
      tools: {
        deny: ["gateway", "cron"],
      },
    },
  },
}
```

## 并发

使用名为 `subagent` 的专用队列通道，默认并发为 8，可通过 `agents.defaults.subagents.maxConcurrent` 配置。

## 停止

请求者聊天中的 `/stop` 命令会中止主会话和任何生成的子 Agent。

## 关键限制

- 宣布是尽力而为，gateway 重启时会丢失
- 子 Agent 共享 gateway 进程资源
- `sessions_spawn` 是非阻塞的，立即返回状态和 ID
- 上下文注入仅限于 `AGENTS.md` 和 `TOOLS.md`
