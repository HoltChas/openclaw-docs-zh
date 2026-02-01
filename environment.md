---
summary: "OpenClaw 加载环境变量的位置和优先级顺序"
read_when:
  - 你需要知道加载了哪些环境变量，以及它们的顺序
  - 你在调试 Gateway 中缺失的 API 密钥
  - 你在编写提供者认证或部署环境的文档
---
# 环境变量

OpenClaw 从多个来源提取环境变量。规则是**绝不覆盖现有值**。

## 优先级（从高到低）

1) **进程环境**（Gateway 进程从父 shell/守护进程已经拥有的）
2) **当前工作目录中的 `.env`**（dotenv 默认；不覆盖）
3) **`~/.openclaw/.env` 的全局 `.env`**（即 `$OPENCLAW_STATE_DIR/.env`；不覆盖）
4) **`~/.openclaw/openclaw.json` 中的配置 `env` 块**（仅在缺失时应用）
5) **可选的登录 shell 导入**（`env.shellEnv.enabled` 或 `OPENCLAW_LOAD_SHELL_ENV=1`），仅对缺失的预期键应用

如果配置文件完全缺失，跳过第 4 步；如果启用，shell 导入仍会运行。

## 配置 `env` 块

两种等效的方式设置内联环境变量（都是不覆盖的）：

```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: {
      GROQ_API_KEY: "gsk-..."
    }
  }
}
```

## Shell 环境导入

`env.shellEnv` 运行你的登录 shell 并仅导入**缺失**的预期键：

```json5
{
  env: {
    shellEnv: {
      enabled: true,
      timeoutMs: 15000
    }
  }
}
```

环境变量等效项：
- `OPENCLAW_LOAD_SHELL_ENV=1`
- `OPENCLAW_SHELL_ENV_TIMEOUT_MS=15000`

## 配置中的环境变量替换

你可以在配置字符串值中直接使用 `${VAR_NAME}` 语法引用环境变量：

```json5
{
  models: {
    providers: {
      "vercel-gateway": {
        apiKey: "${VERCEL_GATEWAY_API_KEY}"
      }
    }
  }
}
```

完整详情参见 [配置：配置中的环境变量替换](/gateway/configuration#env-var-substitution-in-config)。

## 相关文档

- [Gateway 配置](/gateway/configuration)
- [FAQ：环境变量和 .env 加载](/help/faq#env-vars-and-env-loading)
- [模型概览](/concepts/models)
