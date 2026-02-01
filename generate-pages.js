#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Page definitions with titles and parent categories
// Page definitions with titles and parent categories
const pages = [
    // Start section
    { path: 'start/getting-started.html', title: '快速入门', category: '入门指南', mdPath: 'start/getting-started.md' },
    { path: 'start/wizard.html', title: '向导', category: '入门指南', mdPath: 'start/wizard.md' },
    { path: 'start/pairing.html', title: '配对', category: '入门指南', mdPath: 'start/pairing.md' },
    { path: 'start/setup.html', title: '设置', category: '入门指南', mdPath: 'start/setup.md' },
    { path: 'start/openclaw.html', title: 'OpenClaw 助手设置', category: '入门指南', mdPath: 'start/openclaw.md' },
    { path: 'start/hubs.html', title: '文档中心', category: '入门指南', mdPath: 'start/hubs.md' },
    
    // Gateway section
    { path: 'gateway/configuration.html', title: '网关配置', category: '网关配置', mdPath: 'gateway/configuration.md' },
    { path: 'gateway/configuration-examples.html', title: '配置示例', category: '网关配置', mdPath: 'gateway/configuration-examples.md' },
    { path: 'gateway/security.html', title: '安全', category: '网关配置', mdPath: 'gateway/security.md' },
    { path: 'gateway/remote.html', title: '远程访问', category: '网关配置', mdPath: 'gateway/remote.md' },
    { path: 'gateway/tailscale.html', title: 'Tailscale', category: '网关配置', mdPath: 'gateway/tailscale.md' },
    { path: 'gateway/multiple-gateways.html', title: '多网关', category: '网关配置', mdPath: 'gateway/multiple-gateways.md' },
    { path: 'gateway/discovery.html', title: '发现机制', category: '网关配置', mdPath: 'gateway/discovery.md' },
    { path: 'environment.html', title: '环境变量', category: '网关配置', mdPath: 'environment.md' },
    { path: 'logging.html', title: '日志配置', category: '网关配置', mdPath: 'logging.md' },
    { path: 'network.html', title: '网络配置', category: '网关配置', mdPath: 'network.md' },
    
    // Channels section
    { path: 'channels/whatsapp.html', title: 'WhatsApp', category: '消息渠道', mdPath: 'channels/whatsapp.md' },
    { path: 'channels/telegram.html', title: 'Telegram', category: '消息渠道', mdPath: 'channels/telegram.md' },
    { path: 'channels/discord.html', title: 'Discord', category: '消息渠道', mdPath: 'channels/discord.md' },
    { path: 'channels/mattermost.html', title: 'Mattermost', category: '消息渠道', mdPath: 'channels/mattermost.md' },
    { path: 'channels/imessage.html', title: 'iMessage', category: '消息渠道', mdPath: 'channels/imessage.md' },
    
    // Web section
    { path: 'web/webchat.html', title: 'WebChat', category: 'Web 界面', mdPath: 'web/webchat.md' },
    { path: 'web/control-ui.html', title: '控制界面', category: 'Web 界面', mdPath: 'web/control-ui.md' },
    { path: 'web/dashboard.html', title: '控制台', category: 'Web 界面', mdPath: 'web/dashboard.md' },
    
    // Concepts section
    { path: 'concepts/streaming.html', title: '流式传输', category: '核心概念', mdPath: 'concepts/streaming.md' },
    { path: 'concepts/groups.html', title: '群组', category: '核心概念', mdPath: 'concepts/groups.md' },
    { path: 'concepts/group-messages.html', title: '群组消息', category: '核心概念', mdPath: 'concepts/group-messages.md' },
    { path: 'concepts/multi-agent.html', title: '多代理路由', category: '核心概念', mdPath: 'concepts/multi-agent.md' },
    { path: 'concepts/session.html', title: '会话', category: '核心概念', mdPath: 'concepts/session.md' },
    { path: 'broadcast-groups.html', title: '广播群组', category: '核心概念', mdPath: 'broadcast-groups.md' },
    { path: 'multi-agent-sandbox-tools.html', title: '多代理沙盒', category: '核心概念', mdPath: 'multi-agent-sandbox-tools.md' },
    { path: 'date-time.html', title: '日期时间', category: '核心概念', mdPath: 'date-time.md' },
    
    // Automation section
    { path: 'automation/cron-jobs.html', title: '定时任务', category: '自动化', mdPath: 'automation/cron-jobs.md' },
    { path: 'automation/webhook.html', title: 'Webhooks', category: '自动化', mdPath: 'automation/webhook.md' },
    { path: 'automation/gmail-pubsub.html', title: 'Gmail Pub/Sub', category: '自动化', mdPath: 'automation/gmail-pubsub.md' },
    { path: 'hooks.html', title: '钩子系统', category: '自动化', mdPath: 'hooks.md' },
    
    // Tools section
    { path: 'tools/slash-commands.html', title: '斜杠命令', category: '工具与技能', mdPath: 'tools/slash-commands.md' },
    { path: 'tools/skills.html', title: '技能', category: '工具与技能', mdPath: 'tools/skills.md' },
    { path: 'tools/skills-config.html', title: '技能配置', category: '工具与技能', mdPath: 'tools/skills-config.md' },
    { path: 'tools/web.html', title: 'Web 工具', category: '工具与技能', mdPath: 'tools/web.md' },
    { path: 'brave-search.html', title: 'Brave 搜索', category: '工具与技能', mdPath: 'brave-search.md' },
    { path: 'perplexity.html', title: 'Perplexity', category: '工具与技能', mdPath: 'perplexity.md' },
    
    // Install section
    { path: 'install/updating.html', title: '更新', category: '安装与平台', mdPath: 'install/updating.md' },
    { path: 'install/nix.html', title: 'Nix 模式', category: '安装与平台', mdPath: 'install/nix.md' },
    
    // Platforms section
    { path: 'platforms/macos.html', title: 'macOS', category: '安装与平台', mdPath: 'platforms/macos.md' },
    { path: 'platforms/ios.html', title: 'iOS', category: '安装与平台', mdPath: 'platforms/ios.md' },
    { path: 'platforms/android.html', title: 'Android', category: '安装与平台', mdPath: 'platforms/android.md' },
    { path: 'platforms/windows.html', title: 'Windows (WSL2)', category: '安装与平台', mdPath: 'platforms/windows.md' },
    { path: 'platforms/linux.html', title: 'Linux', category: '安装与平台', mdPath: 'platforms/linux.md' },
    { path: 'northflank.html', title: 'Northflank 部署', category: '安装与平台', mdPath: 'northflank.md' },
    { path: 'bedrock.html', title: 'AWS Bedrock', category: '安装与平台', mdPath: 'bedrock.md' },
    
    // Nodes section
    { path: 'nodes/index.html', title: '节点', category: '节点与媒体', mdPath: 'nodes/index.md' },
    { path: 'nodes/images.html', title: '图片', category: '节点与媒体', mdPath: 'nodes/images.md' },
    { path: 'nodes/audio.html', title: '音频', category: '节点与媒体', mdPath: 'nodes/audio.md' },
    
    // CLI + Debug
    { path: 'cli/index.html', title: 'CLI 参考', category: 'CLI 与调试', mdPath: 'cli/index.md' },
    { path: 'debug/node-issue.html', title: 'Node 问题', category: 'CLI 与调试', mdPath: 'debug/node-issue.md' },
    { path: 'diagnostics/flags.html', title: '诊断标志', category: 'CLI 与调试', mdPath: 'diagnostics/flags.md' },

    // Experiments
    { path: 'experiments/onboarding-config-protocol.html', title: '配置协议', category: '实验性', mdPath: 'experiments/onboarding-config-protocol.md' },

    // Help
    { path: 'help.html', title: '帮助', category: '其他', mdPath: 'help.md' },
];

function getRelativePrefix(filePath) {
    const depth = filePath.split('/').length - 1;
    return depth === 0 ? '' : '../'.repeat(depth);
}

// Parse frontmatter from markdown content
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
        const frontmatter = match[1];
        const body = match[2];
        const metadata = {};
        
        // Parse simple key: value pairs
        const lines = frontmatter.split('\n');
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                metadata[key] = value;
            }
        }
        
        return { metadata, body };
    }
    
    return { metadata: {}, body: content };
}

// Convert markdown to HTML
function markdownToHtml(markdown) {
    // Configure marked
    marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false,
        sanitize: false
    });
    
    return marked(markdown);
}

function generatePage(filePath, title, category, mdContent) {
    const prefix = getRelativePrefix(filePath);
    const fileName = path.basename(filePath);
    
    let contentHtml;
    
    if (mdContent) {
        // Parse frontmatter and convert markdown to HTML
        const { metadata, body } = parseFrontmatter(mdContent);
        contentHtml = markdownToHtml(body);
    } else {
        // Use placeholder if no markdown content
        contentHtml = `
            <p>此页面正在翻译中，即将提供完整的中文文档。</p>
            <p>请稍后再访问以获取更新。</p>
            <p>参考：<a href="https://docs.openclaw.ai/${filePath.replace('.html', '')}" target="_blank">查看原始英文文档</a></p>
        `;
    }
    
    // Generate navigation links with correct relative paths
    const navLinks = `
            <div class="nav-section">
                <span class="nav-section-title">入门指南</span>
                <a href="${prefix}start/getting-started.html">快速入门</a>
                <a href="${prefix}start/wizard.html">向导</a>
                <a href="${prefix}start/pairing.html">配对</a>
                <a href="${prefix}start/setup.html">设置</a>
                <a href="${prefix}start/openclaw.html">OpenClaw 助手</a>
                <a href="${prefix}start/hubs.html">文档中心</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">网关配置</span>
                <a href="${prefix}gateway/configuration.html">配置</a>
                <a href="${prefix}gateway/configuration-examples.html">配置示例</a>
                <a href="${prefix}gateway/security.html">安全</a>
                <a href="${prefix}gateway/remote.html">远程访问</a>
                <a href="${prefix}gateway/tailscale.html">Tailscale</a>
                <a href="${prefix}gateway/multiple-gateways.html">多网关</a>
                <a href="${prefix}gateway/discovery.html">发现机制</a>
                <a href="${prefix}environment.html">环境变量</a>
                <a href="${prefix}logging.html">日志配置</a>
                <a href="${prefix}network.html">网络配置</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">消息渠道</span>
                <a href="${prefix}channels/whatsapp.html">WhatsApp</a>
                <a href="${prefix}channels/telegram.html">Telegram</a>
                <a href="${prefix}channels/discord.html">Discord</a>
                <a href="${prefix}channels/mattermost.html">Mattermost</a>
                <a href="${prefix}channels/imessage.html">iMessage</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">Web 界面</span>
                <a href="${prefix}web/webchat.html">WebChat</a>
                <a href="${prefix}web/control-ui.html">控制界面</a>
                <a href="${prefix}web/dashboard.html">控制台</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">核心概念</span>
                <a href="${prefix}concepts/streaming.html">流式传输</a>
                <a href="${prefix}concepts/groups.html">群组</a>
                <a href="${prefix}concepts/group-messages.html">群组消息</a>
                <a href="${prefix}concepts/multi-agent.html">多代理路由</a>
                <a href="${prefix}concepts/session.html">会话</a>
                <a href="${prefix}broadcast-groups.html">广播群组</a>
                <a href="${prefix}multi-agent-sandbox-tools.html">多代理沙盒</a>
                <a href="${prefix}date-time.html">日期时间</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">自动化</span>
                <a href="${prefix}automation/cron-jobs.html">定时任务</a>
                <a href="${prefix}automation/webhook.html">Webhooks</a>
                <a href="${prefix}automation/gmail-pubsub.html">Gmail Pub/Sub</a>
                <a href="${prefix}hooks.html">钩子系统</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">工具与技能</span>
                <a href="${prefix}tools/slash-commands.html">斜杠命令</a>
                <a href="${prefix}tools/skills.html">技能</a>
                <a href="${prefix}tools/skills-config.html">技能配置</a>
                <a href="${prefix}tools/web.html">Web 工具</a>
                <a href="${prefix}brave-search.html">Brave 搜索</a>
                <a href="${prefix}perplexity.html">Perplexity</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">安装与平台</span>
                <a href="${prefix}install/updating.html">更新</a>
                <a href="${prefix}install/nix.html">Nix 模式</a>
                <a href="${prefix}platforms/macos.html">macOS</a>
                <a href="${prefix}platforms/ios.html">iOS</a>
                <a href="${prefix}platforms/android.html">Android</a>
                <a href="${prefix}platforms/windows.html">Windows (WSL2)</a>
                <a href="${prefix}platforms/linux.html">Linux</a>
                <a href="${prefix}northflank.html">Northflank 部署</a>
                <a href="${prefix}bedrock.html">AWS Bedrock</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">节点与媒体</span>
                <a href="${prefix}nodes/index.html">节点</a>
                <a href="${prefix}nodes/images.html">图片</a>
                <a href="${prefix}nodes/audio.html">音频</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">CLI 与调试</span>
                <a href="${prefix}cli/index.html">CLI 参考</a>
                <a href="${prefix}debug/node-issue.html">Node 问题</a>
                <a href="${prefix}diagnostics/flags.html">诊断标志</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">实验性</span>
                <a href="${prefix}experiments/onboarding-config-protocol.html">配置协议</a>
            </div>
            <div class="nav-section">
                <span class="nav-section-title">其他</span>
                <a href="${prefix}help.html">帮助</a>
            </div>
`;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - OpenClaw 文档</title>
    <link rel="stylesheet" href="${prefix}assets/css/style.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <a href="${prefix}index.html" class="nav-logo">
                <span class="logo-icon">🦞</span>
                <span class="logo-text">OpenClaw 中文文档</span>
            </a>
            <button class="nav-toggle" onclick="toggleNav()">☰</button>
            <div class="nav-links" id="navLinks">
${navLinks}
            </div>
        </div>
    </nav>

    <div class="overlay" onclick="toggleNav()"></div>

    <main class="main-content">
        <div class="content">
            <h1>${title}</h1>
${contentHtml}
        </div>
    </main>

    <script src="${prefix}assets/js/main.js"></script>
</body>
</html>
`;
}

// Create pages
for (const page of pages) {
    const fullPath = path.join(__dirname, page.path);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    // Read markdown content if mdPath is specified
    let mdContent = null;
    if (page.mdPath) {
        const mdFullPath = path.join(__dirname, page.mdPath);
        if (fs.existsSync(mdFullPath)) {
            mdContent = fs.readFileSync(mdFullPath, 'utf-8');
            console.log(`✓ Found markdown: ${page.mdPath}`);
        } else {
            console.log(`✗ Markdown not found: ${page.mdPath}`);
        }
    }
    
    // Generate and write page
    const content = generatePage(page.path, page.title, page.category, mdContent);
    fs.writeFileSync(fullPath, content);
    console.log(`Created: ${page.path}`);
}

console.log('\nAll pages created successfully!');
console.log('\nTranslated pages:');
for (const page of pages) {
    if (page.mdPath) {
        console.log(`  - ${page.path} (${page.mdPath})`);
    }
}
