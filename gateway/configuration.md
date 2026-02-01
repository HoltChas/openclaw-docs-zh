---
summary: "~/.openclaw/openclaw.json 的所有配置选项及示例"
read_when:
  - 添加或修改配置字段
---
# 配置 🔧

OpenClaw 从 `~/.openclaw/openclaw.json` 读取可选的 **JSON5** 配置（允许注释 + 尾随逗号）。

如果文件缺失，OpenClaw 使用安全的默认值（嵌入式 Pi Agent + 每发送者会话 + 工作空间 `~/.openclaw/workspace`）。你通常只需要配置来：
- 限制谁可以触发 Bot（`channels.whatsapp.allowFrom`、`channels.telegram.allowFrom` 等）
- 控制群组白名单 + 提及行为（`channels.whatsapp.groups`、`channels.telegram.groups`、`channels.discord.guilds`、`agents.list[].groupChat`）
- 自定义消息前缀（`messages`）
- 设置 Agent 的工作空间（`agents.defaults.workspace` 或 `agents.list[].workspace`）
- 调整嵌入式 Agent 默认值（`agents.defaults`）和会话行为（`session`）
- 设置每 Agent 身份（`agents.list[].identity`）

> **刚接触配置？** 查看 [配置示例(../gateway/configuration-examples.html) 指南获取完整示例和详细说明！

## 严格配置验证

OpenClaw 只接受完全匹配模式的配置。
未知键、格式错误的类型或无效值会导致 Gateway **拒绝启动** 以确保安全。

验证失败时：
- Gateway 不会启动。
- 只允许诊断命令（例如：`openclaw doctor`、`openclaw logs`、`openclaw health`、`openclaw status`、`openclaw service`、`openclaw help`）。
- 运行 `openclaw doctor` 查看具体问题。
- 运行 `openclaw doctor --fix`（或 `--yes`）应用迁移/修复。

Doctor 除非你明确选择 `--fix`/`--yes`，否则不会写入更改。

## 模式 + UI 提示

Gateway 通过 `config.schema` 暴露配置的 JSON Schema 表示供 UI 编辑器使用。
Control UI 从此模式渲染表单，并提供 **原始 JSON** 编辑器作为逃生舱。

频道插件和扩展可以为它们的配置注册模式 + UI 提示，因此频道设置
在应用中保持模式驱动，无需硬编码表单。

提示（标签、分组、敏感字段）与模式一起提供，因此客户端可以渲染
更好的表单而无需硬编码配置知识。

## 应用 + 重启（RPC）

使用 `config.apply` 验证 + 写入完整配置并一步重启 Gateway。
它会写入重启标记并在 Gateway 恢复后 ping 最后一个活动会话。

警告：`config.apply` 替换**整个配置**。如果你只想更改几个键，
使用 `config.patch` 或 `openclaw config set`。备份 `~/.openclaw/openclaw.json`。

参数：
- `raw` (string) — 整个配置的 JSON5 负载
- `baseHash` (可选) — 来自 `config.get` 的配置哈希（当配置已存在时需要）
- `sessionKey` (可选) — 唤醒 ping 的最后一个活动会话键
- `note` (可选) — 包含在重启标记中的注释
- `restartDelayMs` (可选) — 重启前延迟（默认 2000）

示例（通过 `gateway call`）：

```bash
# 获取当前配置哈希
openclaw gateway call config.get --params '{}' # 捕获 payload.hash
# 应用新配置
openclaw gateway call config.apply --params '{
  "raw": "{\\n  agents: { defaults: { workspace: \\"~/.openclaw/workspace\\" } }\\n}\\n",
  "baseHash": "<hash-from-config.get>",
  "sessionKey": "agent:main:whatsapp:dm:+15555550123",
  "restartDelayMs": 1000
}'
```

## 部分更新（RPC）

使用 `config.patch` 将部分更新合并到现有配置而不覆盖
无关的键。它应用 JSON 合并补丁语义：
- 对象递归合并
- `null` 删除键
- 数组替换
像 `config.apply` 一样，它验证、写入配置、存储重启标记，并调度
Gateway 重启（当提供 `sessionKey` 时可选唤醒）。

参数：
- `raw` (string) — 仅包含要更改的键的 JSON5 负载
- `baseHash` (必需) — 来自 `config.get` 的配置哈希
- `sessionKey` (可选) — 唤醒 ping 的最后一个活动会话键
- `note` (可选) — 包含在重启标记中的注释
- `restartDelayMs` (可选) — 重启前延迟（默认 2000）

示例：

```bash
# 获取当前配置哈希
openclaw gateway call config.get --params '{}' # 捕获 payload.hash
# 打补丁更新配置
openclaw gateway call config.patch --params '{
  "raw": "{\\n  channels: { telegram: { groups: { \\"*\\": { requireMention: false } } } }\\n}\\n",
  "baseHash": "<hash-from-config.get>",
  "sessionKey": "agent:main:whatsapp:dm:+15555550123",
  "restartDelayMs": 1000
}'
```

## 最小配置（推荐起点）

```json5
{
  agents: { defaults: { workspace: "~/.openclaw/workspace" } },
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}
```

用以下命令构建默认镜像：
```bash
scripts/sandbox-setup.sh
```

## 自聊模式（推荐用于群组控制）

为防止 Bot 响应 WhatsApp 群组中的 @-提及（只响应特定文本触发器）：

```json5
{
  agents: {
    defaults: { workspace: "~/.openclaw/workspace" },
    list: [
      {
        id: "main",
        groupChat: { mentionPatterns: ["@openclaw", "reisponde"] }
      }
    ]
  },
  channels: {
    whatsapp: {
      // 白名单仅用于私聊；包含你自己的号码启用自聊模式。
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } }
    }
  }
}
```

## 配置包含（`$include`）

使用 `$include` 指令将配置拆分为多个文件。这对于以下情况很有用：
- 组织大型配置（例如，每客户端 Agent 定义）
- 跨环境共享通用设置
- 将敏感配置分开

### 基本用法

```json5
// ~/.openclaw/openclaw.json
{
  gateway: { port: 18789 },
  
  // 包含单个文件（替换键的值）
  agents: { "$include": "./agents.json5" },
  
  // 包含多个文件（按顺序深度合并）
  broadcast: { 
    "$include": [
      "./clients/mueller.json5",
      "./clients/schmidt.json5"
    ]
  }
}
```

```json5
// ~/.openclaw/agents.json5
{
  defaults: { sandbox: { mode: "all", scope: "session" } },
  list: [
    { id: "main", workspace: "~/.openclaw/workspace" }
  ]
}
```

### 合并行为

- **单个文件**：替换包含 `$include` 的对象
- **文件数组**：按顺序深度合并（后面的文件覆盖前面的）
- **与兄弟键**：兄弟键在包含后合并（覆盖包含的值）
- **兄弟键 + 数组/原始值**：不支持（包含的内容必须是对象）

```json5
// 兄弟键覆盖包含的值
{
  "$include": "./base.json5",   // { a: 1, b: 2 }
  b: 99                          // 结果: { a: 1, b: 99 }
}
```

### 嵌套包含

包含的文件本身可以包含 `$include` 指令（最多 10 层深度）：

```json5
// clients/mueller.json5
{
  agents: { "$include": "./mueller/agents.json5" },
  broadcast: { "$include": "./mueller/broadcast.json5" }
}
