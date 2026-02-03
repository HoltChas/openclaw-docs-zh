---
summary: "Exec 工具使用指南"
read_when:
  - 你想了解如何执行 shell 命令
  - 你需要配置执行安全策略
  - 你在调试命令执行问题
---

# Exec 工具

exec 工具在工作区中运行 shell 命令，通过 `process` 工具支持前台和后台执行。后台会话按 Agent 作用域。

## 参数

**必需：**
- `command` - 要执行的 shell 命令

**可选：**
- `workdir` - 工作目录（默认为 cwd）
- `env` - 键/值环境覆盖
- `yieldMs` - 自动后台延迟（默认：10000ms）
- `background` - 立即后台运行进程
- `timeout` - 终止超时秒数（默认：1800）
- `pty` - 为依赖 TTY 的 CLI 使用伪终端
- `host` - 执行位置：`sandbox`、`gateway` 或 `node`
- `security` - 强制模式：`deny`、`allowlist` 或 `full`
- `ask` - 审批提示：`off`、`on-miss` 或 `always`
- `node` - 使用 `host=node` 时的特定节点 id/名称
- `elevated` - 在 gateway 主机上请求提升模式

## 关键说明
- Host 默认为 `sandbox`
- "沙箱**默认关闭**"——关闭时，沙箱直接在 gateway 上运行，无需审批
- Gateway/node 执行拒绝 `env.PATH` 和加载器覆盖以"防止二进制劫持或注入代码"
- Fish shell 用户：系统优先使用 bash/sh 以避免不兼容的脚本

## 配置选项

| 设置 | 默认值 | 描述 |
|------|--------|------|
| `tools.exec.notifyOnExit` | true | 后台退出时的系统事件 |
| `tools.exec.approvalRunningNoticeMs` | 10000 | 运行通知延迟 |
| `tools.exec.host` | sandbox | 默认执行主机 |
| `tools.exec.security` | deny (sandbox) / allowlist (gateway+node) | 安全模式 |
| `tools.exec.ask` | on-miss | 审批提示行为 |
| `tools.exec.pathPrepend` | - | 要添加到 PATH 前面的目录 |
| `tools.exec.safeBins` | - | 仅 stdin 安全的二进制文件 |

## 按主机的 PATH 处理

- **Gateway**：合并登录 shell PATH；拒绝 `env.PATH` 覆盖
- **Sandbox**：在容器中运行登录 shell；在配置文件加载后添加 PATH 前缀
- **Node**：拒绝 PATH 覆盖；无头节点仅接受前缀添加

## 会话覆盖
使用 `/exec` 命令为 host、security、ask 和 node 参数设置每会话默认值。

## Exec 审批
需要时，exec 返回 `status: "approval-pending"` 和审批 id。Gateway 为完成、拒绝或运行状态发出事件。

## 允许列表行为
仅匹配"解析的二进制路径"——不匹配基本名称。在允许列表模式下，链接操作符和重定向被拒绝。

## 代码示例

**前台执行：**
```json
{ "tool": "exec", "command": "ls -la" }
```

**后台轮询：**
```json
{"tool":"exec","command":"npm run build","yieldMs":1000}
{"tool":"process","action":"poll","sessionId":"<id>"}
```

**发送按键（tmux 风格）：**
```json
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["C-c"]}
```

**粘贴文本：**
```json
{ "tool": "process", "action": "paste", "sessionId": "<id>", "text": "line1\nline2\n" }
```

## apply_patch（实验性）
用于结构化多文件编辑的子工具，仅适用于 OpenAI/Codex 模型。需要在 `tools.exec.applyPatch` 下的配置中显式启用。
