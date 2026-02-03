---
summary: "Bonjour/mDNS 发现"
read_when:
  - 你想了解局域网 Gateway 发现
  - 你需要配置 Tailscale 广域发现
  - 你在调试发现问题
---

# Bonjour/mDNS 发现

OpenClaw 利用 Bonjour（mDNS/DNS-SD）作为"仅限局域网的便利功能"来发现活动的 Gateway WebSocket 端点。这被描述为尽力而为，不能替代 SSH 或 Tailnet 连接选项。

## 通过 Tailscale 的广域 Bonjour

当节点和 gateway 位于不同网络时，多播 mDNS 无法跨越网络边界。解决方案是通过 Tailscale 的单播 DNS-SD。

**设置步骤：**
1. 在 gateway 主机上部署可通过 Tailnet 访问的 DNS 服务器
2. 在 `openclaw.internal.` 等区域下发布 `_openclaw-gw._tcp` 的 DNS-SD 记录
3. 配置 Tailscale 分割 DNS 以通过该 DNS 服务器路由你的域

**推荐的 gateway 配置：**
```json5
{
  gateway: { bind: "tailnet" },
  discovery: { wideArea: { enabled: true } },
}
```

**DNS 服务器设置命令：**
```bash
openclaw dns setup --apply
```

这会安装 CoreDNS，配置它通过 Tailscale 接口在端口 53 上监听，并从 `~/.openclaw/dns/<domain>.db` 提供服务。

**验证命令：**
```bash
dns-sd -B _openclaw-gw._tcp openclaw.internal.
dig @<TAILNET_IPV4> -p 53 _openclaw-gw._tcp.openclaw.internal PTR +short
```

## 服务广告

只有 Gateway 广告 `_openclaw-gw._tcp`。默认 WebSocket 端口是 18789，默认绑定到回环地址。

## TXT 记录键

广告的提示包括：`role`、`displayName`、`lanHost`、`gatewayPort`、`gatewayTls`、`gatewayTlsSha256`、`canvasPort`（默认 18793）、`sshPort`（默认 22）、`transport`、`cliPath` 和 `tailnetDns`。

## 调试

**macOS 工具：**
```bash
dns-sd -B _openclaw-gw._tcp local.
dns-sd -L "<instance>" _openclaw-gw._tcp local.
```

**Gateway 日志：** 搜索 `bonjour:` 条目，指示广告失败、名称冲突或看门狗警报。

**iOS：** 通过设置 → Gateway → 高级 → 发现调试日志访问。

## 常见问题

- Bonjour 不会穿越网络（改用 Tailnet/SSH）
- 某些 Wi-Fi 网络阻止多播
- 睡眠/接口更改可能暂时丢失结果
- 带有表情符号或标点符号的复杂主机名可能导致解析失败

## 配置选项

| 变量 | 用途 |
|------|------|
| `OPENCLAW_DISABLE_BONJOUR=1` | 禁用广告 |
| `gateway.bind` | 在配置文件中控制绑定模式 |
| `OPENCLAW_SSH_PORT` | 覆盖广告的 SSH 端口 |
| `OPENCLAW_TAILNET_DNS` | 发布 MagicDNS 提示 |
| `OPENCLAW_CLI_PATH` | 覆盖广告的 CLI 路径 |

## 相关文档

- 发现策略：`/gateway/discovery`
- 节点配对：`/gateway/pairing`
