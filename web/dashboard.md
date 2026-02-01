---
summary: "Gateway Dashboard（Control UI）访问和认证"
read_when:
  - 更改 Dashboard 认证或暴露模式
---
# Dashboard（Control UI）

Gateway Dashboard 是浏览器 Control UI，默认在 `/` 提供
（使用 `gateway.controlUi.basePath` 覆盖）。

快速打开（本地 Gateway）：
- http://127.0.0.1:18789/（或 http://localhost:18789/）

关键参考：
- [Control UI(../web/control-ui.html) 了解使用和 UI 功能。
- [Tailscale(../gateway/tailscale.html) 了解 Serve/Funnel 自动化。
- [Web 界面](../web/index.html) 了解绑定模式和安全说明。

认证通过 `connect.params.auth`（token 或密码）在 WebSocket 握手时强制执行。参见 `gateway.auth` 在 [Gateway 配置(../gateway/configuration.html)。

安全注意：Control UI 是**管理界面**（聊天、配置、执行批准）。
不要公开暴露它。UI 在首次加载后将 token 存储在 `localStorage` 中。
优先选择 localhost、Tailscale Serve 或 SSH 隧道。

## 快速路径（推荐）

- 配置后，CLI 现在会用你的 token 自动打开 Dashboard 并打印相同的带 token 链接。
- 随时重新打开：`openclaw dashboard`（复制链接，如果可能则打开浏览器，如果无头则显示 SSH 提示）。
- Token 保持本地（仅限查询参数）；UI 在首次加载后剥离它并保存在 localStorage 中。

## Token 基础（本地 vs 远程）

- **本地主机**：打开 `http://127.0.0.1:18789/`。如果你看到"未授权"，运行 `openclaw dashboard` 并使用带 token 的链接（`?token=...`）。
- **Token 来源**：`gateway.auth.token`（或 `OPENCLAW_GATEWAY_TOKEN`）；UI 在首次加载后存储它。
- **非本地主机**：使用 Tailscale Serve（如果 `gateway.auth.allowTailscale: true` 则无 token），带 token 的 tailnet 绑定，或 SSH 隧道。参见 [Web 界面](../web/webchat.html)。

## 如果你看到"未授权" / 1008

- 运行 `openclaw dashboard` 获取新的带 token 链接。
- 确保 Gateway 可访问（本地：`openclaw status`；远程：SSH 隧道 `ssh -N -L 18789:127.0.0.1:18789 user@host` 然后打开 `http://127.0.0.1:18789/?token=...`）。
- 在 Dashboard 设置中，粘贴你在 `gateway.auth.token`（或 `OPENCLAW_GATEWAY_TOKEN`）中配置的相同 token。
