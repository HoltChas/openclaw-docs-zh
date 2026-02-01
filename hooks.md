---
summary: "钩子：命令和生命周期事件的事件驱动自动化"
read_when:
  - 你想要 /new、/reset、/stop 和 Agent 生命周期事件的事件驱动自动化
  - 你想要构建、安装或调试钩子
---

# 钩子

钩子提供了一个可扩展的事件驱动系统，用于自动化响应 Agent 命令和事件的操作。钩子自动从目录发现，可以通过 CLI 命令管理，类似于 OpenClaw 中技能的工作方式。

## 快速上手

钩子是当某些事情发生时运行的小脚本。有两种：

- **钩子**（本页）：当 Agent 事件触发时在 Gateway 内部运行，如 `/new`、`/reset`、`/stop` 或生命周期事件。
- **Webhooks**：让其他系统触发 OpenClaw 工作的外部 HTTP webhook。参见 [Webhook 钩子](automation/webhook.html) 或使用 `openclaw webhooks` 获取 Gmail 助手命令。
  
钩子也可以捆绑在插件内；参见 [插件](plugin.html)。

常见用途：
- 重置会话时保存记忆快照
- 保留命令审计日志用于故障排除或合规
- 会话开始或结束时触发后续自动化
- 事件触发时向 Agent 工作空间写入文件或调用外部 API

如果你能写一个小 TypeScript 函数，你就能写一个钩子。钩子自动发现，你可以通过 CLI 启用或禁用它们。

## 概述

钩子系统允许你：
- 发出 `/new` 时保存会话上下文到记忆
- 记录所有命令用于审计
- 在 Agent 生命周期事件上触发自定义自动化
- 无需修改核心代码即可扩展 OpenClaw 的行为

## 入门

### 捆绑钩子

OpenClaw 附带四个自动发现的捆绑钩子：

- **💾 session-memory**：向 Agent 工作空间保存会话上下文（默认 `~/.openclaw/workspace/memory/`）当你发出 `/new` 时
- **📝 command-logger**：记录所有命令事件到 `~/.openclaw/logs/commands.log`
- **🚀 boot-md**：Gateway 启动时运行 `BOOT.md`（需要启用内部钩子）
- **😈 soul-evil**：在清除窗口期间或随机机会将注入的 `SOUL.md` 内容替换为 `SOUL_EVIL.md`

列出可用钩子：

```bash
openclaw hooks list
```

启用钩子：

```bash
openclaw hooks enable session-memory
```

检查钩子状态：

```bash
openclaw hooks check
```

获取详细信息：

```bash
openclaw hooks info session-memory
```

### 引导

在引导期间（`openclaw onboard`），你会被提示启用推荐的钩子。向导自动发现合格的钩子并呈现供选择。

## 钩子发现

钩子自动从三个目录发现（按优先级顺序）：

1. **工作空间钩子**：`<workspace>/hooks/`（每个 Agent，最高优先级）
2. **托管钩子**：`~/.openclaw/hooks/`（用户安装，跨工作空间共享）
3. **捆绑钩子**：`<openclaw>/dist/hooks/bundled/`（随 OpenClaw 一起发布）

托管钩子目录可以是**单个钩子**或**钩子包**（包目录）。

每个钩子是一个包含以下内容的目录：

```
my-hook/
├── HOOK.md          # 元数据 + 文档
└── handler.ts       # 处理程序实现
```

## 钩子包（npm/归档）

钩子包是通过 `package.json` 中的 `openclaw.hooks` 导出一个或多个钩子的标准 npm 包。用以下命令安装：

```bash
openclaw hooks install <path-or-spec>
```

示例 `package.json`：

```json
{
  "name": "@acme/my-hooks",
  "version": "0.1.0",
  "openclaw": {
    "hooks": ["./hooks/my-hook", "./hooks/other-hook"]
  }
}
```

每个条目指向包含 `HOOK.md` 和 `handler.ts`（或 `index.ts`）的钩子目录。
钩子包可以附带依赖；它们将安装在 `~/.openclaw/hooks/<id>` 下。

## 钩子结构

### HOOK.md 格式

`HOOK.md` 文件包含 YAML frontmatter 中的元数据加上 Markdown 文档：

```markdown
---
name: my-hook
description: "这个钩子的简短描述"
homepage: https://docs.openclaw.ai/hooks#my-hook
metadata: {"openclaw":{"emoji":"🔗","events":["command:new"],"requires":{"bins":["node"]}}}
---

# My Hook

详细文档放在这里...

## 它做什么

- 监听 `/new` 命令
- 执行某些操作
- 记录结果

## 要求

- 必须安装 Node.js

## 配置

无需配置。
```

### 元数据字段

`metadata.openclaw` 对象支持：

- **`emoji`**：CLI 显示的表情符号（例如 `"💾"`）
- **`events`**：监听的事件数组（例如 `["command:new", "command:reset"]`）
- **`export`**：使用的命名导出（默认为 `"default"`）
- **`homepage`**：文档 URL
- **`requires`**：可选要求
  - **`bins`**：PATH 上需要的二进制文件（例如 `["git", "node"]`）
  - **`anyBins`**：这些二进制文件中必须至少存在一个
  - **`env`**：需要的环境变量
  - **`config`**：需要的配置路径（例如 `["workspace.dir"]`）
  - **`os`**：需要的平台（例如 `["darwin", "linux"]`）
- **`always`**：绕过资格检查（布尔值）
- **`install`**：安装方法（对于捆绑钩子：`[{"id":"bundled","kind":"bundled"}]`）

### 处理程序实现

`handler.ts` 文件导出一个 `HookHandler` 函数：

```typescript
import type { HookHandler } from '../../src/hooks/hooks.js';

const myHandler: HookHandler = async (event) => {
  // 只在 'new' 命令时触发
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  console.log(`[my-hook] New command triggered`);
  console.log(`  Session: ${event.sessionKey}`);
  console.log(`  Timestamp: ${event.timestamp.toISOString()}`);

  // 你的自定义逻辑在这里

  // 可选发送消息给用户
  event.messages.push('✨ My hook executed!');
};

export default myHandler;
```

#### 事件上下文

每个事件包括：

```typescript
{
  type: 'command' | 'session' | 'agent' | 'gateway',
  action: string,              // 例如 'new', 'reset', 'stop'
  sessionKey: string,          // 会话标识符
  timestamp: Date,             // 事件何时发生
  messages: string[],          // 推送到这里发送给用户
  context: {
    sessionEntry?: SessionEntry,
    sessionId?: string,
    sessionFile?: string,
    commandSource?: string,    // 例如 'whatsapp', 'telegram'
    senderId?: string,
    workspaceDir?: string,
    bootstrapFiles?: WorkspaceBootstrapFile[],
    cfg?: OpenClawConfig
  }
}
```

## 事件类型

### 命令事件

发出 Agent 命令时触发：

- **`command`**：所有命令事件（通用监听器）
- **`command:new`**：发出 `/new` 命令时
- **`command:reset`**：发出 `/reset` 命令时
- **`command:stop`**：发出 `/stop` 命令时

### Agent 事件

- **`agent:bootstrap`**：工作空间引导文件注入之前（钩子可以修改 `context.bootstrapFiles`）

### Gateway 事件

Gateway 启动时触发：

- **`gateway:startup`**：频道启动和钩子加载后

### 工具结果钩子（插件 API）

这些钩子不是事件流监听器；它们让插件在 OpenClaw 持久化之前同步调整工具结果。

- **`tool_result_persist`**：转换工具结果，在写入会话记录之前。必须是同步的；返回更新的工具结果负载或 `undefined` 保持不变。参见 [Agent 循环](concepts/agent-loop.html)。

### 未来事件

计划的事件类型：

- **`session:start`**：新会话开始时
- **`session:end`**：会话结束时
- **`agent:error`**：Agent 遇到错误时
- **`message:sent`**：消息发送时
- **`message:received`**：消息接收时

## 创建自定义钩子

### 1. 选择位置

- **工作空间钩子**（`<workspace>/hooks/`）：每个 Agent，最高优先级
- **托管钩子**（`~/.openclaw/hooks/`）：跨工作空间共享

### 2. 创建目录结构

```bash
mkdir -p ~/.openclaw/hooks/my-hook
cd ~/.openclaw/hooks/my-hook
```

### 3. 创建 HOOK.md

```markdown
---
name: my-hook
description: "做有用的事情"
metadata: {"openclaw":{"emoji":"🎯","events":["command:new"]}}
---

# My Custom Hook

这个钩子在你发出 `/new` 时做有用的事情。
```

### 4. 创建 handler.ts

```typescript
import type { HookHandler } from '../../src/hooks/hooks.js';

const handler: HookHandler = async (event) => {
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  console.log('[my-hook] Running!');
  // 你的逻辑在这里
};

export default handler;
```

### 5. 启用和测试

```bash
# 验证钩子被发现
openclaw hooks list

# 启用它
openclaw hooks enable my-hook

# 重启你的 Gateway 进程（macOS 菜单栏应用重启，或重启你的开发进程）

# 触发事件
# 通过你的消息渠道发送 /new
```

## 配置

### 新配置格式（推荐）

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "session-memory": { "enabled": true },
        "command-logger": { "enabled": false }
      }
    }
  }
}
```

### 每个钩子的配置

钩子可以有自定义配置：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "my-hook": {
          "enabled": true,
          "env": {
            "MY_CUSTOM_VAR": "value"
          }
        }
      }
    }
  }
}
```

### 额外目录

从额外目录加载钩子：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "load": {
        "extraDirs": ["/path/to/more/hooks"]
      }
    }
  }
}
```

### 旧配置格式（仍支持）

旧配置格式仍向后兼容：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "command:new",
          "module": "./hooks/handlers/my-handler.ts",
          "export": "default"
        }
      ]
    }
  }
}
```

**迁移**：对新钩子使用基于发现的新系统。旧版处理程序在基于目录的钩子之后加载。

## CLI 命令

### 列出钩子

```bash
# 列出所有钩子
openclaw hooks list

# 只显示合格的钩子
openclaw hooks list --eligible

# 详细输出（显示缺失要求）
openclaw hooks list --verbose

# JSON 输出
openclaw hooks list --json
```

### 钩子信息

```bash
# 显示钩子的详细信息
openclaw hooks info session-memory

# JSON 输出
openclaw hooks info session-memory --json
```

### 检查资格

```bash
# 显示资格摘要
openclaw hooks check

# JSON 输出
openclaw hooks check --json
```

### 启用/禁用

```bash
# 启用钩子
openclaw hooks enable session-memory

# 禁用钩子
openclaw hooks disable command-logger
```

## 捆绑钩子

### session-memory

发出 `/new` 时保存会话上下文到记忆。

**事件**：`command:new`

**要求**：必须配置 `workspace.dir`

**输出**：`<workspace>/memory/YYYY-MM-DD-slug.md`（默认为 `~/.openclaw/workspace`）

**它做什么**：
1. 使用重置前的会话条目定位正确的记录
2. 提取最后 15 行对话
3. 使用 LLM 生成描述性文件名 slug
4. 保存会话元数据到日期化的记忆文件

**示例输出**：

```markdown
# Session: 2026-01-16 14:30:00 UTC

- **Session Key**: agent:main:main
- **Session ID**: abc123def456
- **Source**: telegram
```

**文件名示例**：
- `2026-01-16-vendor-pitch.md`
- `2026-01-16-api-design.md`
- `2026-01-16-1430.md`（slug 生成失败时的回退时间戳）

**启用**：

```bash
openclaw hooks enable session-memory
```

### command-logger

记录所有命令事件到集中审计文件。

**事件**：`command`

**要求**：无

**输出**：`~/.openclaw/logs/commands.log`

**它做什么**：
1. 捕获事件详情（命令操作、时间戳、会话键、发送者 ID、来源）
2. 以 JSONL 格式追加到日志文件
3. 在后台静默运行

**示例日志条目**：

```jsonl
{"timestamp":"2026-01-16T14:30:00.000Z","action":"new","sessionKey":"agent:main:main","senderId":"+1234567890","source":"telegram"}
{"timestamp":"2026-01-16T15:45:22.000Z","action":"stop","sessionKey":"agent:main:main","senderId":"user@example.com","source":"whatsapp"}
```

**查看日志**：

```bash
# 查看最近的命令
tail -n 20 ~/.openclaw/logs/commands.log

# 用 jq 美化打印
cat ~/.openclaw/logs/commands.log | jq .

# 按操作过滤
grep '"action":"new"' ~/.openclaw/logs/commands.log | jq .
```

**启用**：

```bash
openclaw hooks enable command-logger
```

### soul-evil

在清除窗口期间或随机机会将注入的 `SOUL.md` 内容替换为 `SOUL_EVIL.md`。

**事件**：`agent:bootstrap`

**文档**：[SOUL Evil 钩子](hooks/soul-evil.html)

**输出**：不写入文件；交换只在内存中发生。

**启用**：

```bash
openclaw hooks enable soul-evil
```

**配置**：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "soul-evil": {
          "enabled": true,
          "file": "SOUL_EVIL.md",
          "chance": 0.1,
          "purge": { "at": "21:00", "duration": "15m" }
        }
      }
    }
  }
}
```

### boot-md

Gateway 启动时运行 `BOOT.md`（频道启动后）。
必须启用内部钩子才能运行。

**事件**：`gateway:startup`

**要求**：必须配置 `workspace.dir`

**它做什么**：
1. 从工作空间读取 `BOOT.md`
2. 通过 Agent 运行器运行指令
3. 通过消息工具发送任何请求的出站消息

**启用**：

```bash
openclaw hooks enable boot-md
```

## 最佳实践

### 保持处理程序快速

钩子在命令处理期间运行。保持轻量：

```typescript
// ✓ 好的 - 异步工作，立即返回
const handler: HookHandler = async (event) => {
  void processInBackground(event); // 即发即弃
};

// ✗ 坏的 - 阻塞命令处理
const handler: HookHandler = async (event) => {
  await slowDatabaseQuery(event);
  await evenSlowerAPICall(event);
};
```

### 优雅地处理错误

始终包装有风险的操作：

```typescript
const handler: HookHandler = async (event) => {
  try {
    await riskyOperation(event);
  } catch (err) {
    console.error('[my-handler] Failed:', err instanceof Error ? err.message : String(err));
    // 不要抛出 - 让其他处理程序运行
  }
};
```

### 尽早过滤事件

如果事件不相关，尽早返回：

```typescript
const handler: HookHandler = async (event) => {
  // 只处理 'new' 命令
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  // 你的逻辑在这里
};
```

### 使用特定的事件键

在元数据中尽可能指定确切的事件：

```yaml
metadata: {"openclaw":{"events":["command:new"]}}  # 特定
```

而不是：

```yaml
metadata: {"openclaw":{"events":["command"]}}      # 通用 - 更多开销
```

## 调试

### 启用钩子日志

Gateway 在启动时记录钩子加载：

```
Registered hook: session-memory -> command:new
Registered hook: command-logger -> command
Registered hook: boot-md -> gateway:startup
```

### 检查发现

列出所有发现的钩子：

```bash
openclaw hooks list --verbose
```

### 检查注册

在处理程序中，记录何时被调用：

```typescript
const handler: HookHandler = async (event) => {
  console.log('[my-handler] Triggered:', event.type, event.action);
  // 你的逻辑
};
```

### 验证资格

检查为什么钩子不合格：

```bash
openclaw hooks info my-hook
```

在输出中查找缺失的要求。

## 测试

### Gateway 日志

监控 Gateway 日志查看钩子执行：

```bash
# macOS
./scripts/clawlog.sh -f

# 其他平台
tail -f ~/.openclaw/gateway.log
```

### 直接测试钩子

在隔离中测试你的处理程序：

```typescript
import { test } from 'vitest';
import { createHookEvent } from './src/hooks/hooks.js';
import myHandler from './hooks/my-hook/handler.js';

test('my handler works', async () => {
  const event = createHookEvent('command', 'new', 'test-session', {
    foo: 'bar'
  });

  await myHandler(event);

  // 断言副作用
});
```

## 架构

### 核心组件

- **`src/hooks/types.ts`**：类型定义
- **`src/hooks/workspace.ts`**：目录扫描和加载
- **`src/hooks/frontmatter.ts`**：HOOK.md 元数据解析
- **`src/hooks/config.ts`**：资格检查
- **`src/hooks/hooks-status.ts`**：状态报告
- **`src/hooks/loader.ts`**：动态模块加载器
- **`src/cli/hooks-cli.ts`**：CLI 命令
- **`src/gateway/server-startup.ts`**：Gateway 启动时加载钩子
- **`src/auto-reply/reply/commands-core.ts`**：触发命令事件

### 发现流程

```
Gateway 启动
    ↓
扫描目录（工作空间 → 托管 → 捆绑）
    ↓
解析 HOOK.md 文件
    ↓
检查资格（二进制文件、环境、配置、操作系统）
    ↓
从合格钩子加载处理程序
    ↓
为事件注册处理程序
```

### 事件流程

```
用户发送 /new
    ↓
命令验证
    ↓
创建钩子事件
    ↓
触发钩子（所有注册的处理程序）
    ↓
命令处理继续
    ↓
会话重置
```

## 故障排除

### 钩子未被发现

1. 检查目录结构：
   ```bash
   ls -la ~/.openclaw/hooks/my-hook/
   # 应该显示：HOOK.md, handler.ts
   ```

2. 验证 HOOK.md 格式：
   ```bash
   cat ~/.openclaw/hooks/my-hook/HOOK.md
   # 应该有带 name 和 metadata 的 YAML frontmatter
   ```

3. 列出所有发现的钩子：
   ```bash
   openclaw hooks list
   ```

### 钩子不合格

检查要求：

```bash
openclaw hooks info my-hook
```

查找缺失的：
- 二进制文件（检查 PATH）
- 环境变量
- 配置值
- 操作系统兼容性

### 钩子未执行

1. 验证钩子已启用：
   ```bash
   openclaw hooks list
   # 应该显示已启用钩子旁边的 ✓
   ```

2. 重启你的 Gateway 进程，以便钩子重新加载。

3. 检查 Gateway 日志中的错误：
   ```bash
   ./scripts/clawlog.sh | grep hook
   ```

### 处理程序错误

检查 TypeScript/导入错误：

```bash
# 直接测试导入
node -e "import('./path/to/handler.ts').then(console.log)"
```

## 迁移指南

### 从旧配置迁移到发现

**之前**：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "command:new",
          "module": "./hooks/handlers/my-handler.ts"
        }
      ]
    }
  }
}
```

**之后**：

1. 创建钩子目录：
   ```bash
   mkdir -p ~/.openclaw/hooks/my-hook
   mv ./hooks/handlers/my-handler.ts ~/.openclaw/hooks/my-hook/handler.ts
   ```

2. 创建 HOOK.md：
   ```markdown
   ---
   name: my-hook
   description: "My custom hook"
   metadata: {"openclaw":{"emoji":"🎯","events":["command:new"]}}
   ---

   # My Hook

   做有用的事情。
   ```

3. 更新配置：
   ```json
   {
     "hooks": {
       "internal": {
         "enabled": true,
         "entries": {
           "my-hook": { "enabled": true }
         }
       }
     }
   }
   ```

4. 验证并重启你的 Gateway 进程：
   ```bash
   openclaw hooks list
   # 应该显示：🎯 my-hook ✓
   ```

**迁移的好处**：
- 自动发现
- CLI 管理
- 资格检查
- 更好的文档
- 一致的结构

## 另见

- [CLI 参考：hooks](cli/hooks.html)
- [捆绑钩子 README](https://github.com/openclaw/openclaw/tree/main/src/hooks/bundled)
- [Webhook 钩子](automation/webhook.html)
- [配置](gateway/configuration#hooks.html)
