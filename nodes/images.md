---
summary: "发送、Gateway 和 Agent 回复的图像和媒体处理规则"
read_when:
  - 修改媒体管道或附件
---
# 图像和媒体支持 — 2025-12-05

WhatsApp 频道通过 **Baileys Web** 运行。本文档捕获发送、Gateway 和 Agent 回复的当前媒体处理规则。

## 目标
- 通过 `openclaw message send --media` 发送带可选标题的媒体。
- 允许 Web 收件箱的自动回复包含媒体以及文本。
- 保持每种类型限制合理且可预测。

## CLI 表面
- `openclaw message send --media <path-or-url> [--message <caption>]`
  - `--media` 可选；标题可以为空用于仅媒体发送。
  - `--dry-run` 打印解析的负载；`--json` 发出 `{ channel, to, messageId, mediaUrl, caption }`。

## WhatsApp Web 频道行为
- 输入：本地文件路径 **或** HTTP(S) URL。
- 流程：加载到 Buffer，检测媒体类型，并构建正确的负载：
  - **图像：** 调整大小并重新压缩为 JPEG（最大边 2048px），目标 `agents.defaults.mediaMaxMb`（默认 5 MB），上限为 6 MB。
  - **音频/语音/视频：** 直通高达 16 MB；音频作为语音笔记发送（`ptt: true`）。
  - **文档：** 其他任何东西，高达 100 MB，尽可能保留文件名。
- WhatsApp GIF 风格播放：发送带 `gifPlayback: true` 的 MP4（CLI: `--gif-playback`）以便移动客户端内联循环。
- MIME 检测优先使用魔数，然后是 headers，然后是文件扩展名。
- 标题来自 `--message` 或 `reply.text`；允许空标题。
- 日志记录：非详细显示 `↩️`/`✅`；详细包括大小和源路径/URL。

## 自动回复管道
- `getReplyFromConfig` 返回 `{ text?, mediaUrl?, mediaUrls? }`。
- 当存在媒体时，Web 发送器使用与 `openclaw message send` 相同的管道解析本地路径或 URL。
- 如果提供多个媒体条目，则顺序发送。

## 入站媒体到命令（Pi）
- 当入站 Web 消息包含媒体时，OpenClaw 下载到临时文件并暴露模板变量：
  - 入站媒体的 `{{MediaUrl}}` 伪 URL。
  - 运行命令前写入的本地临时路径 `{{MediaPath}}`。
- 当启用每会话 Docker 沙盒时，入站媒体被复制到沙盒工作区，`MediaPath`/`MediaUrl` 被重写为相对路径如 `media/inbound/<filename>`。
- 媒体理解（如果通过 `tools.media.*` 或共享 `tools.media.models` 配置）在模板化之前运行，并可以在 `Body` 中插入 `[Image]`、`[Audio]` 和 `[Video]` 块。
  - 音频设置 `{{Transcript}}` 并使用转录本进行命令解析，以便斜杠命令仍然有效。
  - 视频和图像描述保留任何标题文本用于命令解析。
- 默认情况下仅处理第一个匹配的图像/音频/视频附件；设置 `tools.media.<cap>.attachments` 以处理多个附件。

## 限制和错误
**出站发送上限（WhatsApp Web 发送）**
- 图像：重新压缩后约 6 MB 上限。
- 音频/语音/视频：16 MB 上限；文档：100 MB 上限。
- 超大或不可读媒体 → 日志中的清晰错误并跳过回复。

**媒体理解上限（转录/描述）**
- 图像默认：10 MB（`tools.media.image.maxBytes`）。
- 音频默认：20 MB（`tools.media.audio.maxBytes`）。
- 视频默认：50 MB（`tools.media.video.maxBytes`）。
- 超大媒体跳过理解，但回复仍通过原始正文进行。

## 测试说明
- 覆盖图像/音频/文档情况的发送 + 回复流程。
- 验证图像的重新压缩（大小限制）和音频的语音笔记标志。
- 确保多媒体回复作为顺序发送扇出。