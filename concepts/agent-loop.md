---
summary: "Agent 循环执行流程"
read_when:
  - 你想了解 Agent 运行的完整执行路径
  - 你需要理解队列和并发机制
  - 你在调试 Agent 执行问题
---

# Agent 循环

OpenClaw 中的 Agent 循环代表 Agent 运行的完整执行路径，包括接收、上下文组装、模型推理、工具执行、流式回复和持久化。它在整个过程中维护会话状态一致性。

## 入口点

- Gateway RPC 方法：`agent` 和 `agent.wait`
- CLI：`agent` 命令

## 执行流程

高层流程如下：

1. **`agent` RPC** 验证参数、解析会话、持久化元数据，并立即返回 `runId` 和 `acceptedAt` 时间戳

2. **`agentCommand`** 处理实际的 Agent 执行，解析模型默认值、加载技能、调用 pi-agent-core 运行时并发出生命周期事件

3. **`runEmbeddedPiAgent`** 通过会话和全局队列序列化运行，构建 pi 会话，订阅事件，强制超时，并返回使用元数据

4. **`subscribeEmbeddedPiSession`** 将事件桥接到 OpenClaw 流（工具、助手和生命周期流，包含"start"、"end"或"error"等阶段）

5. **`agent.wait`** 监控生命周期完成并返回状态信息

## 队列和并发

运行按会话键序列化以防止竞态条件。消息频道可以选择与此通道系统集成的队列模式（collect/steer/followup）。

## 会话和工作区准备

- 解析并创建工作区（沙箱运行可能使用备用根目录）
- 加载技能并注入到环境和提示中
- 引导/上下文文件填充系统提示
- 流式传输开始前获取会话写锁

## 钩子系统

**内部（Gateway）钩子：**
- `agent:bootstrap` 用于修改引导上下文文件
- 命令钩子用于 `/new`、`/reset`、`/stop` 等

**插件钩子：**
- `before_agent_start` / `agent_end` 用于运行生命周期
- `before_compaction` / `after_compaction` 用于压缩周期
- `before_tool_call` / `after_tool_call` 用于工具拦截
- `tool_result_persist` 用于在持久化前转换结果
- 消息钩子：`message_received`、`message_sending`、`message_sent`
- 会话钩子：`session_start`、`session_end`
- Gateway 钩子：`gateway_start`、`gateway_stop`

## 流式行为

助手增量作为 `assistant` 事件流式传输。块流式传输可以在 `text_end` 或 `message_end` 时发出部分回复。推理可以单独流式传输或作为块回复。

## 工具执行

工具事件（start/update/end）在 `tool` 流上发出。结果会针对大小和图像负载进行清理。消息工具发送会被跟踪以防止重复确认。

## 回复整形

最终负载组合助手文本、可选推理、内联工具摘要（详细模式时）和错误文本。`NO_REPLY` 标记会被过滤掉，消息重复会被移除。

## 压缩和重试

自动压缩触发 `compaction` 流事件并可能导致重试。重试时，缓冲区和工具摘要会重置以防止重复。

## 超时

- `agent.wait` 默认 30 秒（可通过 `timeoutMs` 配置）
- Agent 运行时默认 600 秒，通过 `agents.defaults.timeoutSeconds` 设置

## 提前终止场景

- Agent 超时（中止）
- AbortSignal（取消）
- Gateway 断开连接或 RPC 超时
- `agent.wait` 超时（不会停止 Agent 本身）
