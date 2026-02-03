---
summary: "Doctor 诊断和修复命令"
read_when:
  - 你想修复配置问题
  - 你需要迁移旧版设置
  - 你在运行健康检查
---

# Doctor 命令

`openclaw doctor` 命令作为"修复 + 迁移工具"，解决陈旧配置、执行健康检查并提供可操作的修复指导。

## 基本用法

```bash
openclaw doctor
```

## 命令行标志

| 标志 | 用途 |
|------|------|
| `--yes` | 接受默认值而不提示，包括重启和沙箱修复 |
| `--repair` | 自动应用推荐的修复而不提示 |
| `--repair --force` | 应用激进修复，覆盖自定义监控器配置 |
| `--non-interactive` | 仅运行安全迁移，跳过需要确认的操作 |
| `--deep` | 扫描系统服务以查找额外的 gateway 安装 |
| `--generate-gateway-token` | 在自动化场景中强制创建令牌 |

## 关键功能

### 配置管理
- 将旧版配置值标准化为当前模式
- 迁移已弃用的键（例如 `routing.allowFrom` 变为 `channels.whatsapp.allowFrom`）
- 警告可能影响 API 路由的 OpenCode Zen 提供者覆盖

### 状态迁移
该工具迁移旧版磁盘布局，移动：
- 会话从 `~/.openclaw/sessions/` 到 Agent 特定目录
- Agent 目录到每 Agent 路径
- WhatsApp 认证状态到有组织的凭据文件夹

### 健康和完整性检查
- 验证状态目录存在和权限
- 检查会话持久性和记录文件完整性
- 验证 OAuth 令牌过期并提供刷新选项
- 检查配置文件权限（建议 chmod 600）

### Gateway 操作
- 执行健康检查并提示重启
- 检测默认端口（18789）上的端口冲突
- 审计 launchd、systemd 和 schtasks 的监控器配置
- 警告运行时问题，如使用 Bun 或版本管理的 Node 路径

### 安全
- 对没有允许列表的开放私信策略发出警告
- 在本地模式下缺少 `gateway.auth.token` 时发出警报

### 附加功能
- 启用沙箱时检查沙箱 Docker 镜像
- 在 Linux 上验证 systemd linger 以实现持久 gateway 操作
- 提供技能状态摘要
- 建议通过 git 备份工作区

## 预检提示

在 doctor 写入更改之前查看配置：
```bash
cat ~/.openclaw/openclaw.json
```
