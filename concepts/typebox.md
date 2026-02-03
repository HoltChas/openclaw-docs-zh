---
summary: "TypeBox 协议模式"
read_when:
  - 你想了解 Gateway WebSocket 协议
  - 你需要添加新的协议方法
  - 你在调试协议问题
---

# TypeBox

TypeBox 作为 OpenClaw Gateway WebSocket 协议的"协议真实来源"。它是一个 TypeScript 优先的模式库，驱动运行时验证、JSON Schema 导出和 macOS 应用的 Swift 代码生成。

## 消息帧类型

Gateway 使用三种帧类型：
- **Request**：包含 type、id、method 和 params
- **Response**：包含 type、id、ok 状态和 payload 或 error
- **Event**：包含 type、event 名称、payload 和可选的 seq/stateVersion

连接必须以 `connect` 请求开始，然后才能调用任何其他方法。

## 文件位置

| 用途 | 路径 |
|------|------|
| 源模式 | `src/gateway/protocol/schema.ts` |
| 运行时验证器（AJV） | `src/gateway/protocol/index.ts` |
| 服务器握手/分发 | `src/gateway/server.ts` |
| 节点客户端 | `src/gateway/client.ts` |
| 生成的 JSON Schema | `dist/protocol.schema.json` |
| 生成的 Swift 模型 | `apps/macos/Sources/OpenClawProtocol/GatewayModels.swift` |

## 管道命令

- `pnpm protocol:gen` — 生成 JSON Schema（draft-07）
- `pnpm protocol:gen:swift` — 生成 Swift gateway 模型
- `pnpm protocol:check` — 运行两个生成器并验证输出已提交

## 方法类别

- **核心**：connect、health、status
- **消息**：send、poll、agent、agent.wait（需要 idempotencyKey）
- **聊天**：chat.history、chat.send、chat.abort、chat.inject
- **会话**：sessions.list、sessions.patch、sessions.delete
- **节点**：node.list、node.invoke、node.pair.*
- **事件**：tick、presence、agent、chat、health、shutdown

## 添加新方法（端到端）

1. 在 `schema.ts` 中使用 `Type.Object()` 定义模式，设置 `additionalProperties: false`
2. 在 `protocol/index.ts` 中导出 AJV 验证器
3. 在 server-methods 中添加处理程序，在 METHODS 数组中注册
4. 运行 `pnpm protocol:check`
5. 添加测试和文档

## Swift 代码生成输出

生成器产生：
- `GatewayFrame` 枚举，包含 req、res、event 和 unknown 情况
- 强类型负载结构体/枚举
- ErrorCode 值和协议版本常量

未知帧作为原始负载保留以实现前向兼容性。

## 模式约定

- 对象通常使用 `additionalProperties: false` 进行严格验证
- `NonEmptyString` 是 ID 和方法/事件名称的标准
- 顶级 `GatewayFrame` 在 `type` 字段上使用鉴别器
- 有副作用的方法需要 `idempotencyKey` 参数

## 版本控制

协议版本在 `schema.ts` 中定义。客户端在连接期间指定 `minProtocol` 和 `maxProtocol`；服务器拒绝不匹配。

## 模式更改工作流

1. 更新 TypeBox 模式
2. 运行 `pnpm protocol:check`
3. 提交重新生成的模式和 Swift 模型
