---
summary: "安全更新 OpenClaw（全局安装或源码），加上回滚策略"
read_when:
  - 更新 OpenClaw
  - 更新后出现问题
---
# 更新

OpenClaw 正在快速迭代（预 "1.0" 版本）。将更新视为部署基础设施：更新 → 运行检查 → 重启（或使用 `openclaw update`，它会重启）→ 验证。

## 推荐：重新运行网站安装程序（就地升级）

**首选**更新方式是重新运行网站安装程序。它会检测现有安装、就地升级，并在需要时运行 `openclaw doctor`。

```bash
curl -fsSL https://openclaw.bot/install.sh | bash
```

说明：
- 如果你不想再次运行引导向导，添加 `--no-onboard`。
- 对于 **源码安装**，使用：
  ```bash
  curl -fsSL https://openclaw.bot/install.sh | bash -s -- --install-method git --no-onboard
  ```
  安装程序仅在仓库干净时才会 `git pull --rebase`。
- 对于 **全局安装**，脚本底层使用 `npm install -g openclaw@latest`。
- 遗留说明：`openclaw` 仍然作为兼容性垫片可用。

## 更新前

- 知道你的安装方式：**全局**（npm/pnpm）vs **源码**（git clone）。
- 知道你的 Gateway 运行方式：**前台终端** vs **受控服务**（launchd/systemd）。
- 快照你的定制：
  - 配置：`~/.openclaw/openclaw.json`
  - 凭证：`~/.openclaw/credentials/`
  - 工作区：`~/.openclaw/workspace`

## 更新（全局安装）

全局安装（选择一个）：

```bash
npm i -g openclaw@latest
```

```bash
pnpm add -g openclaw@latest
```
我们不推荐 Bun 作为 Gateway 运行时（WhatsApp/Telegram 有 bug）。

切换更新通道（git + npm 安装）：

```bash
openclaw update --channel beta
openclaw update --channel dev
openclaw update --channel stable
```

使用 `--tag <dist-tag|version>` 进行一次性安装标签/版本。

参见 [开发通道](/install/development-channels) 了解通道语义和发布说明。

注意：在 npm 安装上，Gateway 在启动时记录更新提示（检查当前通道标签）。通过 `update.checkOnStart: false` 禁用。

然后：

```bash
openclaw doctor
openclaw gateway restart
openclaw health
```

说明：
- 如果你的 Gateway 作为服务运行，`openclaw gateway restart` 比杀 PID 更受青睐。
- 如果你固定到特定版本，参见下面的"回滚/固定"。

## 更新（`openclaw update`）

对于 **源码安装**（git checkout），优先使用：

```bash
openclaw update
```

它运行一个安全的更新流程：
- 需要干净的工作树。
- 切换到所选通道（标签或分支）。
- 针对配置的上游获取 + 变基（dev 通道）。
- 安装依赖、构建、构建 Control UI，并运行 `openclaw doctor`。
- 默认重启 Gateway（使用 `--no-restart` 跳过）。

如果你通过 **npm/pnpm** 安装（无 git 元数据），`openclaw update` 会尝试通过你的包管理器更新。如果它无法检测安装，改用"更新（全局安装）"。

## 更新（Control UI / RPC）

Control UI 有 **更新并重启**（RPC: `update.run`）。它：
1) 运行与 `openclaw update` 相同的源码更新流程（仅 git checkout）。
2) 写入带结构化报告（stdout/stderr 尾部）的重启标记。
3) 重启 Gateway 并向最后活动会话发送报告。

如果变基失败，Gateway 中止并重启而不应用更新。

## 更新（从源码）

从仓库 checkout：

优先：

```bash
openclaw update
```

手动（大致等效）：

```bash
git pull
pnpm install
pnpm build
pnpm ui:build # 首次运行时自动安装 UI 依赖
openclaw doctor
openclaw health
```

说明：
- 当你运行打包的 `openclaw` 二进制文件（[`openclaw.mjs`](https://github.com/openclaw/openclaw/blob/main/openclaw.mjs)）或使用 Node 运行 `dist/` 时，`pnpm build` 很重要。
- 如果你从仓库 checkout 运行而不全局安装，使用 `pnpm openclaw ...` 进行 CLI 命令。
- 如果你直接从 TypeScript 运行（`pnpm openclaw ...`），通常不需要重建，但 **配置迁移仍然应用** → 运行 doctor。
- 在全局和 git 安装之间切换很容易：安装另一种风格，然后运行 `openclaw doctor` 以便 Gateway 服务端点被重写到当前安装。

## 始终运行：`openclaw doctor`

Doctor 是"安全更新"命令。它有意设计得无聊：修复 + 迁移 + 警告。

注意：如果你在 **源码安装**（git checkout）上，`openclaw doctor` 会提供先运行 `openclaw update`。

典型操作：
- 迁移已弃用的配置键 / 遗留配置文件位置。
- 审计 DM 策略并警告有风险的"开放"设置。
- 检查 Gateway 健康并可提供重启。
- 检测并将旧 Gateway 服务（launchd/systemd；遗留 schtasks）迁移到当前 OpenClaw 服务。
- 在 Linux 上，确保 systemd 用户驻留（以便 Gateway 在注销后存活）。

详情：[Doctor](/gateway/doctor)

## 启动 / 停止 / 重启 Gateway

CLI（适用于任何 OS）：

```bash
openclaw gateway status
openclaw gateway stop
openclaw gateway restart
openclaw gateway --port 18789
openclaw logs --follow
```

如果你受控：
- macOS launchd（应用捆绑 LaunchAgent）：`launchctl kickstart -k gui/$UID/bot.molt.gateway`（使用 `bot.molt.<profile>`；遗留 `com.openclaw.*` 仍然有效）
- Linux systemd 用户服务：`systemctl --user restart openclaw-gateway[-<profile>].service`
- Windows（WSL2）：`systemctl --user restart openclaw-gateway[-<profile>].service`
  - `launchctl`/`systemctl` 仅在服务安装时有效；否则运行 `openclaw gateway install`。

运行手册 + 精确服务标签：[Gateway 运行手册](/gateway)

## 回滚 / 固定（当出现问题时）

### 固定（全局安装）

安装已知良好的版本（将 `<version>` 替换为最后一个工作的版本）：

```bash
npm i -g openclaw@<version>
```

```bash
pnpm add -g openclaw@<version>
```

提示：查看当前发布版本，运行 `npm view openclaw version`。

然后重启 + 重新运行 doctor：

```bash
openclaw doctor
openclaw gateway restart
```

### 固定（源码）按日期

选择日期的提交（示例："2026-01-01 的 main 状态"）：

```bash
git fetch origin
git checkout "$(git rev-list -n 1 --before=\"2026-01-01\" origin/main)"
```

然后重新安装依赖 + 重启：

```bash
pnpm install
pnpm build
openclaw gateway restart
```

如果你稍后想回到最新版本：

```bash
git checkout main
git pull
```

## 如果你卡住

- 再次运行 `openclaw doctor` 并仔细阅读输出（它通常会告诉你修复方法）。
- 检查：[故障排查](/gateway/troubleshooting)
- 在 Discord 提问：https://channels.discord.gg/clawd