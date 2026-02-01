---
summary: "Windows（WSL2）支持 + 配套应用状态"
read_when:
  - 在 Windows 上安装 OpenClaw
  - 查看 Windows 配套应用状态
---
# Windows（WSL2）

Windows 上的 OpenClaw 推荐 **通过 WSL2**（推荐 Ubuntu）。
CLI + Gateway 在 Linux 内部运行，这保持运行时一致并使工具更兼容（Node/Bun/pnpm、Linux 二进制文件、技能）。原生 Windows 安装未经测试且问题更多。

计划推出原生 Windows 配套应用。

## 安装（WSL2）
- [入门](/start/getting-started)（在 WSL 内部使用）
- [安装和更新](/install/updating)
- 官方 WSL2 指南（Microsoft）：https://learn.microsoft.com/windows/wsl/install

## Gateway
- [Gateway 运行手册](/gateway)
- [Gateway 配置](/gateway/configuration)

## Gateway 服务安装（CLI）

在 WSL2 内部：

```
openclaw onboard --install-daemon
```

或：

```
openclaw gateway install
```

或：

```
openclaw configure
```

在提示时选择 **Gateway 服务**。

修复/迁移：

```
openclaw doctor
```

## 高级：通过 LAN 暴露 WSL 服务（portproxy）

WSL 有自己的虚拟网络。如果另一台机器需要到达 **WSL 内部** 运行的服务（SSH、本地 TTS 服务器或 Gateway），你必须将 Windows 端口转发到当前 WSL IP。WSL IP 在重启后更改，因此你可能需要刷新转发规则。

示例（PowerShell **以管理员身份**）：

```powershell
$Distro = "Ubuntu-24.04"
$ListenPort = 2222
$TargetPort = 22

$WslIp = (wsl -d $Distro -- hostname -I).Trim().Split(" ")[0]
if (-not $WslIp) { throw "未找到 WSL IP。" }

netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$ListenPort `
  connectaddress=$WslIp connectport=$TargetPort
```

允许端口通过 Windows 防火墙（一次性）：

```powershell
New-NetFirewallRule -DisplayName "WSL SSH $ListenPort" -Direction Inbound `
  -Protocol TCP -LocalPort $ListenPort -Action Allow
```

WSL 重启后刷新 portproxy：

```powershell
netsh interface portproxy delete v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 | Out-Null
netsh interface portproxy add v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 `
  connectaddress=$WslIp connectport=$TargetPort | Out-Null
```

说明：
- 从另一台机器 SSH 目标 **Windows 主机 IP**（示例：`ssh user@windows-host -p 2222`）。
- 远程节点必须指向 **可到达的** Gateway URL（不是 `127.0.0.1`）；使用
  `openclaw status --all` 确认。
- 使用 `listenaddress=0.0.0.0` 进行 LAN 访问；`127.0.0.1` 仅保持本地。
- 如果你想要自动，注册计划任务在登录时运行刷新步骤。

## 分步 WSL2 安装

### 1) 安装 WSL2 + Ubuntu

打开 PowerShell（管理员）：

```powershell
wsl --install
# 或显式选择发行版：
wsl --list --online
wsl --install -d Ubuntu-24.04
```

如果 Windows 要求则重启。

### 2) 启用 systemd（Gateway 安装需要）

在你的 WSL 终端中：

```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```

然后从 PowerShell：

```powershell
wsl --shutdown
```

重新打开 Ubuntu，然后验证：

```bash
systemctl --user status
```

### 3) 在 WSL 内安装 OpenClaw

在 WSL 内遵循 Linux 入门流程：

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖
pnpm build
openclaw onboard
```

完整指南：[入门](/start/getting-started)

## Windows 配套应用

我们还没有 Windows 配套应用。如果你愿意贡献实现它，欢迎贡献。