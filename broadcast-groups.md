---
summary: "向多个 Agent 广播 WhatsApp 消息"
read_when:
  - 配置广播群组
  - 调试 WhatsApp 中的多 Agent 回复
status: experimental
---

# 广播群组

**状态：** 实验性功能  
**版本：** 2026.1.9 中添加

## 概述

广播群组让多个 Agent 能够同时处理和响应同一条消息。这让你可以创建专门的 Agent 团队，在一个 WhatsApp 群组或私聊中一起工作——全部使用一个电话号码。

当前范围：**仅限 WhatsApp**（网页频道）。

广播群组在频道白名单和群组激活规则之后评估。在 WhatsApp 群组中，这意味着当 OpenClaw 通常会回复时进行广播（例如：被@提及时，取决于你的群组设置）。

## 使用场景

### 1. 专门的 Agent 团队
部署多个具有原子化、专注职责的 Agent：
```
群组："开发团队"
Agent：
  - CodeReviewer（审查代码片段）
  - DocumentationBot（生成文档）
  - SecurityAuditor（检查漏洞）
  - TestGenerator（建议测试用例）
```

每个 Agent 处理相同的消息并提供其专业视角。

### 2. 多语言支持
```
群组："国际支持"
Agent：
  - Agent_EN（用英语回复）
  - Agent_DE（用德语回复）
  - Agent_ES（用西班牙语回复）
```

### 3. 质量保证工作流
```
群组："客户支持"
Agent：
  - SupportAgent（提供答案）
  - QAAgent（审查质量，仅当发现问题时回复）
```

### 4. 任务自动化
```
群组："项目管理"
Agent：
  - TaskTracker（更新任务数据库）
  - TimeLogger（记录花费时间）
  - ReportGenerator（创建摘要）
```

## 配置

### 基本设置

添加一个顶级 `broadcast` 部分（与 `bindings` 并列）。键是 WhatsApp peer ID：
- 群组聊天：群组 JID（例如 `120363403215116621@g.us`）
- 私聊：E.164 电话号码（例如 `+15551234567`）

```json
{
  "broadcast": {
    "120363403215116621@g.us": ["alfred", "baerbel", "assistant3"]
  }
}
```

**结果：** 当 OpenClaw 会在此聊天中回复时，它将运行所有三个 Agent。

### 处理策略

控制 Agent 如何处理消息：

#### 并行（默认）
所有 Agent 同时处理：
```json
{
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": ["alfred", "baerbel"]
  }
}
```

#### 顺序
Agent 按顺序处理（一个等待前一个完成）：
```json
{
  "broadcast": {
    "strategy": "sequential",
    "120363403215116621@g.us": ["alfred", "baerbel"]
  }
}
```

### 完整示例

```json
{
  "agents": {
    "list": [
      {
        "id": "code-reviewer",
        "name": "Code Reviewer",
        "workspace": "/path/to/code-reviewer",
        "sandbox": { "mode": "all" }
      },
      {
        "id": "security-auditor",
        "name": "Security Auditor",
        "workspace": "/path/to/security-auditor",
        "sandbox": { "mode": "all" }
      },
      {
        "id": "docs-generator",
        "name": "Documentation Generator",
        "workspace": "/path/to/docs-generator",
        "sandbox": { "mode": "all" }
      }
    ]
  },
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": ["code-reviewer", "security-auditor", "docs-generator"],
    "120363424282127706@g.us": ["support-en", "support-de"],
    "+15555550123": ["assistant", "logger"]
  }
}
```

## 工作原理

### 消息流程

1. **消息到达** WhatsApp 群组
2. **广播检查**：系统检查 peer ID 是否在 `broadcast` 中
3. **如果在广播列表中**：
   - 所有列出的 Agent 处理消息
   - 每个 Agent 有自己的会话键和隔离上下文
   - Agent 并行（默认）或顺序处理
4. **如果不在广播列表中**：
   - 应用正常路由（第一个匹配的绑定）

注意：广播群组不会绕过频道白名单或群组激活规则（提及/命令等）。它们只改变消息有资格处理时*哪些 Agent 运行*。

### 会话隔离

广播群组中的每个 Agent 保持完全独立的：

- **会话键**（`agent:alfred:whatsapp:group:120363...` vs `agent:baerbel:whatsapp:group:120363...`）
- **对话历史**（Agent 看不到其他 Agent 的消息）
- **工作空间**（如果配置，使用单独的沙盒）
- **工具访问**（不同的允许/拒绝列表）
- **记忆/上下文**（单独的 IDENTITY.md、SOUL.md 等）
- **群组上下文缓冲区**（用于上下文的最近群组消息）每个 peer 共享，因此所有广播 Agent 在触发时看到相同的上下文

这让每个 Agent 可以有：
- 不同的个性
- 不同的工具访问（例如只读 vs 读写）
- 不同的模型（例如 opus vs sonnet）
- 不同的已安装技能

### 示例：隔离的会话

在群组 `120363403215116621@g.us` 中，Agent 为 `["alfred", "baerbel"]`：

**Alfred 的上下文：**
```
Session: agent:alfred:whatsapp:group:120363403215116621@g.us
History: [user message, alfred's previous responses]
Workspace: /Users/pascal/openclaw-alfred/
Tools: read, write, exec
```

**Bärbel 的上下文：**
```
Session: agent:baerbel:whatsapp:group:120363403215116621@g.us  
History: [user message, baerbel's previous responses]
Workspace: /Users/pascal/openclaw-baerbel/
Tools: read only
```

## 最佳实践

### 1. 保持 Agent 专注

设计每个 Agent 具有单一、明确的职责：

```json
{
  "broadcast": {
    "DEV_GROUP": ["formatter", "linter", "tester"]
  }
}
```

✅ **好：** 每个 Agent 有一个任务  
❌ **坏：** 一个通用的 "dev-helper" Agent

### 2. 使用描述性名称

让每个 Agent 的功能清晰：

```json
{
  "agents": {
    "security-scanner": { "name": "Security Scanner" },
    "code-formatter": { "name": "Code Formatter" },
    "test-generator": { "name": "Test Generator" }
  }
}
```

### 3. 配置不同的工具访问

给 Agent 只提供它们需要的工具：

```json
{
  "agents": {
    "reviewer": {
      "tools": { "allow": ["read", "exec"] }  // 只读
    },
    "fixer": {
      "tools": { "allow": ["read", "write", "edit", "exec"] }  // 读写
    }
  }
}
```

### 4. 监控性能

有很多 Agent 时，考虑：
- 使用 `"strategy": "parallel"`（默认）以提高速度
- 将广播群组限制在 5-10 个 Agent
- 使用更快的模型处理简单的 Agent

### 5. 优雅地处理失败

Agent 独立失败。一个 Agent 的错误不会阻止其他 Agent：

```
Message → [Agent A ✓, Agent B ✗ error, Agent C ✓]
Result: Agent A and C respond, Agent B logs error
```

## 兼容性

### 提供者

广播群组当前适用于：
- ✅ WhatsApp（已实现）
- 🚧 Telegram（计划中）
- 🚧 Discord（计划中）
- 🚧 Slack（计划中）

### 路由

广播群组与现有路由一起工作：

```json
{
  "bindings": [
    { "match": { "channel": "whatsapp", "peer": { "kind": "group", "id": "GROUP_A" } }, "agentId": "alfred" }
  ],
  "broadcast": {
    "GROUP_B": ["agent1", "agent2"]
  }
}
```

- `GROUP_A`：只有 alfred 回复（正常路由）
- `GROUP_B`：agent1 AND agent2 回复（广播）

**优先级：** `broadcast` 优先于 `bindings`。

## 故障排除

### Agent 不回复

**检查：**
1. Agent ID 存在于 `agents.list` 中
2. Peer ID 格式正确（例如 `120363403215116621@g.us`）
3. Agent 不在拒绝列表中

**调试：**
```bash
tail -f ~/.openclaw/logs/gateway.log | grep broadcast
```

### 只有一个 Agent 回复

**原因：** Peer ID 可能在 `bindings` 中但不在 `broadcast` 中。

**修复：** 添加到广播配置或从绑定中移除。

### 性能问题

**如果 Agent 很多时变慢：**
- 减少每个群组的 Agent 数量
- 使用更轻的模型（sonnet 而非 opus）
- 检查沙盒启动时间

## 示例

### 示例 1：代码审查团队

```json
{
  "broadcast": {
    "strategy": "parallel",
    "120363403215116621@g.us": [
      "code-formatter",
      "security-scanner",
      "test-coverage",
      "docs-checker"
    ]
  },
  "agents": {
    "list": [
      { "id": "code-formatter", "workspace": "~/agents/formatter", "tools": { "allow": ["read", "write"] } },
      { "id": "security-scanner", "workspace": "~/agents/security", "tools": { "allow": ["read", "exec"] } },
      { "id": "test-coverage", "workspace": "~/agents/testing", "tools": { "allow": ["read", "exec"] } },
      { "id": "docs-checker", "workspace": "~/agents/docs", "tools": { "allow": ["read"] } }
    ]
  }
}
```

**用户发送：** 代码片段  
**回复：**
- code-formatter: "修复了缩进并添加了类型提示"
- security-scanner: "⚠️ 第 12 行存在 SQL 注入漏洞"
- test-coverage: "覆盖率 45%，缺少错误用例测试"
- docs-checker: "函数 `process_data` 缺少文档字符串"

### 示例 2：多语言支持

```json
{
  "broadcast": {
    "strategy": "sequential",
    "+15555550123": ["detect-language", "translator-en", "translator-de"]
  },
  "agents": {
    "list": [
      { "id": "detect-language", "workspace": "~/agents/lang-detect" },
      { "id": "translator-en", "workspace": "~/agents/translate-en" },
      { "id": "translator-de", "workspace": "~/agents/translate-de" }
    ]
  }
}
```

## API 参考

### 配置模式

```typescript
interface OpenClawConfig {
  broadcast?: {
    strategy?: "parallel" | "sequential";
    [peerId: string]: string[];
  };
}
```

### 字段

- `strategy`（可选）：如何处理 Agent
  - `"parallel"`（默认）：所有 Agent 同时处理
  - `"sequential"`：Agent 按数组顺序处理
  
- `[peerId]`：WhatsApp 群组 JID、E.164 号码或其他 peer ID
  - 值：应该处理消息的 Agent ID 数组

## 限制

1. **最大 Agent 数：** 无硬性限制，但 10+ 个 Agent 可能很慢
2. **共享上下文：** Agent 看不到彼此的响应（设计如此）
3. **消息排序：** 并行响应可能以任意顺序到达
4. **速率限制：** 所有 Agent 计入 WhatsApp 速率限制

## 未来增强

计划功能：
- [ ] 共享上下文模式（Agent 可以看到彼此的响应）
- [ ] Agent 协调（Agent 可以互相发送信号）
- [ ] 动态 Agent 选择（根据消息内容选择 Agent）
- [ ] Agent 优先级（某些 Agent 在其他之前响应）

## 另见

- [多 Agent 配置](multi-agent-sandbox-tools.html)
- [路由配置](concepts/channel-routing.html)
- [会话管理](concepts/sessions.html)
