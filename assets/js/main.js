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
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && currentPath.includes(linkPath)) {
            link.style.color = 'var(--accent-primary)';
            link.style.fontWeight = '600';
        }
    });
});
