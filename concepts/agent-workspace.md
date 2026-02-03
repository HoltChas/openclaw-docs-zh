---
summary: "Agent 工作区配置和管理"
read_when:
  - 你想了解工作区的作用和结构
  - 你需要配置或迁移工作区
  - 你在设置引导文件
---

# Agent 工作区

工作区是 Agent 用于文件工具和上下文的主要工作目录。它被描述为"Agent 的家"，应被视为私有记忆。这与处理配置、凭据和会话的 `~/.openclaw/` 不同。

**重要说明：** 工作区是"默认 cwd，而非硬沙箱"。除非明确启用沙箱，否则绝对路径可以访问其他主机位置。

## 默认位置

- 标准路径：`~/.openclaw/workspace`
- 当设置 `OPENCLAW_PROFILE`（且不是"default"）时，变为 `~/.openclaw/workspace-<profile>`
- 可通过 `~/.openclaw/openclaw.json` 中的 `agent.workspace` 设置配置
- 可通过 `agent: { skipBootstrap: true }` 禁用引导文件创建

## 工作区文件结构

**每次会话加载的核心文件：**
- **AGENTS.md** - 操作指令、规则和行为准则
- **SOUL.md** - 人格、语气和边界
- **USER.md** - 用户身份和称呼偏好
- **IDENTITY.md** - Agent 名称、风格和表情符号（引导期间创建）
- **TOOLS.md** - 本地工具说明和约定（仅供指导）

**可选文件：**
- **HEARTBEAT.md** - 心跳运行的简短检查清单
- **BOOT.md** - Gateway 重启的启动检查清单
- **BOOTSTRAP.md** - 一次性首次运行仪式（完成后删除）
- **memory/YYYY-MM-DD.md** - 每日记忆日志
- **MEMORY.md** - 精心整理的长期记忆（仅私人会话）
- **skills/** - 工作区特定技能，覆盖内置技能
- **canvas/** - 节点显示的 UI 文件

引导文件默认截断为 20,000 字符（可通过 `agents.defaults.bootstrapMaxChars` 调整）。

## 不在工作区中的内容

以下内容属于 `~/.openclaw/`，不应进行版本控制：
- 配置文件（`openclaw.json`）
- 凭据目录
- 会话记录和元数据
- 托管技能

## Git 备份建议

文档强烈建议将工作区备份到**私有** git 仓库。

**设置步骤：**
1. 在工作区目录中使用 `git init` 初始化
2. 添加私有远程仓库（GitHub、GitLab 或通过 GitHub CLI）
3. 定期提交和推送

## 安全注意事项

即使在私有仓库中，也要避免提交：
- API 密钥、OAuth 令牌、密码
- `~/.openclaw/` 中的任何内容
- 敏感的聊天记录或附件

建议的 `.gitignore` 条目包括 `.DS_Store`、`.env`、`**/*.key`、`**/*.pem` 和 `**/secrets*`。

## 迁移到新机器

1. 将仓库克隆到目标路径
2. 更新配置中的 `agents.defaults.workspace`
3. 运行 `openclaw setup --workspace <path>`
4. 如需要，手动复制会话

## 高级功能

- 多 Agent 路由支持每个 Agent 使用不同的工作区
- 沙箱模式可以在 `agents.defaults.sandbox.workspaceRoot` 下使用每会话工作区
