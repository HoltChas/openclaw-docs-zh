---
summary: "测试命令参考"
read_when:
  - 你想了解如何运行测试
  - 你需要进行模型基准测试
  - 你在调试测试问题
---

# 测试

## 核心测试命令

文档概述了几个 pnpm 测试脚本：

- **test:force** - 终止默认控制端口上任何残留的 gateway 进程，然后使用隔离端口执行 Vitest 套件。"当之前的 gateway 运行占用了端口 18789 时"很有用。

- **test:coverage** - 使用 V8 覆盖率运行 Vitest，在行、分支、函数和语句上强制执行 70% 阈值。排除集成密集型入口点以专注于可单元测试的逻辑。

- **test:e2e** - 执行 gateway 端到端冒烟测试，涵盖多实例 WebSocket、HTTP 和节点配对场景。

- **test:live** - 运行 minimax/zai 的提供者实时测试。需要 API 密钥和 `LIVE=1` 或提供者特定的环境变量来启用。

## 模型延迟基准测试

基准测试脚本位于 `scripts/bench-model.ts`。用户可以使用可选的环境变量来设置 API 密钥和配置。默认提示请求单词响应。

2025-12-31 的基准测试结果（20 次运行）显示 minimax 中位数为 1279ms，opus 中位数为 2454ms。

## 基于 Docker 的测试

**引导 E2E**：Docker 是可选的，用于容器化引导冒烟测试。脚本 `scripts/e2e/onboard-docker.sh` 驱动交互式向导，验证配置文件并运行健康检查。

**QR 导入冒烟测试**：使用 `pnpm test:docker:qr` 验证 qrcode-terminal 在 Docker 中的 Node 22+ 下正确加载。
