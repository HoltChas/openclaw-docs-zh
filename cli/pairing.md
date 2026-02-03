---
summary: "CLI 配对命令"
read_when:
  - 你想管理私信配对请求
  - 你需要批准配对码
  - 你在使用配对功能
---

# CLI 配对

`openclaw pairing` 命令允许用户"批准或检查私信配对请求"，适用于支持此功能的频道。

## 可用命令

### 列出配对请求
```bash
openclaw pairing list whatsapp
```

### 批准配对请求
```bash
openclaw pairing approve whatsapp <code> --notify
```

## 相关资源

该页面引用了位于 `/start/pairing` 的配对流程相关文档。

## 附加说明

- `--notify` 标志是批准配对请求时的一个选项
- 此命令用于管理来自未知发送者的配对请求
