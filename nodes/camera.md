---
summary: "摄像头捕获功能"
read_when:
  - 你想了解如何使用节点摄像头
  - 你需要配置摄像头权限
  - 你在调试摄像头命令
---

# 摄像头捕获

OpenClaw 在三个平台上为 Agent 工作流启用摄像头捕获：iOS、Android 和 macOS。所有平台都支持通过 `node.invoke` 捕获照片（jpg）和短视频片段（带可选音频的 mp4）。摄像头访问"受**用户控制设置**限制"。

## 平台特定详情

### iOS 节点

**用户设置：** 摄像头默认通过设置 → 摄像头 → 允许摄像头启用。禁用时，命令返回 `CAMERA_DISABLED`。

**可用命令：**
- `camera.list` - 返回设备数组，包含 id、name、position 和 deviceType
- `camera.snap` - 捕获照片，参数包括 facing（front/back）、maxWidth（默认 1600）、quality（0-1）、format、delayMs 和 deviceId
- `camera.clip` - 录制视频，参数包括 facing、durationMs（默认 3000，最大 60000）、includeAudio、format 和 deviceId

**关键约束：** 命令仅在前台工作；后台调用返回 `NODE_BACKGROUND_UNAVAILABLE`。

### Android 节点

**用户设置：** 同样默认启用。需要运行时权限（`CAMERA` 和 `RECORD_AUDIO`）。缺少权限会触发提示或返回 `*_PERMISSION_REQUIRED` 错误。

**负载保护：** 照片被重新压缩以保持在 5 MB base64 以下。

### macOS 应用

**用户设置：** 摄像头**默认关闭**（与移动平台不同）。通过设置 → 通用 → 允许摄像头启用。

**显著行为：** snap 命令"在预热/曝光稳定后等待 `delayMs`（默认 2000ms）再捕获"。

## CLI 示例

```bash
openclaw nodes camera snap --node <id> --facing front
openclaw nodes camera clip --node <id> --duration 3000
openclaw nodes camera clip --node <id> --no-audio
openclaw nodes screen record --node <id> --duration 10s --fps 15
```

## 安全限制

- 视频片段最长 60 秒
- 照片重新压缩以保持 base64 在 5 MB 以下
- 适用标准 OS 权限提示
- macOS 屏幕录制需要 TCC 屏幕录制权限
