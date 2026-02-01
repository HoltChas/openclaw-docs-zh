---
summary: "web_search 的 Brave Search API 设置"
read_when:
  - 你想为 web_search 使用 Brave Search
  - 你需要 BRAVE_API_KEY 或计划详情
---

# Brave Search API

OpenClaw 使用 Brave Search 作为 `web_search` 的默认提供者。

## 获取 API 密钥

1) 在 https://brave.com/search/api/ 创建 Brave Search API 账户
2) 在仪表板中，选择 **Data for Search** 计划并生成 API 密钥
3) 将密钥存储在配置中（推荐）或在 Gateway 环境中设置 `BRAVE_API_KEY`

## 配置示例

```json5
{
  tools: {
    web: {
      search: {
        provider: "brave",
        apiKey: "BRAVE_API_KEY_HERE",
        maxResults: 5,
        timeoutSeconds: 30
      }
    }
  }
}
```

## 备注

- Data for AI 计划**不兼容** `web_search`
- Brave 提供免费套餐和付费计划；查看 Brave API 门户了解当前限制

完整 `web_search` 配置参见 [Web 工具](tools/web.html)。
