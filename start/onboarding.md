---
summary: "macOS 应用引导流程"
read_when:
  - 你想了解首次运行设置
  - 你需要配置 Gateway 和认证
  - 你在设置 macOS 应用
---

# 引导

引导流程为首次运行设置提供"流畅的'第 0 天'体验"，引导用户完成 Gateway 配置、认证和 Agent 引导。

## 页面流程（8 步）
1. **欢迎 + 安全通知** - 查看并确认安全信息
2. **Gateway 选择** - 选择本地、远程（SSH/Tailnet）或稍后配置
3. **认证** - 仅本地设置的 Anthropic OAuth
4. **设置向导** - Gateway 驱动的配置
5. **权限** - 系统访问的 TCC 提示
6. **CLI** - 可选的全局 CLI 安装
7. **引导聊天** - 专用的介绍会话
8. **就绪**

## Gateway 选项
- **本地：** 在你的 Mac 上运行 OAuth 流程并写入凭据
- **远程：** 凭据必须已存在于 gateway 主机上；无本地 OAuth
- **稍后配置：** 保持应用未配置

向导为回环连接生成令牌，要求本地 WebSocket 客户端进行认证。禁用认证允许任何本地进程连接——仅推荐用于受信任的机器。

## 认证（仅本地）
使用带 PKCE 流程的 Anthropic OAuth。浏览器打开进行授权，用户粘贴 `code#state` 值，凭据保存到 `~/.openclaw/credentials/oauth.json`。其他提供者使用环境变量或配置文件。

## 请求的权限
- 通知、辅助功能、屏幕录制、麦克风/语音识别和自动化（AppleScript）

## Agent 引导
工作区（默认 `~/.openclaw/workspace`）使用 markdown 文件初始化，包括 `AGENTS.md`、`BOOTSTRAP.md`、`IDENTITY.md` 和 `USER.md`。问答仪式捕获偏好，写入身份文件并在完成后删除 `BOOTSTRAP.md`。

## Gmail 设置（手动）
```bash
openclaw webhooks gmail setup --account you@gmail.com
```

## 远程模式
凭据和工作区文件位于 gateway 主机上。必需文件包括各自目录中的 `oauth.json` 和 `auth-profiles.json`。
