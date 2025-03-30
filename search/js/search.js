/*
 * 搜索结果页面主体功能
 */
// 是有模拟加载延迟的，你做后端可以删掉这部分，目前只是一个框架，我看看丑不丑
document.addEventListener('DOMContentLoaded', function() {
    // ===== 搜索功能 =====
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const searchKeywordSpans = document.querySelectorAll('.search-keyword');
    const resultCountSpan = document.querySelector('.result-count');
    
    // 搜索按钮点击处理
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            executeSearch();
        });
    }
    
    // 搜索框回车处理
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                executeSearch();
            }
        });
    }
    
    // 执行搜索
    function executeSearch() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            // 在真实环境中，这里会是一个AJAX请求到后端
            // 这里只是模拟搜索行为
            simulateSearch(keyword);
        }
    }
    
    // 模拟搜索结果
    function simulateSearch(keyword) {
        // 更新关键词显示
        searchKeywordSpans.forEach(span => {
            span.textContent = keyword;
        });
        
        // 模拟不同的结果数
        const resultCount = Math.floor(Math.random() * 30) + 1;
        if (resultCountSpan) {
            resultCountSpan.textContent = resultCount;
        }
        
        // 选择性显示无结果区域
        const cardsContainer = document.querySelector('.card-container');
        const noResultsSection = document.querySelector('.no-results');
        const viewMoreContainer = document.querySelector('.view-more-container');
        
        if (resultCount === 0 && noResultsSection && cardsContainer) {
            cardsContainer.style.display = 'none';
            noResultsSection.style.display = 'block';
            if (viewMoreContainer) viewMoreContainer.style.display = 'none';
        } else if (noResultsSection && cardsContainer) {
            cardsContainer.style.display = '';
            noResultsSection.style.display = 'none';
            if (viewMoreContainer) viewMoreContainer.style.display = '';
        }
        
        // 将搜索词添加到历史记录
        addToSearchHistory(keyword);
        
        // 更新高亮显示
        updateHighlights(keyword);
    }
    
    // 更新搜索结果中的高亮显示
    function updateHighlights(keyword) {
        // 获取所有卡片
        const cards = document.querySelectorAll('.card');
        
        // 拆分关键词便于匹配
        const keywordParts = keyword.split(/\s+/).filter(part => part.length > 0);
        
        // 优先匹配标题
        cards.forEach(card => {
            const title = card.querySelector('.card-title');
            const description = card.querySelector('.card-description');
            
            // 重置标题和描述，移除之前的高亮
            if (title) {
                title.innerHTML = title.textContent;
            }
            
            if (description) {
                description.innerHTML = description.textContent;
            }
            
            // 对标题进行高亮处理
            if (title) {
                let titleText = title.innerHTML;
                keywordParts.forEach(part => {
                    const regex = new RegExp(`(${part})`, 'gi');
                    titleText = titleText.replace(regex, '<mark>$1</mark>');
                });
                title.innerHTML = titleText;
            }
            
            // 对描述进行高亮处理
            if (description) {
                let descText = description.innerHTML;
                keywordParts.forEach(part => {
                    const regex = new RegExp(`(${part})`, 'gi');
                    descText = descText.replace(regex, '<mark>$1</mark>');
                });
                description.innerHTML = descText;
            }
        });
    }
    
    // ===== 视图切换 =====
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    const cardContainer = document.querySelector('.card-container');
    
    if (viewToggleBtns.length && cardContainer) {
        viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 移除所有按钮的active类
                viewToggleBtns.forEach(b => b.classList.remove('active'));
                
                // 为当前按钮添加active类
                this.classList.add('active');
                
                // 获取视图类型
                const viewType = this.getAttribute('data-view');
                
                // 移除容器的所有视图类
                cardContainer.classList.remove('grid-view', 'list-view');
                
                // 添加当前视图类
                cardContainer.classList.add(`${viewType}-view`);
                
                // 保存用户偏好
                localStorage.setItem('preferred-view', viewType);
            });
        });
        
        // 从本地存储加载用户偏好的视图
        const preferredView = localStorage.getItem('preferred-view') || 'grid';
        const preferredBtn = document.querySelector(`.view-toggle-btn[data-view="${preferredView}"]`);
        
        if (preferredBtn) {
            preferredBtn.click();
        }
    }
    
    // ===== 加载更多功能 =====
    const viewMoreBtn = document.querySelector('.view-more-btn');
    let currentPage = 1;
    
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 模拟加载下一页内容
            currentPage++;
            
            // 这里应该是AJAX请求获取新数据
            // 为了演示，我们复制现有卡片
            const cards = document.querySelectorAll('.card');
            const container = document.querySelector('.card-container');
            
            if (cards.length > 0 && container) {
                // 模拟加载延迟
                viewMoreBtn.textContent = '加载中...';
                viewMoreBtn.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    // 复制现有卡片并添加到容器中
                    cards.forEach(card => {
                        const clone = card.cloneNode(true);
                        container.appendChild(clone);
                        
                        // 为新卡片添加悬停效果
                        clone.addEventListener('mouseenter', () => {
                            clone.style.transform = 'translateY(-10px)';
                            clone.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
                        });
                        
                        clone.addEventListener('mouseleave', () => {
                            clone.style.transform = 'translateY(0)';
                            clone.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
                        });
                    });
                    
                    // 恢复按钮状态
                    viewMoreBtn.textContent = '加载更多';
                    viewMoreBtn.style.pointerEvents = 'auto';
                    
                    // 如果页数达到3，隐藏加载更多按钮
                    if (currentPage >= 3) {
                        viewMoreBtn.style.display = 'none';
                    }
                }, 800);
            }
        });
    }
    
    // ===== 搜索历史功能 =====
    const historyList = document.querySelector('.history-list');
    const clearHistoryBtn = document.querySelector('.clear-history');
    
    // 添加到搜索历史
    function addToSearchHistory(keyword) {
        if (!historyList) return;
        
        // 获取现有历史记录
        let searchHistory = JSON.parse(localStorage.getItem('search-history') || '[]');
        
        // 检查是否已经存在
        const existingIndex = searchHistory.findIndex(item => item.text === keyword);
        
        // 如果存在，删除旧记录
        if (existingIndex !== -1) {
            searchHistory.splice(existingIndex, 1);
        }
        
        // 添加新记录到开头
        searchHistory.unshift({
            text: keyword,
            time: new Date().getTime()
        });
        
        // 限制历史记录数量
        if (searchHistory.length > 10) {
            searchHistory = searchHistory.slice(0, 10);
        }
        
        // 保存到本地存储
        localStorage.setItem('search-history', JSON.stringify(searchHistory));
        
        // 更新显示
        updateSearchHistoryDisplay();
    }
    
    // 更新搜索历史显示
    function updateSearchHistoryDisplay() {
        if (!historyList) return;
        
        // 获取历史记录
        const searchHistory = JSON.parse(localStorage.getItem('search-history') || '[]');
        
        // 清空当前显示
        historyList.innerHTML = '';
        
        // 显示历史记录
        searchHistory.forEach(item => {
            const historyItem = document.createElement('a');
            historyItem.className = 'history-item';
            historyItem.href = `?q=${encodeURIComponent(item.text)}`;
            
            // 计算时间差显示
            const timeDisplay = getTimeAgo(item.time);
            
            historyItem.innerHTML = `
                <span class="history-text">${item.text}</span>
                <span class="history-time">${timeDisplay}</span>
            `;
            
            // 点击历史项时自动填充搜索框并执行搜索
            historyItem.addEventListener('click', function(e) {
                e.preventDefault();
                if (searchInput) {
                    searchInput.value = item.text;
                    executeSearch();
                }
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    // 计算时间差显示
    function getTimeAgo(timestamp) {
        const now = new Date().getTime();
        const diff = now - timestamp;
        
        // 小于1分钟
        if (diff < 60 * 1000) {
            return '刚刚';
        }
        
        // 小于1小时
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes}分钟前`;
        }
        
        // 小于24小时
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `${hours}小时前`;
        }
        
        // 小于7天
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            const days = Math.floor(diff / (24 * 60 * 60 * 1000));
            return days === 1 ? '昨天' : `${days}天前`;
        }
        
        // 大于7天显示日期
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
    
    // 清除历史记录
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            localStorage.removeItem('search-history');
            updateSearchHistoryDisplay();
        });
    }
    
    // 初始化搜索历史显示
    updateSearchHistoryDisplay();
    
    // ===== 卡片悬停效果 =====
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
    });
    
    // ===== 相关搜索标签点击 =====
    const relatedTags = document.querySelectorAll('.related-tag');
    
    relatedTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取标签文本
            const tagText = this.textContent.trim();
            
            // 填充搜索框
            if (searchInput) {
                searchInput.value = tagText;
                
                // 执行搜索
                executeSearch();
                
                // 滚动到顶部
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== 初始化 =====
    // 从URL获取搜索参数并自动执行搜索
    function initFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('q');
        
        if (queryParam && searchInput) {
            searchInput.value = queryParam;
            executeSearch();
        }
    }
    
    // 初始化时从URL读取搜索词
    initFromURL();
});