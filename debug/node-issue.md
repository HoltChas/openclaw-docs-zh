---
summary: Node + tsx "__name is not a function" 崩溃记录和解决方案
read_when:
  - 调试仅 Node 的 dev 脚本或 watch 模式失败
  - 调查 OpenClaw 中的 tsx/esbuild 加载器崩溃
---

# Node + tsx "__name is not a function" 崩溃

## 概述
使用 Node 运行 OpenClaw（配合 `tsx`）在启动时失败：

```
[openclaw] Failed to start CLI: TypeError: __name is not a function
    at createSubsystemLogger (.../src/logging/subsystem.ts:203:25)
    at .../src/agents/auth-profiles/constants.ts:25:20
```

这个问题出现在将 dev 脚本从 Bun 切换到 `tsx` 之后（commit `2871657e`，2026-01-06）。同样的运行时路径在 Bun 下工作正常。

## 环境
- Node: v25.x（在 v25.3.0 上观察到）
- tsx: 4.21.0
- OS: macOS（在其他运行 Node 25 的平台上可能也能复现）

## 复现步骤（仅 Node）
```bash
# 在仓库根目录
node --version
pnpm install
node --import tsx src/entry.ts status
```

## 仓库中的最小复现
```bash
node --import tsx scripts/repro/tsx-name-repro.ts
```

## Node 版本检查
- Node 25.3.0: 失败
- Node 22.22.0（Homebrew `node@22`）: 失败
- Node 24: 这里还没安装；需要验证

## 备注 / 假设
- `tsx` 使用 esbuild 转换 TS/ESM。esbuild 的 `keepNames` 会发出一个 `__name` 辅助函数并用 `__name(...)` 包装函数定义。
- 崩溃表明 `__name` 在运行时存在但不是函数，这意味着该辅助函数在 Node 25 加载器路径中对于这个模块缺失或被覆盖。
- 其他 esbuild 使用者在辅助函数缺失或被重写时也报告过类似的 `__name` 辅助函数问题。

## 回归历史
- `2871657e`（2026-01-06）：脚本从 Bun 改为 tsx，使 Bun 变为可选。
- 之前（Bun 路径），`openclaw status` 和 `gateway:watch` 工作正常。

## 解决方案
- 使用 Bun 运行 dev 脚本（当前的临时回退方案）。
- 使用 Node + tsc watch，然后运行编译后的输出：
  ```bash
  pnpm exec tsc --watch --preserveWatchOutput
  node --watch openclaw.mjs status
  ```
- 本地确认：`pnpm exec tsc -p tsconfig.json` + `node openclaw.mjs status` 在 Node 25 上工作正常。
- 如果可能，在 TS 加载器中禁用 esbuild keepNames（防止 `__name` 辅助函数插入）；tsx 目前不提供此选项。
- 用 `tsx` 测试 Node LTS（22/24）以确认是否是 Node 25 特定问题。

## 参考链接
- https://opennext.js.org/cloudflare/howtos/keep_names
- https://esbuild.github.io/api/#keep-names
- https://github.com/evanw/esbuild/issues/1031

## 后续步骤
- 在 Node 22/24 上复现以确认 Node 25 回归。
- 测试 `tsx` nightly 版本，如果存在已知回归则固定到早期版本。
- 如果在 Node LTS 上也能复现，向上游提交最小复现，包含 `__name` 堆栈跟踪。
