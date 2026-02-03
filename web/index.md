---
summary: "Web 界面概述"
read_when:
  - 你想了解 Gateway 的 Web 界面
  - 你需要配置 Control UI
  - 你在设置远程访问
---

# Web（Gateway）

Gateway 提供基于浏览器的 Control UI，使用 Vite 和 Lit 构建，在与 Gateway WebSocket 相同的端口上提供服务。默认地址是 `http://<host>:18789/`，可选配置基础路径。

## 关键部分

### Webhooks
启用钩子后，Gateway 在同一 HTTP 服务器上暴露 webhook 端点。配置详情请参阅 Gateway 配置文档。

### 配置
Control UI"在资源存在时默认启用"。你可以配置：
- `gateway.controlUi.enabled`：开关切换
- `gateway.controlUi.basePath`：可选 URL 前缀（例如 `/openclaw`）

### Tailscale 访问选项

**1. 集成 Serve（推荐）：** 保持 Gateway 在回环地址，同时 Tailscale Serve 代理它。使用 `bind: "loopback"` 配合 `tailscale: { mode: "serve" }`。

**2. Tailnet 绑定 + 令牌：** 直接绑定到 tailnet，使用令牌认证。使用 `bind: "tailnet"` 配合显式认证令牌。

**3. 公共互联网（Funnel）：** 通过 Tailscale Funnel 暴露，需要密码认证。

### 安全说明

关键安全注意事项包括：
- Gateway 认证默认必需
- "非回环绑定仍然**需要**共享令牌/密码"
- 设置向导默认生成 gateway 令牌
- Funnel 模式特别需要密码认证
- 当 `allowTailscale` 为 true 时，Tailscale 身份头可以满足认证

### 构建 UI

静态文件从 `dist/control-ui` 提供，可以使用 `pnpm ui:build` 构建，首次运行时自动安装依赖。
