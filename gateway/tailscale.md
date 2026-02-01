---
summary: "为 Gateway 控制台集成 Tailscale Serve/Funnel"
read_when:
  - 在 localhost 之外暴露 Gateway Control UI
  - 自动化 tailnet 或公共控制台访问
---
# Tailscale（Gateway 控制台）

OpenClaw 可以自动配置 Tailscale **Serve**（tailnet）或 **Funnel**（公共）用于 Gateway 控制台和 WebSocket 端口。
这样 Gateway 可以继续绑定 loopback，而由 Tailscale 提供 HTTPS、路由以及（Serve 下）身份 header。

## 模式

- `serve`：使用 `tailscale serve` 的 tailnet 内 Serve。Gateway 仍绑定 `127.0.0.1`。
- `funnel`：使用 `tailscale funnel` 的公共 HTTPS。OpenClaw 要求共享密码。
- `off`：默认（不自动配置 Tailscale）。

## 认证

设置 `gateway.auth.mode` 控制握手：

- `token`（当设置了 `OPENCLAW_GATEWAY_TOKEN` 时默认）
- `password`（通过 `OPENCLAW_GATEWAY_PASSWORD` 或配置共享密钥）

当 `tailscale.mode = "serve"` 且 `gateway.auth.allowTailscale` 为 `true` 时，
有效的 Serve 代理请求可通过 Tailscale 身份 header
（`tailscale-user-login`）进行认证，而无需 token/密码。OpenClaw 会通过本地 Tailscale
守护进程（`tailscale whois`）解析 `x-forwarded-for` 地址并与 header 匹配，确认身份后接受。
OpenClaw 只在请求来自 loopback 且包含 Tailscale 的 `x-forwarded-for`、`x-forwarded-proto`、`x-forwarded-host` 时视为 Serve。
要强制显式凭证，设置 `gateway.auth.allowTailscale: false` 或强制 `gateway.auth.mode: "password"`。

## 配置示例

### 仅 tailnet（Serve）

```json5
{
  gateway: {
    bind: "loopback", // 中文注释：Gateway 仍只监听本地
    tailscale: { mode: "serve" }
  }
}
```

访问：`https://<magicdns>/`（或你设置的 `gateway.controlUi.basePath`）

### 仅 tailnet（绑定 Tailnet IP）

当你想让 Gateway 直接监听 Tailnet IP（无需 Serve/Funnel）时使用：

```json5
{
  gateway: {
    bind: "tailnet",
    auth: { mode: "token", token: "your-token" }
  }
}
```

从另一台 Tailnet 设备连接：
- 控制台：`http://<tailscale-ip>:18789/`
- WebSocket：`ws://<tailscale-ip>:18789`

注意：loopback（`http://127.0.0.1:18789`）在此模式下 **不可用**。

### 公网（Funnel + 共享密码）

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "funnel" },
    auth: { mode: "password", password: "replace-me" }
  }
}
```

建议使用 `OPENCLAW_GATEWAY_PASSWORD`，不要把密码写进磁盘。

## CLI 示例

```bash
openclaw gateway --tailscale serve # 中文注释：使用 Tailnet Serve
openclaw gateway --tailscale funnel --auth password # 中文注释：使用 Funnel + 密码认证
```

## 说明

- Tailscale Serve/Funnel 需要安装并登录 `tailscale` CLI。
- `tailscale.mode: "funnel"` 会拒绝启动，除非认证模式是 `password`，以避免公开暴露。
- 设置 `gateway.tailscale.resetOnExit` 让 OpenClaw 在关闭时撤销 `tailscale serve`
  或 `tailscale funnel` 配置。
- `gateway.bind: "tailnet"` 是直接绑定 Tailnet（无 HTTPS、无 Serve/Funnel）。
- `gateway.bind: "auto"` 优先 loopback；若想仅 tailnet，请用 `tailnet`。
- Serve/Funnel 只暴露 **Gateway 控制台 + WS**。节点连接也使用同一 WS 端点，因此 Serve 可用于节点访问。

## 浏览器控制（远程 Gateway + 本地浏览器）

如果 Gateway 在一台机器上运行，但你想在另一台机器上控制浏览器，
在浏览器机器上运行 **节点主机** 并保持两台设备在同一 tailnet。
Gateway 会把浏览器动作代理到节点；不需要单独的控制服务器或 Serve URL。

避免对浏览器控制使用 Funnel；把节点配对当作操作员访问。

## Tailscale 前置条件 + 限制

- Serve 需要 Tailnet 启用 HTTPS；CLI 会在缺失时提示。
- Serve 注入 Tailscale 身份 header；Funnel 不注入。
- Funnel 需要 Tailscale v1.38.3+、MagicDNS、启用 HTTPS、以及 funnel 节点属性。
- Funnel 仅支持 `443`、`8443`、`10000` 端口的 TLS。
- macOS 上 Funnel 需要开源版本的 Tailscale 应用。

## 了解更多

- Tailscale Serve 概览：https://tailscale.com/kb/1312/serve
- `tailscale serve` 命令：https://tailscale.com/kb/1242/tailscale-serve
- Tailscale Funnel 概览：https://tailscale.com/kb/1223/tailscale-funnel
- `tailscale funnel` 命令：https://tailscale.com/kb/1311/tailscale-funnel
