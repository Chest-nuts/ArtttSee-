/**
 * 页脚功能脚本
 */
document.addEventListener('DOMContentLoaded', function() {
    // 社交媒体图标悬停效果
    const socialIcons = document.querySelectorAll('.social-icon');
    
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'translateY(-3px)';
            icon.style.background = 'linear-gradient(45deg, #6a11cb, #2575fc)';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateY(0)';
            icon.style.background = '#333';
        });
    });
    
    // 获取当前年份并更新版权信息
    const copyrightElement = document.querySelector('.copyright');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        const copyrightText = copyrightElement.textContent;
        
        // 如果版权信息中包含年份，则更新为当前年份
        if (copyrightText.includes('2025')) {
            copyrightElement.textContent = copyrightText.replace('2025', currentYear);
        }
    }
});