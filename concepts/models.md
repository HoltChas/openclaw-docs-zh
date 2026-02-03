---
summary: "模型选择和配置"
read_when:
  - 你想了解如何配置和切换模型
  - 你需要设置模型允许列表
  - 你在调试模型选择问题
---

# 模型

## 模型选择顺序

OpenClaw 按以下优先级选择模型：
1. **主模型**（通过 `agents.defaults.model.primary` 配置）
2. **回退列表**中的 `agents.defaults.model.fallbacks`（按顺序处理）
3. **提供者认证回退**在移动到下一个模型之前在提供者内部发生

`agents.defaults.models` 配置作为允许列表/目录，而 `agents.defaults.imageModel` 仅在主模型无法处理图像时使用。

## 设置

推荐的方法是运行 `openclaw onboard` 来配置常见提供者（包括 OpenAI Code (Codex) 和 Anthropic）的模型和认证。

## 关键配置选项

- `agents.defaults.model.primary` 和 `.fallbacks` 用于文本模型
- `agents.defaults.imageModel.primary` 和 `.fallbacks` 用于图像处理
- `agents.defaults.models` 用于带别名的允许列表
- `models.providers` 用于自定义提供者定义

模型引用被标准化为小写，提供者别名如 `z.ai/*` 变为 `zai/*`。

## 允许列表行为

当配置了 `agents.defaults.models` 时，它会限制可用模型。选择未列出的模型会返回错误消息并阻止响应。解决方案包括将模型添加到允许列表、完全清除它，或从 `/model list` 中选择。

## 会话内模型切换

会话期间可用的命令：
- `/model` 或 `/model list` - 显示编号选择器
- `/model <number>` - 从选择器中选择
- `/model provider/model` - 直接选择
- `/model status` - 详细的认证和端点视图

## CLI 命令

核心命令包括 `openclaw models list`、`models status`、`models set <provider/model>` 和 `models set-image`。其他子命令管理别名和回退（list、add、remove、clear 操作）。

`models list` 命令支持标志：`--all`、`--local`、`--provider <name>`、`--plain` 和 `--json`。

`models status` 命令显示解析的模型、认证概览和 OAuth 过期警告。使用 `--check` 进行自动化，带有特定退出码。

## OpenRouter 扫描

`openclaw models scan` 命令检查 OpenRouter 的免费模型，可选探测工具/图像支持。结果按图像支持、工具延迟、上下文大小和参数数量排名。

## 模型注册表

自定义提供者存储在 Agent 目录下的 `models.json` 中（默认：`~/.openclaw/agents/<agentId>/models.json`），除非 `models.mode` 设置为 `replace`，否则会合并。
