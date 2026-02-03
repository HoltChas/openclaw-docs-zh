---
summary: "ClawHub 技能注册表"
read_when:
  - 你想发布或安装技能
  - 你需要使用 clawhub CLI
  - 你在管理技能版本
---

# ClawHub

ClawHub 作为"OpenClaw 的公共技能注册表"——一个免费服务，所有技能都可公开分享和重用。技能由包含 `SKILL.md` 文件和支持文本文件的文件夹组成。

**网站：** clawhub.ai

## 核心功能

ClawHub 作为：
- OpenClaw 技能的公共注册表
- 技能包和元数据的版本化存储系统
- 带有搜索、标签和使用指标的发现平台

## 工作流程

1. 用户发布技能包（文件 + 元数据）
2. ClawHub 存储、解析元数据并分配版本
3. 注册表索引技能以供发现
4. 用户可以浏览、下载和安装技能

## CLI 安装

```bash
npm i -g clawhub
```
或
```bash
pnpm add -g clawhub
```

## 关键 CLI 命令

| 命令 | 用途 |
|------|------|
| `clawhub login` | 认证（浏览器流程或 `--token`） |
| `clawhub logout` | 登出 |
| `clawhub whoami` | 检查当前用户 |
| `clawhub search "query"` | 查找技能 |
| `clawhub install <slug>` | 下载技能 |
| `clawhub update <slug>` | 更新特定技能 |
| `clawhub update --all` | 更新所有已安装技能 |
| `clawhub list` | 显示已安装技能 |
| `clawhub publish <path>` | 上传技能 |
| `clawhub sync` | 扫描并发布新/更新的技能 |
| `clawhub delete <slug> --yes` | 移除技能（所有者/管理员） |

## 全局选项

- `--workdir <dir>`：设置工作目录
- `--dir <dir>`：技能目录（默认：`skills`）
- `--site <url>`：站点基础 URL
- `--registry <url>`：注册表 API URL
- `--no-input`：非交互模式
- `-V, --cli-version`：显示版本

## 安全和审核

GitHub 账户必须"至少一周才能发布"以减少滥用。用户可以举报技能，收到超过 3 个独立举报的技能会自动隐藏。审核员有权隐藏、取消隐藏、删除技能或封禁用户。

## 环境变量

- `CLAWHUB_SITE`：覆盖站点 URL
- `CLAWHUB_REGISTRY`：覆盖注册表 API URL
- `CLAWHUB_CONFIG_PATH`：自定义配置位置
- `CLAWHUB_WORKDIR`：覆盖默认工作目录
- `CLAWHUB_DISABLE_TELEMETRY=1`：禁用遥测

## 技术细节

- 技能使用 **semver** 版本控制和变更日志
- `latest` 等标签指向特定版本以支持回滚
- 已安装技能在 `.clawhub/lock.json` 中跟踪
- sync 命令使用内容哈希比较本地内容与注册表版本
- 技能默认安装到 `./skills`，工作区技能优先于内置技能
