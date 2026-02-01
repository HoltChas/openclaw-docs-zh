---
summary: "web_search 的 Perplexity Sonar 设置"
read_when:
  - 你想为网页搜索使用 Perplexity Sonar
  - 你需要 PERPLEXITY_API_KEY 或 OpenRouter 设置
---

# Perplexity Sonar

OpenClaw 可以将 Perplexity Sonar 用于 `web_search` 工具。你可以通过 Perplexity 的直接 API 或 OpenRouter 连接。

## API 选项

### Perplexity（直接）

- Base URL: https://api.perplexity.ai
- 环境变量: `PERPLEXITY_API_KEY`

### OpenRouter（替代）

- Base URL: https://openrouter.ai/api/v1
- 环境变量: `OPENROUTER_API_KEY`
- 支持预付/加密信用。

## 配置示例

```json5
{
  tools: {
    web: {
      search: {
        provider: "perplexity",
        perplexity: {
          apiKey: "pplx-...",
          baseUrl: "https://api.perplexity.ai",
          model: "perplexity/sonar-pro"
        }
      }
    }
  }
}
```

## 从 Brave 切换

```json5
{
  tools: {
    web: {
      search: {
        provider: "perplexity",
        perplexity: {
          apiKey: "pplx-...",
          baseUrl: "https://api.perplexity.ai"
        }
      }
    }
  }
}
```

如果同时设置了 `PERPLEXITY_API_KEY` 和 `OPENROUTER_API_KEY`，设置
`tools.web.search.perplexity.baseUrl`（或 `tools.web.search.perplexity.apiKey`）
来消除歧义。

如果没有设置 base URL，OpenClaw 根据 API 密钥源选择默认值：

- `PERPLEXITY_API_KEY` 或 `pplx-...` → 直接 Perplexity (`https://api.perplexity.ai`)
- `OPENROUTER_API_KEY` 或 `sk-or-...` → OpenRouter (`https://openrouter.ai/api/v1`)
- 未知密钥格式 → OpenRouter（安全回退）

## 模型

- `perplexity/sonar` — 快速问答 + 网页搜索
- `perplexity/sonar-pro`（默认）— 多步推理 + 网页搜索
- `perplexity/sonar-reasoning-pro` — 深度研究

完整 `web_search` 配置参见 [Web 工具](tools/web.html)。
