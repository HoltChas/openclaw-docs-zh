---
summary: "技能配置模式和示例"
read_when:
  - 添加或修改技能配置
  - 调整捆绑允许列表或安装行为
---
# 技能配置

所有技能相关配置都在 `~/.openclaw/openclaw.json` 的 `skills` 下。

```json5
{
  skills: {
    allowBundled: ["gemini", "peekaboo"],
    load: {
      extraDirs: [
        "~/Projects/agent-scripts/skills",
        "~/Projects/oss/some-skill-pack/skills"
      ],
      watch: true,
      watchDebounceMs: 250
    },
    install: {
      preferBrew: true,
      nodeManager: "npm" // npm | pnpm | yarn | bun（Gateway 运行时仍用 Node；Bun 不推荐）
    },
    entries: {
      "nano-banana-pro": {
        enabled: true,
        apiKey: "GEMINI_KEY_HERE",
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE"
        }
      },
      peekaboo: { enabled: true },
      sag: { enabled: false }
    }
  }
}
```

## 字段

- `allowBundled`：仅 **捆绑** 技能的可选允许列表。设置时，仅列表中的捆绑技能有效（托管/工作区技能不受影响）。
- `load.extraDirs`：要扫描的额外技能目录（最低优先级）。
- `load.watch`：监视技能文件夹并刷新技能快照（默认：true）。
- `load.watchDebounceMs`：技能监视器事件的去抖（毫秒）（默认：250）。
- `install.preferBrew`：如果可用，优先使用 brew 安装程序（默认：true）。
- `install.nodeManager`：Node 安装器首选项（`npm` | `pnpm` | `yarn` | `bun`，默认：npm）。
  这只影响 **技能安装**；Gateway 运行时仍应该是 Node
  （Bun 不推荐用于 WhatsApp/Telegram）。
- `entries.<skillKey>`：每个技能的覆盖。

每个技能字段：
- `enabled`：设置为 `false` 禁用技能，即使它是捆绑/已安装的。
- `env`：为 Agent 运行注入的环境变量（仅当尚未设置时）。
- `apiKey`：声明主环境变量的技能的可选便利选项。

## 说明

- `entries` 下的键默认映射到技能名称。如果技能定义了 `metadata.openclaw.skillKey`，改用该键。
- 启用监视器时，技能的更改在下一次 Agent 轮次中获取。

### 沙盒化技能 + 环境变量

当会话 **沙盒化** 时，技能进程在 Docker 内运行。沙盒 **不会** 继承主机 `process.env`。

使用以下之一：
- `agents.defaults.sandbox.docker.env`（或每个 Agent 的 `agents.list[].sandbox.docker.env`）
- 将你的环境烘焙到自定义沙盒镜像中

全局 `env` 和 `skills.entries.<skill>.env/apiKey` 仅适用于 **主机** 运行。