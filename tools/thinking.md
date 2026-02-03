---
summary: "思考级别控制"
read_when:
  - 你想了解如何控制推理深度
  - 你需要配置思考级别
  - 你在使用 /think 指令
---

# 思考级别

## 概述

`/think` 指令系统允许用户通过内联命令控制推理深度。存在三种语法选项：`/t <level>`、`/think:<level>` 或 `/thinking <level>`。

## 可用级别

- **off**：禁用思考
- **minimal**：映射到"think"
- **low**：映射到"think hard"
- **medium**：映射到"think harder"
- **high**：映射到"ultrathink"（最大预算）
- **xhigh**："ultrathink+"（仅限 GPT-5.2 和 Codex 模型）

别名"highest"和"max"都解析为 high 级别。

## 解析优先级

系统按以下顺序确定思考级别：
1. 内联指令（消息特定）
2. 会话覆盖
3. 通过 `agents.defaults.thinkingDefault` 的全局默认值
4. 回退："对于支持推理的模型为 low；否则为 off"

## 会话管理

发送仅指令消息（如 `/think:medium`）设置会话默认值。系统用"Thinking level set to high."等消息确认。无效级别被拒绝，同时保留现有状态。通过发送不带参数的 `/think` 查询当前级别。

## 相关指令

**Verbose（`/verbose` 或 `/v`）**：控制工具输出可见性，级别为 `on`、`full` 或 `off`。启用时，工具调用显示为带有表情符号前缀的单独消息。

**Reasoning（`/reasoning` 或 `/reason`）**：切换思考块的可见性。支持 `on`、`off` 和 `stream`（仅 Telegram，用于草稿气泡流式传输）。

## 心跳

心跳探测使用可配置的提示。在心跳传递中包含推理需要设置 `agents.defaults.heartbeat.includeReasoning: true`。

## Web UI 行为

思考选择器在加载时反映存储的会话级别。选择不同级别仅应用于下一条消息，然后恢复。永久更改需要发送 `/think:<level>` 指令。
