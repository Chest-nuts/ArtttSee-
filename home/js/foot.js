/**
 * 页脚相关的JavaScript功能 - 添加平滑过渡动画
 */
document.addEventListener('DOMContentLoaded', function() {
    // 为社交媒体图标添加悬停动画效果
    const socialIcons = document.querySelectorAll('.social-icon');
    
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'translateY(-5px) rotate(5deg)';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateY(0) rotate(0)';
        });
    });
    
    // 为页脚链接添加平滑过渡动画
    const footerLinks = document.querySelectorAll('.footer-column a');
    
    footerLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.paddingLeft = '5px';
            link.style.color = '#ffffff';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.paddingLeft = '0';
            link.style.color = '';
        });
    });
    
    // 动态设置当前年份（如果版权信息需要显示当前年份）
    const copyrightElement = document.querySelector('.copyright');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        const copyrightText = copyrightElement.innerHTML;
        const updatedText = copyrightText.replace(/\d{4}/, currentYear);
        copyrightElement.innerHTML = updatedText;
    }
    
    // 响应式布局调整
    function adjustFooterLayout() {
        const footerColumns = document.querySelectorAll('.footer-column');
        const viewportWidth = window.innerWidth;
        
        if (viewportWidth <= 768) {
            // 在移动设备上添加折叠功能和动画
            footerColumns.forEach(column => {
                const heading = column.querySelector('h3');
                const linksContainer = document.createElement('div');
                const links = column.querySelectorAll('a');
                
                // 如果已经处理过这个列，就不再处理
                if (column.querySelector('.footer-links-container')) {
                    return;
                }
                
                // 创建一个容器来包裹所有链接，方便添加动画
                linksContainer.className = 'footer-links-container';
                linksContainer.style.overflow = 'hidden';
                linksContainer.style.transition = 'height 0.3s ease, opacity 0.3s ease, transform 0.3s ease';
                linksContainer.style.height = '0';
                linksContainer.style.opacity = '0';
                linksContainer.style.transform = 'translateY(-10px)';
                
                // 将所有链接移到新容器中
                links.forEach(link => {
                    column.removeChild(link);
                    linksContainer.appendChild(link);
                    link.style.display = 'block'; // 确保链接可见但容器隐藏
                    link.style.transform = 'translateX(0)';
                    link.style.transition = 'transform 0.3s ease';
                });
                
                // 将链接容器添加到列中
                column.appendChild(linksContainer);
                
                if (heading) {
                    // 清除之前可能添加的事件监听器
                    heading.removeEventListener('click', toggleColumnLinks);
                    
                    // 将列引用存储在标题元素上
                    heading.columnRef = column;
                    
                    // 添加新的事件监听器
                    heading.addEventListener('click', toggleColumnLinks);
                    
                    // 添加视觉提示（比如 + 号）
                    if (!heading.querySelector('.toggle-indicator')) {
                        const indicator = document.createElement('span');
                        indicator.className = 'toggle-indicator';
                        indicator.textContent = ' +';
                        heading.appendChild(indicator);
                    }
                    
                    // 添加指针样式和过渡效果
                    heading.style.cursor = 'pointer';
                    heading.style.transition = 'color 0.3s ease';
                }
            });
        } else {
            // 在桌面设备上移除折叠功能和动画容器
            footerColumns.forEach(column => {
                const heading = column.querySelector('h3');
                const linksContainer = column.querySelector('.footer-links-container');
                
                if (heading) {
                    const indicator = heading.querySelector('.toggle-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                    
                    heading.style.cursor = 'default';
                    heading.removeEventListener('click', toggleColumnLinks);
                }
                
                // 如果存在链接容器，将链接移回列并移除容器
                if (linksContainer) {
                    const links = linksContainer.querySelectorAll('a');
                    links.forEach(link => {
                        linksContainer.removeChild(link);
                        column.appendChild(link);
                        link.style.display = 'block';
                        link.style.transform = '';
                    });
                    column.removeChild(linksContainer);
                }
            });
        }
    }
    
    // 切换栏目链接的展开/折叠（带动画效果）
    function toggleColumnLinks(event) {
        const heading = event.currentTarget;
        const column = heading.columnRef;
        const linksContainer = column.querySelector('.footer-links-container');
        const indicator = heading.querySelector('.toggle-indicator');
        const links = linksContainer.querySelectorAll('a');
        
        // 检查当前是展开还是折叠状态
        const isCollapsed = linksContainer.style.height === '0px' || linksContainer.style.height === '';
        
        if (isCollapsed) {
            // 展开链接
            
            // 首先设置内容高度为 "auto"，以便计算实际高度
            linksContainer.style.height = 'auto';
            const autoHeight = linksContainer.offsetHeight;
            
            // 然后设回0高度，并强制重绘
            linksContainer.style.height = '0px';
            void linksContainer.offsetHeight; // 触发重绘
            
            // 然后开始动画展开到实际高度
            linksContainer.style.height = autoHeight + 'px';
            linksContainer.style.opacity = '1';
            linksContainer.style.transform = 'translateY(0)';
            
            // 链接逐个动画显示
            links.forEach((link, index) => {
                setTimeout(() => {
                    link.style.transform = 'translateX(0)';
                }, index * 50);
            });
            
            // 更新图标
            if (indicator) {
                indicator.textContent = ' -';
            }
            
            // 高亮标题
            heading.style.color = '#ffffff';
            heading.classList.add('active');
            
            // 动画完成后设置为auto，以便适应内容变化
            setTimeout(() => {
                linksContainer.style.height = 'auto';
            }, 300); // 与过渡时间相同
            
        } else {
            // 折叠链接
            
            // 先设置为实际高度，以便流畅过渡
            const currentHeight = linksContainer.offsetHeight;
            linksContainer.style.height = currentHeight + 'px';
            void linksContainer.offsetHeight; // 触发重绘
            
            // 链接逐个动画隐藏
            links.forEach((link, index) => {
                setTimeout(() => {
                    link.style.transform = 'translateX(-10px)';
                }, index * 30);
            });
            
            // 然后开始动画折叠
            setTimeout(() => {
                linksContainer.style.height = '0px';
                linksContainer.style.opacity = '0';
                linksContainer.style.transform = 'translateY(-10px)';
            }, 50);
            
            // 更新图标
            if (indicator) {
                indicator.textContent = ' +';
            }
            
            // 恢复标题颜色
            heading.style.color = '';
            heading.classList.remove('active');
        }
    }
    
    // 初始调整布局
    adjustFooterLayout();
    
    // 窗口大小变化时重新调整
    window.addEventListener('resize', adjustFooterLayout);
});