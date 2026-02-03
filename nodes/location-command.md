---
summary: "位置命令"
read_when:
  - 你想了解如何获取节点位置
  - 你需要配置位置权限
  - 你在使用位置功能
---

# 位置命令

`location.get` 命令是通过 `node.invoke` 调用的节点命令。它默认禁用，使用三选项选择器（关闭 / 使用时 / 始终）加上精确位置的单独开关。

## 为什么使用选择器而非简单开关

操作系统权限在多个级别工作。应用内选择器决定应用请求什么，但 OS 控制实际的权限授予。每个平台处理方式不同：

- **iOS/macOS**：用户在系统提示或设置中选择权限级别
- **Android**：后台位置需要单独权限；Android 10+ 通常需要设置流程
- **精确位置**：在各平台作为独立授权处理

## 设置模型

每个节点设备有两个设置：
- `location.enabledMode`：接受值 `off`、`whileUsing` 或 `always`
- `location.preciseEnabled`：布尔值

当选择"whileUsing"时，UI 请求前台权限，对于"always"，它首先确保前台访问，然后请求后台权限。

## 命令参数

`location.get` 命令接受可选参数，包括 `timeoutMs`、`maxAgeMs` 和 `desiredAccuracy`（选项为 coarse、balanced 或 precise）。

## 响应数据

响应包括纬度、经度、精度（米）、海拔、速度、航向、时间戳、精度指示器和来源（GPS、WiFi、cell 或 unknown）。

## 错误代码

存在五个稳定的错误代码：`LOCATION_DISABLED`、`LOCATION_PERMISSION_REQUIRED`、`LOCATION_BACKGROUND_UNAVAILABLE`、`LOCATION_TIMEOUT` 和 `LOCATION_UNAVAILABLE`。

## 后台行为（未来）

计划的功能将允许在节点后台时请求位置，需要"始终"设置、OS 后台权限和适当的后台执行权限。推送触发的流程将使 gateway 能够唤醒节点以获取位置更新。

## 集成

- 工具界面：`nodes` 工具提供 `location_get` 操作
- CLI 访问：`openclaw nodes location get --node <id>`
- 指南建议仅在用户启用位置并理解其含义时调用
