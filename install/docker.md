---
summary: "使用 Docker 运行 OpenClaw"
read_when:
  - 你想在 Docker 容器中运行 Gateway
  - 你需要配置 Agent 沙箱隔离
  - 你在调试 Docker 相关问题
---

# Docker

Docker 对于 OpenClaw 是**可选的**——仅在需要容器化网关环境或验证 Docker 工作流时才需要。

## 两个主要用例

1. **容器化 Gateway** - 在 Docker 内运行完整的 OpenClaw Gateway
2. **Agent 沙箱** - 主机 Gateway 配合 Docker 隔离的工具执行

## 快速开始

从仓库根目录运行 `./docker-setup.sh`，它会构建镜像、运行引导程序、启动 Gateway，并生成写入 `.env` 的令牌。通过 `http://127.0.0.1:18789/` 访问 UI。

## 关键配置选项

- **`OPENCLAW_DOCKER_APT_PACKAGES`** - 在构建期间安装额外的系统包
- **`OPENCLAW_EXTRA_MOUNTS`** - 添加主机绑定挂载（逗号分隔）
- **`OPENCLAW_HOME_VOLUME`** - 在命名卷中持久化 `/home/node`

## Agent 沙箱

启用后，"非主会话在 Docker 容器内运行工具"，而 Gateway 保持在主机上。关键设置包括：

- **作用域选项**：`"agent"`（默认）、`"session"` 或 `"shared"`
- **工作区访问**：`"none"`、`"ro"` 或 `"rw"`
- **网络**：默认为 `"none"` 以确保安全
- **自动清理**：空闲超过 24 小时或超过 7 天的容器

## 安全默认值

沙箱默认拒绝 `browser`、`canvas`、`nodes`、`cron`、`discord` 和 `gateway` 等工具，同时允许 `exec`、`process`、`read`、`write`、`edit` 和会话管理工具。

## 故障排除

- 权限错误：确保主机挂载由 uid 1000 拥有
- 缺少镜像：运行 `scripts/sandbox-setup.sh`
- 找不到自定义工具：设置 `docker.env.PATH` 或将脚本添加到 `/etc/profile.d/`
