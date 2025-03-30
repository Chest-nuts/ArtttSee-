
document.addEventListener('DOMContentLoaded', function() {
    // ===== 卡片折叠与展开功能 =====
    const contentSections = document.querySelectorAll('.content-section');
    const cardsPerPage = 8; // 默认显示的卡片数量，就是只显示多少卡片的，该长城8就只显示8
    
    // 处理每个内容区块
    contentSections.forEach(section => {
        const cardContainer = section.querySelector('.card-container');
        const viewMoreBtn = section.querySelector('.view-more-btn');
        const cards = cardContainer.querySelectorAll('.card');
        
        // 只有当卡片数量超过设定值时才进行折叠
        if (cards.length > cardsPerPage) {
            // 初始化时隐藏超出部分的卡片
            for (let i = cardsPerPage; i < cards.length; i++) {
                cards[i].style.display = 'none';
            }
            
            // 显示"查看更多"按钮
            if (viewMoreBtn) {
                viewMoreBtn.style.display = 'inline-block';
                
                // 点击"查看更多"按钮时展开所有卡片
                viewMoreBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // 展开所有卡片
                    for (let i = cardsPerPage; i < cards.length; i++) {
                        cards[i].style.display = 'flex';
                        // 添加渐入动画
                        cards[i].style.opacity = '0';
                        cards[i].style.transform = 'translateY(20px)';
                        
                        // 使用setTimeout创建错开的动画效果
                        setTimeout(() => {
                            cards[i].style.opacity = '1';
                            cards[i].style.transform = 'translateY(0)';
                            cards[i].style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        }, (i - cardsPerPage) * 100);
                    }
                    
                    // 隐藏"查看更多"按钮，因为不再需要它
                    viewMoreBtn.style.display = 'none';
                    
                    // 平滑滚动到最后一个可见卡片
                    setTimeout(() => {
                        // 因为可能需要等待卡片显示出来
                        const lastVisibleCard = cards[cardsPerPage];
                        if (lastVisibleCard) {
                            lastVisibleCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }, 100);
                });
            }
        } else {
            // 如果卡片数量不足，隐藏"查看更多"按钮
            if (viewMoreBtn) {
                viewMoreBtn.style.display = 'none';
            }
        }
    });
    
    // ===== 为查看更多按钮添加悬停效果 =====
    const viewMoreBtns = document.querySelectorAll('.view-more-btn');
    viewMoreBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-3px)';
            btn.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '';
        });
    });
    
    // ===== 图片懒加载初始化 =====
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    // 检查浏览器是否原生支持懒加载
    if ('loading' in HTMLImageElement.prototype) {
        // 浏览器支持原生懒加载，无需额外处理
        console.log('浏览器支持原生懒加载');
    } else {
        // 浏览器不支持原生懒加载，使用Intersection Observer实现
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src') || img.getAttribute('src');
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }
                        
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // 回退方案 - 简单延迟加载所有图片
            setTimeout(() => {
                lazyImages.forEach(img => {
                    const src = img.getAttribute('data-src') || img.getAttribute('src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                });
            }, 1000);
        }
    }
    
    // ===== 卡片特效增强 =====
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        // 卡片移入时添加阴影效果
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
        });
        
        // 卡片移出时恢复原始状态
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
        });
        
        // 卡片点击效果
        card.addEventListener('click', (e) => {
            // 如果点击的是链接、按钮等元素，不执行卡片点击效果
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                return;
            }
            
            // 可以在这里添加卡片点击后的跳转或弹窗等功能
            // 例如：window.location.href = card.getAttribute('data-url') 或显示详情弹窗
        });
    });
    
    // ===== 监听窗口大小变化，调整布局 =====
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        // 使用防抖动技术，避免频繁触发
        clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
            // 在这里可以添加响应式相关的逻辑
        }, 200); // 200毫秒延迟执行，减少频繁触发
    });
});
