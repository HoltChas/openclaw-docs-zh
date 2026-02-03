---
summary: "设备型号数据库"
read_when:
  - 你想了解设备型号映射
  - 你需要更新设备数据库
  - 你在开发 macOS 应用
---

# 设备型号数据库

## 概述

macOS 配套应用在实例 UI 中显示"友好的 Apple 设备型号名称"。它将 Apple 型号标识符（如 `iPad16,6` 或 `Mac16,6`）转换为可读名称。

## 文件位置

JSON 映射文件存储在：
- `apps/macos/Sources/OpenClaw/Resources/DeviceModels/`

## 数据来源

映射数据来自 MIT 许可的仓库：`kyle-seongwoo-jun/apple-device-identifiers`。JSON 文件固定到特定提交以实现确定性构建，提交信息在 `NOTICE.md` 文件中跟踪。

## 更新流程

要刷新设备数据库：

1. 选择要固定的上游提交（iOS 和 macOS 文件使用单独的提交）
2. 在 `NOTICE.md` 文件中记录新的提交哈希
3. 使用带有固定提交 SHA 的 curl 命令下载更新的 JSON 文件
4. 验证捆绑的许可证文件与上游许可证匹配
5. 使用 `swift build --package-path apps/macos` 确认 macOS 应用编译无警告

更新工作流涉及两个 JSON 文件：
- `ios-device-identifiers.json`
- `mac-device-identifiers.json`
