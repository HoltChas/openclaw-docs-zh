---
summary: "Gateway 沙箱配置"
read_when:
  - 你想了解如何隔离工具执行
  - 你需要配置 Docker 沙箱
  - 你在调试沙箱问题
---

# Gateway 沙箱

OpenClaw 提供可选的基于 Docker 的沙箱，用于工具执行，以"减少爆炸半径"当 AI 模型出错时。Gateway 进程保留在主机上，而工具执行在隔离容器中进行。配置通过 `agents.defaults.sandbox` 或每 Agent 设置管理。

## 被沙箱化的内容

**沙箱化项目：**
- 工具执行，包括 `exec`、`read`、`write`、`edit`、`apply_patch`、`process` 等
- 可选的沙箱化浏览器，具有自动启动功能和主机控制选项

**不沙箱化：**
- Gateway 进程本身
- 通过 `tools.elevated` 明确允许在主机上运行的工具（"在主机上运行并绕过沙箱"）

## 沙箱模式

`agents.defaults.sandbox.mode` 设置控制何时激活沙箱：
- `"off"` - 完全禁用沙箱
- `"non-main"` - 仅沙箱化非主会话（群组/频道会话算作非主会话）
- `"all"` - 沙箱化每个会话

## 作用域选项

`scope` 设置决定容器分配：
- `"session"`（默认）- 每个会话一个容器
- `"agent"` - 每个 Agent 一个容器
- `"shared"` - 所有沙箱化会话共享单个容器

## 工作区访问级别

`workspaceAccess` 设置控制可见性：
- `"none"`（默认）- 工具看到 `~/.openclaw/sandboxes` 下的沙箱工作区
- `"ro"` - 在 `/agent` 以只读方式挂载 Agent 工作区，禁用写操作
- `"rw"` - 在 `/workspace` 以读写方式挂载 Agent 工作区

## 自定义绑定挂载

格式：`host:container:mode`（例如 `"/home/user/source:/source:rw"`）

全局和每 Agent 绑定会合并。安全注意事项包括对敏感挂载（如 docker.sock 或 SSH 密钥）使用 `:ro`。

## 镜像和设置

默认镜像：`openclaw-sandbox:bookworm-slim`

构建命令：
```bash
scripts/sandbox-setup.sh
scripts/sandbox-browser-setup.sh
```

容器默认无网络运行；通过 `docker.network` 设置覆盖。

## setupCommand

通过 `sh -lc` 在容器创建后运行一次。常见问题包括：
- 默认网络是 `"none"`，阻止包安装
- `readOnlyRoot: true` 阻止写入
- 包安装需要 root 用户
- 主机环境变量不会继承

## 工具策略和逃逸通道

工具 allow/deny 策略在沙箱规则之前应用。`tools.elevated` 选项提供主机执行。使用 `openclaw sandbox explain` 调试有效配置。

## 最小配置示例

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        scope: "session",
        workspaceAccess: "none",
      },
    },
  },
}
```

## 相关文档

提供了沙箱配置、多 Agent 沙箱和工具以及安全页面的链接供参考。
