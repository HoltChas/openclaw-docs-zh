---
summary: "网络中心：Gateway 界面、配对、发现和安全性"
read_when:
  - 你需要网络架构 + 安全概览
  - 你在调试本地 vs tailnet 访问或配对
  - 你想要网络文档的规范列表
---
# 网络中心

这个中心链接了关于 OpenClaw 如何在 localhost、LAN 和 tailnet 上连接、配对和保护设备的核心文档。

## 核心模型

- [Gateway 架构](concepts/architecture.html)
- [Gateway 协议](gateway/protocol.html)
- [Gateway 运行手册](gateway/index.html)
- [Web 界面 + 绑定模式](web/index.html)

## 配对 + 身份

- [配对概览（DM + 节点）](start/pairing.html)
- [Gateway 拥有的节点配对](gateway/pairing.html)
- [设备 CLI（配对 + 令牌轮换）](cli/devices.html)
- [配对 CLI（DM 批准）](cli/pairing.html)

本地信任：
- 本地连接（回环或 Gateway 主机自己的 tailnet 地址）可以
  自动批准配对，以保持同一主机的用户体验流畅。
- 非本地 tailnet/LAN 客户端仍需要显式配对批准。

## 发现 + 传输

- [发现与传输](gateway/discovery.html)
- [Bonjour / mDNS](gateway/bonjour.html)
- [远程访问（SSH）](gateway/remote.html)
- [Tailscale](gateway/tailscale.html)

## 节点 + 传输

- [节点概览](nodes/index.html)
- [桥接协议（旧版节点）](gateway/bridge-protocol.html)
- [节点运行手册：iOS](platforms/ios.html)
- [节点运行手册：Android](platforms/android.html)

## 安全

- [安全概览](gateway/security.html)
- [Gateway 配置参考](gateway/configuration.html)
- [故障排除](gateway/troubleshooting.html)
- [Doctor](gateway/doctor.html)
