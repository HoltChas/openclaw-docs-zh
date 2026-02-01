function toggleNav() {
    const navLinks = document.getElementById('navLinks');
    const overlay = document.querySelector('.overlay');
    
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    } else {
        navLinks.classList.add('active');
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Close nav when clicking on a link (mobile)
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleNav();
            }
        });
    });
});

// Handle escape key to close nav
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const navLinks = document.getElementById('navLinks');
        if (navLinks.classList.contains('active')) {
            toggleNav();
        }
    }
});

// Highlight current page in nav
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    // 移除子目录前缀，只保留路径末尾部分用于匹配
    const currentPage = currentPath.split('/').pop() || currentPath;
    const currentDir = currentPath.split('/').slice(-2)[0] || '';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href') || '';
        // 提取链接的文件名和目录
        const linkParts = linkPath.split('/');
        const linkPage = linkParts.pop() || linkPath;
        const linkDir = linkParts.pop() || '';
        
        // 匹配：同目录下的同名文件
        const isMatch = (linkPage === currentPage) && 
                       (linkDir === '' || linkDir === currentDir || currentPath.includes(linkDir));
        
        if (isMatch) {
            link.style.color = 'var(--accent-primary)';
            link.style.fontWeight = '600';
            // 将当前链接滚动到可视区域
            link.scrollIntoView({ behavior: 'instant', block: 'nearest' });
        }
    });
});
