---
summary: "模型提供者"
read_when:
  - 你想了解支持哪些 LLM 提供者
  - 你需要配置模型认证
  - 你在选择模型提供者
---

# 模型提供者

OpenClaw 支持多个 LLM 提供者。设置过程包括选择提供者、认证和使用 `provider/model` 格式配置默认模型。

## 推荐提供者：Venice AI
Venice 被强调为"隐私优先推理的推荐 Venice AI 设置"。文档列出两个模型选项：
- **默认**：`venice/llama-3.3-70b`
- **最佳整体**：`venice/claude-opus-45`（被标注为最强选项）

## 快速开始流程
设置需要两个步骤：
1. 通过 `openclaw onboard` 认证
2. 在设置中配置默认模型

**配置示例：**
```json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-5" } } },
}
```

## 支持的提供者（入门集）
文档列出入门集中的 12 个提供者：
- OpenAI（API + Codex）
- Anthropic（API + Claude Code CLI）
- OpenRouter
- Vercel AI Gateway
- Moonshot AI（Kimi + Kimi Coding）
- Synthetic
- OpenCode Zen
- Z.AI
- GLM 模型
- MiniMax
- Venice（Venice AI）
- Amazon Bedrock

## 附加资源
完整文档索引可在 `https://docs.openclaw.ai/llms.txt` 获取。对于 xAI、Groq 和 Mistral 等其他提供者，以及高级配置选项，用户可参阅完整的模型提供者概念页面。
