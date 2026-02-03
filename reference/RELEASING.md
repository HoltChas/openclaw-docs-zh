---
summary: "发布检查清单"
read_when:
  - 你想了解发布流程
  - 你需要发布新版本
  - 你在准备 npm 或 macOS 发布
---

# 发布检查清单

本文档概述了 OpenClaw 的完整发布流程，涵盖 npm 和 macOS 分发。

## 先决条件
- 从仓库根目录使用 pnpm 和 Node 22+
- 在标记/发布前确保工作树干净
- 触发时，从 `~/.profile` 加载环境并验证 Sparkle 和 App Store Connect 变量已配置

## 发布步骤

### 1. 版本和元数据
- 在 `package.json` 中升级版本（格式如 `2026.1.29`）
- 运行 `pnpm plugins:sync` 同步扩展版本
- 更新 CLI 程序和 Baileys 用户代理文件中的版本字符串
- 验证包元数据和二进制映射
- 如果依赖项更改，更新 `pnpm-lock.yaml`

### 2. 构建和工件
- 如果输入更改，通过 `pnpm canvas:a2ui:bundle` 捆绑 A2UI
- 运行 `pnpm run build` 重新生成 dist 文件夹
- 验证 npm 包文件包含所需的 dist 子目录
- 确认 `dist/build-info.json` 包含预期的提交哈希
- 可选使用 `npm pack` 创建 tarball 进行检查

### 3. 变更日志和文档
- 更新 `CHANGELOG.md` 的亮点，保持版本降序
- 确保 README 反映当前 CLI 行为

### 4. 验证
按顺序运行这些命令：
- `pnpm build`、`pnpm check`、`pnpm test`
- `pnpm release:check` 用于 npm pack 验证
- Docker 冒烟测试：`OPENCLAW_INSTALL_SMOKE_SKIP_NONROOT=1 pnpm test:install:smoke`
- 需要 OpenAI/Anthropic API 密钥的可选 E2E 测试

### 5. macOS 应用（Sparkle）
- 构建、签名和压缩 macOS 应用
- 使用 make_appcast 脚本生成 appcast
- 确保 `APP_BUILD` 是"数字 + 单调递增"以实现正确的 Sparkle 版本比较
- 使用 `openclaw-notary` 钥匙串配置文件进行公证

### 6. npm 发布
- 验证干净的 git 状态，提交并推送
- 使用 `npm login` 认证
- 使用 `npm publish --access public` 发布（预发布使用 `--tag beta`）
- 通过 `npm view openclaw version` 验证

### 7. GitHub 发布
- 使用 `git tag vX.Y.Z && git push origin vX.Y.Z` 标记
- 创建标题格式为 `openclaw X.Y.Z` 的发布
- 附加工件：tarball、app zip 和 dSYM zip
- 提交并推送更新的 `appcast.xml`
- 从干净目录验证安装

## 故障排除说明
- 大型 tarball 表示包含了应用包；通过 `package.json` 文件白名单修复
- 认证循环可通过 `NPM_CONFIG_AUTH_TYPE=legacy` 解决
- npx 缓存问题：使用新缓存 `NPM_CONFIG_CACHE=/tmp/npm-cache-$(date +%s)`
- 标签可通过 `git tag -f vX.Y.Z` 强制更新

## 插件发布范围
只有 `@openclaw/*` 范围下的现有 npm 插件会被发布。当前列表包括 11 个插件：bluebubbles、diagnostics-otel、discord、lobster、matrix、msteams、nextcloud-talk、nostr、voice-call、zalo 和 zalouser。

不在 npm 上的捆绑插件保持"仅磁盘树"并在 extensions 目录中发布。发布说明应突出显示默认未启用的新可选捆绑插件。
