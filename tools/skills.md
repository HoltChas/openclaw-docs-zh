---
summary: "技能：托管 vs 工作区、门控规则和配置/环境接线"
read_when:
  - 添加或修改技能
  - 更改技能门控或加载规则
---
# 技能 (OpenClaw)

OpenClaw 使用 **[AgentSkills](https://agentskills.io) 兼容**的技能文件夹来教 Agent 如何使用工具。每个技能是一个包含带有 YAML 前置事项和说明的 `SKILL.md` 的目录。OpenClaw 加载**捆绑技能**加上可选的本地覆盖，并根据环境、配置和二进制存在性在加载时过滤它们。

## 位置和优先级

技能从 **三个** 地方加载：

1) **捆绑技能**：随安装一起发布（npm 包或 OpenClaw.app）
2) **托管/本地技能**：`~/.openclaw/skills`
3) **工作区技能**：`<workspace>/skills`

如果技能名称冲突，优先级为：

`<workspace>/skills`（最高） → `~/.openclaw/skills` → 捆绑技能（最低）

此外，你可以通过 `~/.openclaw/openclaw.json` 中的 `skills.load.extraDirs` 配置额外的技能文件夹（最低优先级）。

## 每个 Agent vs 共享技能

在 **多 Agent** 设置中，每个 Agent 有自己的工作区。这意味着：

- **每个 Agent 的技能**存在于该 Agent 的 `<workspace>/skills` 中。
- **共享技能**存在于 `~/.openclaw/skills`（托管/本地），对同一机器上的 **所有 Agent** 可见。
- **共享文件夹**也可以通过 `skills.load.extraDirs` 添加（最低优先级），如果你想让多个 Agent 使用一个共同的技能包。

如果同一名称的技能存在于多个地方，应用通常的优先级规则：工作区获胜，然后是托管/本地，最后是捆绑。

## 插件 + 技能

插件可以通过在 `openclaw.plugin.json` 中列出 `skills` 目录来提供自己的技能（路径相对于插件根）。插件技能在插件启用时加载，并参与正常的技能优先级规则。
你可以通过插件配置条目上的 `metadata.openclaw.requires.config` 来门控它们。参见 [插件](../plugin.html) 了解发现/配置，参见 [工具](/tools) 了解这些技能教的工具表面。

## ClawdHub（安装 + 同步）

ClawdHub 是 OpenClaw 的公共技能注册表。在 https://clawdhub.com 浏览。用它来发现、安装、更新和备份技能。
完整指南：[ClawdHub(../tools/clawdhub.html)。

常见流程：

- 安装技能到工作区：
  - `clawdhub install <skill-slug>`
- 更新所有已安装技能：
  - `clawdhub update --all`
- 同步（扫描 + 发布更新）：
  - `clawdhub sync --all`

默认情况下，`clawdhub` 安装到当前工作目录下的 `./skills`（或回退到配置的 OpenClaw 工作区）。OpenClaw 在下一次会话中将其作为 `<workspace>/skills` 获取。

## 安全说明

- 将第三方技能视为 **可信代码**。启用前阅读它们。
- 对不可信输入和风险工具优先使用沙盒运行。参见 [沙盒化(../gateway/sandboxing.html)。
- `skills.entries.*.env` 和 `skills.entries.*.apiKey` 将 secrets 注入 **主机** 进程
  用于该 Agent 轮次（非沙盒）。保持 secrets 不在提示和日志中。
- 更广泛的威胁模型和检查表，参见 [安全(../gateway/security.html)。

## 格式 (AgentSkills + Pi 兼容)

`SKILL.md` 必须至少包含：

```markdown
---
name: nano-banana-pro
description: 通过 Gemini 3 Pro Image 生成或编辑图像
---
```

说明：
- 我们遵循 AgentSkills 规范布局/意图。
- 嵌入式 Agent 使用的解析器支持 **单行** 前置事项键。
- `metadata` 应该是 **单行** JSON 对象。
- 在说明中使用 `{baseDir}` 引用技能文件夹路径。
- 可选前置事项键：
  - `homepage` — 在 macOS 技能 UI 中显示为"网站"的 URL（也可通过 `metadata.openclaw.homepage` 支持）。
  - `user-invocable` — `true|false`（默认：`true`）。为 `true` 时，技能作为用户斜杠命令暴露。
  - `disable-model-invocation` — `true|false`（默认：`false`）。为 `true` 时，技能从模型提示中排除（仍可通过用户调用可用）。
  - `command-dispatch` — `tool`（可选）。设置为 `tool` 时，斜杠命令绕过模型直接调度到工具。
  - `command-tool` — 当设置 `command-dispatch: tool` 时调用的工具名称。
  - `command-arg-mode` — `raw`（默认）。用于工具调度，将原始参数字符串转发给工具（无核心解析）。

    工具以参数调用：
    `{ command: "<raw args>", commandName: "<slash command>", skillName: "<skill name>" }`。

## 门控（加载时过滤器）

OpenClaw 在加载时使用 `metadata`（单行 JSON）**过滤技能**：

```markdown
---
name: nano-banana-pro
description: 通过 Gemini 3 Pro Image 生成或编辑图像
metadata: {"openclaw":{"requires":{"bins":["uv"],"env":["GEMINI_API_KEY"],"config":["browser.enabled"]},"primaryEnv":"GEMINI_API_KEY"}}
---
```

`metadata.openclaw` 下的字段：
- `always: true` — 始终包含该技能（跳过其他门控）。
- `emoji` — macOS 技能 UI 使用的可选表情符号。
- `homepage` — macOS 技能 UI 中显示为"网站"的可选 URL。
- `os` — 可选平台列表（`darwin`、`linux`、`win32`）。如果设置，技能仅在这些 OS 上有效。
- `requires.bins` — 列表；每个必须在 `PATH` 上存在。
- `requires.anyBins` — 列表；至少一个必须在 `PATH` 上存在。
- `requires.env` — 列表；环境变量必须存在 **或** 在配置中提供。
- `requires.config` — 必须 truthy 的 `openclaw.json` 路径列表。
- `primaryEnv` — 与 `skills.entries.<name>.apiKey` 关联的环境变量名。
- `install` — macOS 技能 UI 使用的可选安装程序规范数组（brew/node/go/uv/download）。

关于沙盒化的说明：
- `requires.bins` 在技能加载时在 **主机** 上检查。
- 如果 Agent 被沙盒化，二进制文件也必须存在于 **容器** 内部。
  通过 `agents.defaults.sandbox.docker.setupCommand`（或自定义镜像）安装它。
  `setupCommand` 在容器创建后运行一次。
  包安装还需要沙盒中的网络出口、可写根文件系统和 root 用户。
  示例：`summarize` 技能（`skills/summarize/SKILL.md`）需要 `summarize` CLI
  在沙盒容器中运行。

安装程序示例：

```markdown
---
name: gemini
description: 使用 Gemini CLI 进行编码协助和 Google 搜索查找。
metadata: {"openclaw":{"emoji":"♊️","requires":{"bins":["gemini"]},"install":[{"id":"brew","kind":"brew","formula":"gemini-cli","bins":["gemini"],"label":"安装 Gemini CLI (brew)"}]}}
---
```

说明：
- 如果列出多个安装程序，Gateway 选择 **单个** 首选选项（如果可用则选 brew，否则 node）。
- 如果所有安装程序都是 `download`，OpenClaw 列出每个条目以便查看可用的工件。
- 安装程序规范可以包含 `os: ["darwin"|"linux"|"win32"]` 按平台过滤选项。
- Node 安装遵守 `openclaw.json` 中的 `skills.install.nodeManager`（默认：npm；选项：npm/pnpm/yarn/bun）。
  这只影响 **技能安装**；Gateway 运行时仍应该是 Node
  （Bun 不推荐用于 WhatsApp/Telegram）。
- Go 安装：如果缺少 `go` 且 `brew` 可用，Gateway 先通过 Homebrew 安装 Go，并在可能时将 `GOBIN` 设置为 Homebrew 的 `bin`。
 - 下载安装：`url`（必需）、`archive`（`tar.gz` | `tar.bz2` | `zip`）、`extract`（默认：检测到存档时自动）、`stripComponents`、`targetDir`（默认：`~/.openclaw/tools/<skillKey>`）。

如果没有 `metadata.openclaw`，技能始终有效（除非在配置中禁用或被 `skills.allowBundled` 阻止用于捆绑技能）。

## 配置覆盖 (`~/.openclaw/openclaw.json`)

可以切换捆绑/托管技能并为其提供环境值：

```json5
{
  skills: {
    entries: {
      "nano-banana-pro": {
        enabled: true,
        apiKey: "GEMINI_KEY_HERE",
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE"
        },
        config: {
          endpoint: "https://example.invalid",
          model: "nano-pro"
        }
      },
      peekaboo: { enabled: true },
      sag: { enabled: false }
    }
  }
}
```

注意：如果技能名称包含连字符，引用键（JSON5 允许引用键）。

配置键默认匹配 **技能名称**。如果技能定义了 `metadata.openclaw.skillKey`，使用 `skills.entries` 下的该键。

规则：
- `enabled: false` 禁用技能，即使它是捆绑/已安装的。
- `env`：仅当进程中的变量尚未设置时注入。
- `apiKey`：声明 `metadata.openclaw.primaryEnv` 的技能的便利选项。
- `config`：自定义每个技能字段的可选包；自定义键必须住在这里。
- `allowBundled`：仅 **捆绑** 技能的可选允许列表。如果设置，仅列表中的捆绑技能有效（托管/工作区技能不受影响）。

## 环境注入（每个 Agent 运行）

当 Agent 运行开始时，OpenClaw：
1) 读取技能元数据。
2) 应用任何 `skills.entries.<key>.env` 或 `skills.entries.<key>.apiKey` 到
   `process.env`。
3) 用 **有效** 技能构建系统提示。
4) 运行结束后恢复原始环境。

这 **限定于 Agent 运行**，不是全局 shell 环境。

## 会话快照（性能）

OpenClaw 在会话开始时快照有效技能，并在同一会话的后续轮次中重用该列表。技能或配置的更改在下一次新会话时生效。

当启用技能监视器或新的有效远程节点出现时，技能也可以在会话中刷新（见下文）。将其视为 **热重载**：刷新的列表在下一次 Agent 轮次中获取。

## 远程 macOS 节点（Linux Gateway）

如果 Gateway 在 Linux 上运行，但 **macOS 节点** 已连接 **且允许 `system.run`**（Exec 批准安全未设置为 `deny`），当所需二进制文件存在于该节点上时，OpenClaw 可以将仅限 macOS 的技能视为有效。Agent 应该通过 `nodes` 工具执行这些技能（通常是 `nodes.run`）。

这依赖于节点报告其命令支持和通过 `system.run` 的二进制探测。如果 macOS 节点稍后离线，技能仍然可见；调用可能失败直到节点重新连接。

## 技能监视器（自动刷新）

默认情况下，OpenClaw 监视技能文件夹并在 `SKILL.md` 文件更改时更新技能快照。在 `skills.load` 下配置：

```json5
{
  skills: {
    load: {
      watch: true,
      watchDebounceMs: 250
    }
  }
}
```

## 令牌影响（技能列表）

当技能有效时，OpenClaw 将可用技能的紧凑 XML 列表注入系统提示（通过 `pi-coding-agent` 中的 `formatSkillsForPrompt`）。成本是确定的：

- **基础开销（仅当 ≥1 技能时）：** 195 字符。
- **每个技能：** 97 字符 + XML 转义的 `<name>`、`<description>` 和 `<location>` 值的长度。

公式（字符）：

```
total = 195 + Σ (97 + len(name_escaped) + len(description_escaped) + len(location_escaped))
```

说明：
- XML 转义将 `& < > " '` 扩展为实体（`&amp;`、`&lt;` 等），增加长度。
- 令牌计数因模型分词器而异。粗略的 OpenAI 风格估计是 ~4 字符/令牌，所以 **97 字符 ≈ 24 令牌** 每个技能加上实际字段长度。

## 托管技能生命周期

OpenClaw 将一组基线技能作为 **捆绑技能** 随安装一起发布（npm 包或 OpenClaw.app）。`~/.openclaw/skills` 存在用于本地覆盖（例如，固定/修补技能而不更改捆绑副本）。工作区技能是用户拥有的，在名称冲突时覆盖两者。

## 配置参考

参见 [技能配置(../tools/skills-config.html) 了解完整配置模式。

## 寻找更多技能？

浏览 https://clawdhub.com。