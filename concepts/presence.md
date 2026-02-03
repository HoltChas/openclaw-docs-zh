---
summary: "在线状态系统"
read_when:
  - 你想了解 Gateway 和客户端的在线状态
  - 你需要调试客户端连接问题
  - 你在查看实例列表
---

# 在线状态

OpenClaw 在线状态提供"Gateway 和已连接客户端（macOS 应用、WebChat、CLI 等）的轻量级、尽力而为的视图"。其主要目的是为 macOS 应用的实例标签页提供支持，并为运维人员提供快速可见性。

## 在线状态字段

条目包含结构化数据，包括：
- **instanceId**：稳定的客户端身份（强烈推荐）
- **host**：人类可读的主机名
- **ip**：尽力而为的 IP 地址
- **version**：客户端版本字符串
- **deviceFamily / modelIdentifier**：硬件信息
- **mode**：客户端类型（ui、webchat、cli、backend、probe、test、node 等）
- **lastInputSeconds**：自上次用户输入以来的时间
- **reason**：条目来源（self、connect、node-connected、periodic）
- **ts**：自纪元以来的毫秒时间戳

## 在线状态生产者

四个来源生成合并在一起的在线状态条目：

1. **Gateway 自身条目**：启动时播种条目，使 Gateway 在客户端连接前就出现
2. **WebSocket 连接**：成功握手时创建（注意：CLI 模式连接被排除以防止列表泛滥）
3. **system-event 信标**：来自客户端的定期更新，包含更丰富的数据如主机名和空闲时间
4. **节点连接**：以 `role: node` 连接的节点获得在线状态条目

## 去重

条目存储在以在线状态键为键的内存映射中。使用稳定的 `instanceId` 可防止客户端重连时出现重复行。键不区分大小写。

## TTL 和大小限制

- **TTL**：5 分钟（较旧的条目被修剪）
- **最大条目数**：200（最旧的先被丢弃）

## 隧道/回环处理

来自 SSH 隧道的回环地址（127.0.0.1）被忽略，以保留客户端报告的 IP。

## 调试

对 Gateway 调用 `system-presence` 以查看原始数据。重复条目通常表示握手和信标之间缺少或不一致的 `instanceId` 值。
