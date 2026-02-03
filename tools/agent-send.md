---
summary: "Agent 发送命令"
read_when:
  - 你想了解如何手动触发 Agent 轮次
  - 你需要从 CLI 发送消息
  - 你在调试 Agent 执行
---

# Agent 发送

`openclaw agent` 命令执行"单个 Agent 轮次，无需入站聊天消息"。默认情况下，它通过 Gateway 路由，但用户可以添加 `--local` 在本地机器上运行。

## 核心行为

**必需参数：** `--message <text>`

**会话选择选项（选择一个）：**
- `--to <dest>` - 从目标派生会话键；私聊折叠到 `main`
- `--session-id <id>` - 重用现有会话
- `--agent <id>` - 使用其 `main` 会话键定向到已配置的 Agent

该命令使用与标准入站回复相同的嵌入式 Agent 运行时。思考和详细标志会持久化到会话存储。

**输出模式：**
- 默认：打印回复文本，媒体内容带有 `MEDIA:<url>` 行
- JSON 模式：输出带有元数据的结构化负载

**回退行为：** 如果无法访问 Gateway，CLI 自动回退到本地执行。

## 代码示例

```bash
openclaw agent --to +15555550123 --message "状态更新"
openclaw agent --agent ops --message "总结日志"
openclaw agent --session-id 1234 --message "总结收件箱" --thinking medium
openclaw agent --to +15555550123 --message "跟踪日志" --verbose on --json
openclaw agent --to +15555550123 --message "召唤回复" --deliver
openclaw agent --agent ops --message "生成报告" --deliver --reply-channel slack --reply-to "#reports"
```

## 可用标志

| 标志 | 描述 |
|------|------|
| `--local` | 强制本地执行（需要 shell 中的 API 密钥） |
| `--deliver` | 将回复发送到指定频道 |
| `--channel` | 设置投递频道（whatsapp、telegram、discord、googlechat、slack、signal、imessage） |
| `--reply-to` | 覆盖投递目标 |
| `--reply-channel` | 覆盖投递频道 |
| `--reply-account` | 覆盖投递账户 ID |
| `--thinking` | 设置思考级别（off/minimal/low/medium/high/xhigh）- 适用于 GPT-5.2 和 Codex 模型 |
| `--verbose` | 设置详细程度（on/full/off） |
| `--timeout` | 覆盖 Agent 超时秒数 |
| `--json` | 输出结构化 JSON |
