---
summary: "频道位置解析"
read_when:
  - 你想了解位置消息如何处理
  - 你需要使用位置上下文字段
  - 你在调试位置共享
---

# 频道位置解析

OpenClaw 处理来自聊天平台的共享位置，将它们转换为人类可读文本和结构化数据字段，用于自动回复上下文。

## 支持的平台

- **Telegram**：处理位置图钉、场所和实时位置共享
- **WhatsApp**：支持 `locationMessage` 和 `liveLocationMessage` 类型
- **Matrix**：使用 `geo_uri` 解析 `m.location` 事件

## 文本格式

位置显示带有表情符号指示器：

- **图钉**：显示带精度的坐标（例如 `📍 48.858844, 2.294351 ±12m`）
- **命名地点**：包含场所名称、地址和坐标，带 📍 图标
- **实时共享**：使用 🛰 卫星表情符号前缀

原始消息的标题或评论出现在位置下方的后续行。

## 上下文字段

检测到位置时，系统在 `ctx` 中填充这些字段：

| 字段 | 类型 | 备注 |
|------|------|------|
| `LocationLat` | number | 纬度 |
| `LocationLon` | number | 经度 |
| `LocationAccuracy` | number | 米（可选） |
| `LocationName` | string | 可选 |
| `LocationAddress` | string | 可选 |
| `LocationSource` | enum | `pin`、`place` 或 `live` |
| `LocationIsLive` | boolean | 实时跟踪状态 |

## 平台特定行为

- **Telegram**：场所数据映射到名称/地址字段；实时位置使用 `live_period`
- **WhatsApp**：位置消息的评论和标题成为标题行
- **Matrix**：仅将 `geo_uri` 解析为图钉；忽略海拔，`LocationIsLive` 保持 false
