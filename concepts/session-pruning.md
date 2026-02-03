---
summary: "会话修剪机制"
read_when:
  - 你想了解如何减少上下文中的工具结果
  - 你需要配置修剪策略
  - 你在优化 API 缓存成本
---

# 会话修剪

会话修剪在 LLM 调用前从内存上下文中移除旧的工具结果。它"**不会**重写存储在 JSONL 文件中的磁盘会话历史"。

## 修剪激活时机

- 当启用 `cache-ttl` 模式且上次 Anthropic 调用超过 TTL 阈值时运行
- 仅影响该特定请求发送给模型的消息
- 适用于 Anthropic API 调用和 OpenRouter Anthropic 模型
- 修剪发生后 TTL 窗口重置

## 按配置文件类型的智能默认值

**OAuth/setup-token 配置文件**：启用 Cache-TTL 修剪，1 小时心跳

**API 密钥配置文件**：启用 Cache-TTL 修剪，30 分钟心跳，默认 1 小时 `cacheControlTtl`

OpenClaw 永远不会覆盖用户的显式设置。

## 成本和缓存优势

当会话空闲超过 TTL 时，修剪会减少 cacheWrite 大小。这可以防止不必要地重新缓存完整提示。文档澄清修剪"不会增加 token 或'双倍'成本"。

## 被修剪的内容

- 仅影响 `toolResult` 消息
- 用户和助手消息保持不变
- 最近的助手消息（由 `keepLastAssistants` 控制）受保护
- 带有图像块的工具结果永远不会被裁剪

## 修剪方法

**软裁剪**：保留超大结果的头部和尾部，插入省略号并注明原始大小

**硬清除**：用占位符消息替换整个工具结果

## 工具选择

`allow` 和 `deny` 列表支持通配符。拒绝规则优先，匹配不区分大小写。

## 默认配置值

| 设置 | 默认值 |
|------|--------|
| ttl | 5m |
| keepLastAssistants | 3 |
| softTrimRatio | 0.3 |
| hardClearRatio | 0.5 |
| minPrunableToolChars | 50000 |
| softTrim.maxChars | 4000 |
| hardClear.placeholder | "[Old tool result content cleared]" |

## 配置示例

**禁用修剪**：在 contextPruning 配置中设置 `mode: "off"`

**启用 TTL 感知修剪**：设置 `mode: "cache-ttl"` 并可选设置 TTL 值

**限制到特定工具**：使用带有 `allow` 和 `deny` 数组的 `tools` 对象，支持通配符模式
