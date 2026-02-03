---
summary: "对话模式"
read_when:
  - 你想了解语音对话功能
  - 你需要配置 ElevenLabs 语音
  - 你在使用 Talk 模式
---

# 对话模式

对话模式提供连续的语音对话循环，包含四个步骤：监听语音、将转录发送到模型、等待响应，以及通过 ElevenLabs 流式播放朗读。

## macOS 行为

该功能包括"始终显示的覆盖层"，有三个阶段转换：监听、思考和朗读。当出现短暂停顿（静音窗口）时，转录被发送。回复出现在 WebChat 中。语音打断功能（默认启用）在用户开始说话时停止播放并记录打断时间戳。

## 语音指令

助手可以通过在回复前添加 JSON 行来控制语音输出。示例格式：

```json
{ "voice": "<voice-id>", "once": true }
```

关键规则：仅处理第一个非空行，忽略未知键，`once: true` 仅应用于当前回复。没有 `once` 时，语音成为新的默认值。

**支持的键包括：** voice/voice_id/voiceId、model/model_id/modelId、speed、rate（WPM）、stability、similarity、style、speakerBoost、seed、normalize、lang、output_format、latency_tier 和 once。

## 配置

位于 `~/.openclaw/openclaw.json`：

```json5
{
  talk: {
    voiceId: "elevenlabs_voice_id",
    modelId: "eleven_v3",
    outputFormat: "mp3_44100_128",
    apiKey: "elevenlabs_api_key",
    interruptOnSpeech: true,
  },
}
```

**默认值：** interruptOnSpeech 为 true；modelId 默认为"eleven_v3"；outputFormat 在 macOS/iOS 上默认为 pcm_44100，在 Android 上默认为 pcm_24000。

## macOS UI 元素

- 菜单栏切换标签为"Talk"
- 配置标签页带有"Talk Mode"组
- 覆盖层状态：云脉冲（监听）、下沉动画（思考）、辐射环（朗读）
- 点击云停止朗读；点击 X 退出

## 技术说明

- 需要语音和麦克风权限
- 使用 `chat.send` 和会话键"main"
- eleven_v3 的 stability 验证为 0.0、0.5 或 1.0；其他模型接受 0-1
- latency_tier 验证为 0-4
- Android 支持 pcm_16000、pcm_22050、pcm_24000 和 pcm_44100 格式
