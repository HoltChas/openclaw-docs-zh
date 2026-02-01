---
summary: "在同一主机上运行多个 OpenClaw Gateway（隔离、端口和 profile）"
read_when:
  - 在同一台机器上运行多个 Gateway
  - 需要每个 Gateway 独立的配置/状态/端口
---
# 多个 Gateway（同一主机）

多数设置使用一个 Gateway，因为一个 Gateway 可以处理多个消息连接和 Agent。如果你需要更强的隔离或冗余（例如救援 bot），可以运行多个隔离的 Gateway（独立 profile/端口）。

## 隔离检查清单（必需）
- `OPENCLAW_CONFIG_PATH` — 每个实例独立配置文件
- `OPENCLAW_STATE_DIR` — 每个实例独立会话、凭证、缓存
- `agents.defaults.workspace` — 每个实例独立工作区根
- `gateway.port`（或 `--port`）— 每个实例唯一
- 派生端口（browser/canvas）不得冲突

如果共享这些，会引发配置竞争和端口冲突。

## 推荐：profiles（`--profile`）

profiles 会自动作用于 `OPENCLAW_STATE_DIR` + `OPENCLAW_CONFIG_PATH`，并给服务名加后缀。

```bash
# main
openclaw --profile main setup # 中文注释：创建 main profile
openclaw --profile main gateway --port 18789

# rescue
openclaw --profile rescue setup # 中文注释：创建 rescue profile
openclaw --profile rescue gateway --port 19001
```

每个 profile 的服务：
```bash
openclaw --profile main gateway install
openclaw --profile rescue gateway install
```

## 救援 Bot 指南

在同一主机上运行第二个 Gateway，分别使用：
- profile/config
- state 目录
- workspace
- 基础端口（以及派生端口）

这样救援 bot 与主 bot 隔离，当主 bot 出问题时可用于调试或应用配置更改。

端口间隔：基础端口至少相隔 20 个端口，确保派生的浏览器/canvas/CDP 端口不冲突。

### 如何安装（救援 bot）

```bash
# 主 bot（已存在或新建，不带 --profile 参数）
# 运行在 18789 + Chrome CDC/Canvas/... 端口
openclaw onboard
openclaw gateway install

# 救援 bot（隔离 profile + 端口）
openclaw --profile rescue onboard
# 说明：
# - workspace 名称默认会加上 -rescue
# - 端口至少比 18789 大 20，最好直接选不同的基础端口，如 19789
# - 其余引导过程与正常相同

# 安装服务（如果引导未自动安装）
openclaw --profile rescue gateway install
```

## 端口映射（派生）

基础端口 = `gateway.port`（或 `OPENCLAW_GATEWAY_PORT` / `--port`）。

- 浏览器控制服务端口 = 基础 + 2（仅 loopback）
- `canvasHost.port = base + 4`
- 浏览器 profile 的 CDP 端口从 `browser.controlPort + 9 .. + 108` 自动分配

如果你在配置或环境中覆盖了这些，需要确保每个实例唯一。

## 浏览器/CDP 注意事项（常见坑）

- **不要**在多个实例中把 `browser.cdpUrl` 固定为相同值。
- 每个实例需要自己的浏览器控制端口和 CDP 范围（由 Gateway 端口派生）。
- 如需显式 CDP 端口，在每个实例上设置 `browser.profiles.<name>.cdpPort`。
- 远程 Chrome：使用 `browser.profiles.<name>.cdpUrl`（每个 profile、每个实例）。

## 手动环境示例

```bash
OPENCLAW_CONFIG_PATH=~/.openclaw/main.json \
OPENCLAW_STATE_DIR=~/.openclaw-main \
openclaw gateway --port 18789

OPENCLAW_CONFIG_PATH=~/.openclaw/rescue.json \
OPENCLAW_STATE_DIR=~/.openclaw-rescue \
openclaw gateway --port 19001
```

## 快速检查

```bash
openclaw --profile main status
openclaw --profile rescue status
openclaw --profile rescue browser status
```
