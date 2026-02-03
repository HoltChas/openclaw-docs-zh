---
summary: "CLI 设备管理"
read_when:
  - 你想管理设备配对
  - 你需要轮换或撤销令牌
  - 你在使用设备命令
---

# CLI 设备

`openclaw devices` 命令用于"管理设备配对请求和设备作用域令牌"。

## 可用命令

### 列出设备
- `openclaw devices list` - 显示待处理的配对请求和已配对设备
- 添加 `--json` 标志获取 JSON 格式输出

### 配对管理
- **批准**：`openclaw devices approve <requestId>` - 接受待处理的配对请求
- **拒绝**：`openclaw devices reject <requestId>` - 拒绝待处理的配对请求

### 令牌管理
- **轮换**：`openclaw devices rotate --device <id> --role <role> [--scope <scope...>]` - 为设备生成具有指定角色的新令牌，可选更新作用域权限
- **撤销**：`openclaw devices revoke --device <id> --role <role>` - 移除特定角色的设备令牌

## 通用选项

| 选项 | 描述 |
|------|------|
| `--url <url>` | Gateway WebSocket URL（使用 `gateway.remote.url` 配置默认值） |
| `--token <token>` | 需要时的 Gateway 令牌 |
| `--password <password>` | 密码认证 |
| `--timeout <ms>` | RPC 超时持续时间 |
| `--json` | JSON 输出，"推荐用于脚本" |

## 重要说明

- 令牌轮换产生的新令牌应"视为机密"
- 这些命令需要 `operator.pairing` 或 `operator.admin` 作用域才能执行
