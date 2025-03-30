/* ==========================================================================
   筛选器功能脚本
   ========================================================================== */
   document.addEventListener('DOMContentLoaded', function() {
    // 元素选择
    const filterToggle = document.getElementById('filter-toggle');
    const filterPanel = document.getElementById('filter-panel');
    const categoryFilters = document.querySelectorAll('#category-filters .filter-tag');
    const themeFilters = document.querySelectorAll('#theme-filters .filter-tag');
    const badgeFilters = document.querySelectorAll('#badge-filters .filter-tag');
    const sortDropdown = document.getElementById('sort-dropdown');
    const sortDisplay = document.querySelector('.sort-display');
    const sortOptions = document.querySelectorAll('.sort-option');
    const selectedSortText = document.getElementById('selected-sort');
    const resetBtn = document.getElementById('reset-filters');
    const applyBtn = document.getElementById('apply-filters');
    const activeFiltersContainer = document.getElementById('active-filters');
    const bookItems = document.querySelectorAll('.book-grid .book-item');
    const bookGrid = document.querySelector('.book-grid');
    const paginationElement = document.querySelector('.pagination');
    
    // 检查是否所有需要的元素都存在
    if (!filterToggle || !filterPanel) {
        console.warn('筛选器所需的元素不存在，筛选功能不会初始化');
        return; // 提前退出，防止错误
    }
    
    // 在分页之前添加筛选结果信息元素
    if (!document.querySelector('.filter-results-info') && paginationElement) {
        const resultsInfo = document.createElement('div');
        resultsInfo.className = 'filter-results-info';
        paginationElement.parentNode.insertBefore(resultsInfo, paginationElement);
    }
    
    // 存储活动筛选条件
    let activeFilters = {
        category: 'all',
        theme: 'all',
        badge: 'all',
        sort: 'default'
    };
    
    // 保存原始项目顺序，用于恢复默认排序
    const originalItemsOrder = Array.from(bookItems).map((item, index) => ({
        element: item,
        index: index
    }));
    
    // 切换筛选面板的显示和隐藏
    filterToggle.addEventListener('click', function() {
        if (filterPanel.classList.contains('collapsed')) {
            filterPanel.classList.remove('collapsed');
            filterPanel.classList.add('expanded');
            filterToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                关闭筛选选项
            `;
        } else {
            filterPanel.classList.remove('expanded');
            filterPanel.classList.add('collapsed');
            filterToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                展开筛选选项
            `;
        }
    });

    // 分类筛选标签点击事件
    if (categoryFilters) {
        categoryFilters.forEach(tag => {
            tag.addEventListener('click', function() {
                categoryFilters.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                activeFilters.category = this.getAttribute('data-filter');
                updateActiveFiltersDisplay();
            });
        });
    }

    // 主题筛选标签点击事件
    if (themeFilters) {
        themeFilters.forEach(tag => {
            tag.addEventListener('click', function() {
                themeFilters.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                activeFilters.theme = this.getAttribute('data-filter');
                updateActiveFiltersDisplay();
            });
        });
    }

    // 徽章筛选标签点击事件
    if (badgeFilters) {
        badgeFilters.forEach(tag => {
            tag.addEventListener('click', function() {
                badgeFilters.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                activeFilters.badge = this.getAttribute('data-filter');
                updateActiveFiltersDisplay();
            });
        });
    }

    // 排序下拉菜单事件
    if (sortDisplay && sortDropdown) {
        sortDisplay.addEventListener('click', function(event) {
            event.stopPropagation();
            sortDropdown.classList.toggle('open');
        });

        // 点击其他地方关闭排序下拉菜单
        document.addEventListener('click', function(event) {
            if (!sortDropdown.contains(event.target)) {
                sortDropdown.classList.remove('open');
            }
        });
    }

    // 排序选项点击事件
    if (sortOptions && selectedSortText) {
        sortOptions.forEach(option => {
            option.addEventListener('click', function() {
                sortOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                
                const sortValue = this.getAttribute('data-sort');
                activeFilters.sort = sortValue;
                selectedSortText.textContent = this.textContent;
                
                if (sortDropdown) sortDropdown.classList.remove('open');
                updateActiveFiltersDisplay();
            });
        });
    }

    // 重置按钮点击事件
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // 重置所有筛选标签
            if (categoryFilters) {
                categoryFilters.forEach(t => t.classList.remove('active'));
                const allCategoryFilter = document.querySelector('#category-filters [data-filter="all"]');
                if (allCategoryFilter) allCategoryFilter.classList.add('active');
            }
            
            if (themeFilters) {
                themeFilters.forEach(t => t.classList.remove('active'));
                const allThemeFilter = document.querySelector('#theme-filters [data-filter="all"]');
                if (allThemeFilter) allThemeFilter.classList.add('active');
            }
            
            if (badgeFilters) {
                badgeFilters.forEach(t => t.classList.remove('active'));
                const allBadgeFilter = document.querySelector('#badge-filters [data-filter="all"]');
                if (allBadgeFilter) allBadgeFilter.classList.add('active');
            }
            
            // 重置排序
            if (sortOptions) {
                sortOptions.forEach(o => o.classList.remove('selected'));
                const defaultSortOption = document.querySelector('.sort-option[data-sort="default"]');
                if (defaultSortOption) defaultSortOption.classList.add('selected');
            }
            
            if (selectedSortText) selectedSortText.textContent = '默认排序';
            
            // 重置活动筛选器
            activeFilters = {
                category: 'all',
                theme: 'all',
                badge: 'all',
                sort: 'default'
            };
            
            // 清空活动筛选器显示
            updateActiveFiltersDisplay();
            
            // 重置筛选项目计数
            window.filteredItemsCount = null;
            
            // 应用筛选
            applyFilters();
            
            // 显示操作成功的提示
            showNotification('筛选条件已重置');
        });
    }

    // 应用按钮点击事件
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            // 关闭筛选面板
            filterPanel.classList.remove('expanded');
            filterPanel.classList.add('collapsed');
            filterToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                展开筛选选项
            `;
            
            // 应用筛选
            applyFilters();
            
            // 显示操作成功的提示
            showNotification('筛选条件已应用');
        });
    }
    
    // 应用筛选功能
    function applyFilters() {
        // 移除现有的"无结果"消息
        const existingNoResults = document.querySelector('.no-results');
        if (existingNoResults) {
            existingNoResults.parentNode.removeChild(existingNoResults);
        }
        
        let visibleItems = 0;
        let filteredItems = [];
        
        // 遍历所有项目应用筛选条件
        bookItems.forEach(item => {
            const category = item.getAttribute('data-category') || '';
            const theme = item.getAttribute('data-theme') || '';
            const badge = item.getAttribute('data-badge') || '';
            
            // 检查是否符合筛选条件
            const categoryMatch = activeFilters.category === 'all' || category.includes(activeFilters.category);
            const themeMatch = activeFilters.theme === 'all' || theme.includes(activeFilters.theme);
            const badgeMatch = activeFilters.badge === 'all' || badge === activeFilters.badge;
            
            // 应用筛选效果
            if (categoryMatch && themeMatch && badgeMatch) {
                item.style.display = 'flex';
                visibleItems++;
                filteredItems.push(item);
                
                // 添加动画效果
                item.classList.remove('filtered-out');
                item.classList.add('filtered-in');
            } else {
                item.style.display = 'none';
                item.classList.remove('filtered-in');
                item.classList.add('filtered-out');
            }
        });
        
        // 应用排序
        if (activeFilters.sort !== 'default' && filteredItems.length > 0) {
            applySort(filteredItems);
        } else if (activeFilters.sort === 'default') {
            // 恢复原始顺序
            restoreOriginalOrder();
        }
        
        // 更新筛选结果信息
        updateFilterResultsInfo(visibleItems);
        
        // 如果没有符合条件的项目，显示提示信息
        if (visibleItems === 0) {
            showNoResultsMessage();
            
            // 隐藏分页
            if (paginationElement) {
                paginationElement.style.display = 'none';
            }
        } else {
            // 显示分页
            if (paginationElement) {
                paginationElement.style.display = 'flex';
            }
            
            // 关键修改：设置全局变量存储筛选后的项目数量
            window.filteredItemsCount = visibleItems;
            console.log(`筛选后项目数量: ${visibleItems}`);
            
            // 调用分页功能
            if (typeof showPage === 'function') {
                // 重置到第一页
                currentPage = 1;
                showPage(1);
                if (typeof updatePageButtons === 'function') {
                    updatePageButtons();
                }
            }
        }
    }
    
    // 应用排序
    function applySort(items) {
        // 根据排序类型排序项目
        switch (activeFilters.sort) {
            case 'newest':
                // 这里假设是逆序排列（较新的在前面）
                items.sort((a, b) => {
                    return originalItemsOrder.find(item => item.element === b).index - 
                           originalItemsOrder.find(item => item.element === a).index;
                });
                break;
            case 'popular':
                // 这里使用一个简单的热门度规则：有徽章的排在前面
                items.sort((a, b) => {
                    const aBadge = a.getAttribute('data-badge');
                    const bBadge = b.getAttribute('data-badge');
                    if (aBadge && !bBadge) return -1;
                    if (!aBadge && bBadge) return 1;
                    return 0;
                });
                break;
            case 'name-asc':
                items.sort((a, b) => {
                    const aName = a.querySelector('h2').textContent;
                    const bName = b.querySelector('h2').textContent;
                    return aName.localeCompare(bName, 'zh-CN');
                });
                break;
            case 'name-desc':
                items.sort((a, b) => {
                    const aName = a.querySelector('h2').textContent;
                    const bName = b.querySelector('h2').textContent;
                    return bName.localeCompare(aName, 'zh-CN');
                });
                break;
        }
        
        // 将排序后的项目重新添加到DOM中
        if (bookGrid) {
            items.forEach(item => {
                bookGrid.appendChild(item);
            });
        }
    }
    
    // 恢复原始项目顺序
    function restoreOriginalOrder() {
        if (bookGrid) {
            originalItemsOrder.sort((a, b) => a.index - b.index)
                .forEach(item => {
                    bookGrid.appendChild(item.element);
                });
        }
    }
    
    // 更新筛选结果信息
    function updateFilterResultsInfo(count) {
        const resultsInfo = document.querySelector('.filter-results-info');
        if (!resultsInfo) return;
        
        if (activeFilters.category === 'all' && activeFilters.theme === 'all' && 
            activeFilters.badge === 'all' && activeFilters.sort === 'default') {
            resultsInfo.classList.remove('show');
            resultsInfo.textContent = '';
            return;
        }
        
        let filterText = '筛选条件: ';
        
        if (activeFilters.category !== 'all') {
            filterText += `分类(${activeFilters.category}) `;
        }
        
        if (activeFilters.theme !== 'all') {
            filterText += `风格(${activeFilters.theme}) `;
        }
        
        if (activeFilters.badge !== 'all') {
            filterText += `标签(${activeFilters.badge}) `;
        }
        
        if (activeFilters.sort !== 'default') {
            const sortOption = document.querySelector(`.sort-option[data-sort="${activeFilters.sort}"]`);
            const sortText = sortOption ? sortOption.textContent : activeFilters.sort;
            filterText += `排序(${sortText})`;
        }
        
        resultsInfo.textContent = `${filterText} - 找到 ${count} 个结果`;
        resultsInfo.classList.add('show');
    }
    
    // 显示无结果提示
    function showNoResultsMessage() {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <h3>未找到匹配的设定集</h3>
            <p>请尝试调整筛选条件或使用不同的关键词搜索</p>
            <button id="reset-all-filters">重置所有筛选</button>
        `;
        
        bookGrid.appendChild(noResults);
        
        // 添加重置所有筛选的点击事件
        const resetAllBtn = document.getElementById('reset-all-filters');
        if (resetAllBtn && resetBtn) {
            resetAllBtn.addEventListener('click', function() {
                resetBtn.click();
            });
        }
    }

    // 更新活动筛选器显示
    function updateActiveFiltersDisplay() {
        if (!activeFiltersContainer) return;
        
        activeFiltersContainer.innerHTML = '';
        
        // 添加分类筛选标签
        if (activeFilters.category !== 'all') {
            addActiveFilterTag('分类', activeFilters.category);
        }
        
        // 添加主题筛选标签
        if (activeFilters.theme !== 'all') {
            addActiveFilterTag('风格', activeFilters.theme);
        }
        
        // 添加徽章筛选标签
        if (activeFilters.badge !== 'all') {
            addActiveFilterTag('标签', activeFilters.badge);
        }
        
        // 添加排序筛选标签
        if (activeFilters.sort !== 'default') {
            const sortOption = document.querySelector(`.sort-option[data-sort="${activeFilters.sort}"]`);
            const sortText = sortOption ? sortOption.textContent : activeFilters.sort;
            addActiveFilterTag('排序', sortText);
        }
    }

    // 添加活动筛选标签
    function addActiveFilterTag(type, value) {
        const filterTag = document.createElement('div');
        filterTag.className = 'active-filter';
        filterTag.innerHTML = `
            <span>${type}: ${value}</span>
            <span class="filter-remove" data-type="${type}">×</span>
        `;
        
        // 为移除按钮添加点击事件
        const removeBtn = filterTag.querySelector('.filter-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                
                // 重置对应的筛选器
                if (type === '分类') {
                    activeFilters.category = 'all';
                    if (categoryFilters) {
                        categoryFilters.forEach(t => t.classList.remove('active'));
                        const allCategoryFilter = document.querySelector('#category-filters [data-filter="all"]');
                        if (allCategoryFilter) allCategoryFilter.classList.add('active');
                    }
                } else if (type === '风格') {
                    activeFilters.theme = 'all';
                    if (themeFilters) {
                        themeFilters.forEach(t => t.classList.remove('active'));
                        const allThemeFilter = document.querySelector('#theme-filters [data-filter="all"]');
                        if (allThemeFilter) allThemeFilter.classList.add('active');
                    }
                } else if (type === '标签') {
                    activeFilters.badge = 'all';
                    if (badgeFilters) {
                        badgeFilters.forEach(t => t.classList.remove('active'));
                        const allBadgeFilter = document.querySelector('#badge-filters [data-filter="all"]');
                        if (allBadgeFilter) allBadgeFilter.classList.add('active');
                    }
                } else if (type === '排序') {
                    activeFilters.sort = 'default';
                    if (sortOptions) {
                        sortOptions.forEach(o => o.classList.remove('selected'));
                        const defaultSortOption = document.querySelector('.sort-option[data-sort="default"]');
                        if (defaultSortOption) defaultSortOption.classList.add('selected');
                    }
                    if (selectedSortText) selectedSortText.textContent = '默认排序';
                }
                
                // 更新活动筛选器显示
                updateActiveFiltersDisplay();
                
                // 应用筛选
                applyFilters();
            });
        }
        
        activeFiltersContainer.appendChild(filterTag);
    }

    // 显示操作通知
    function showNotification(message) {
        // 检查是否已存在通知元素
        let notification = document.querySelector('.filter-notification');
        
        // 如果不存在则创建
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'filter-notification';
            document.body.appendChild(notification);
        }
        
        // 更新消息内容
        notification.textContent = message;
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动消失
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // 为项目添加使用data属性的徽章
    bookItems.forEach(item => {
        const badge = item.getAttribute('data-badge');
        if (badge) {
            if (!item.querySelector('.book-badge')) {
                const badgeElement = document.createElement('div');
                badgeElement.className = 'book-badge';
                badgeElement.textContent = badge;
                
                // 根据徽章类型设置不同背景色
                if (badge === '热门') {
                    badgeElement.style.background = 'linear-gradient(45deg, #FF416C, #FF4B2B)';
                } else if (badge === '新品') {
                    badgeElement.style.background = 'linear-gradient(45deg, #11998e, #38ef7d)';
                } else if (badge === '推荐') {
                    badgeElement.style.background = 'linear-gradient(45deg, #6a11cb, #2575fc)';
                } else if (badge === '限时') {
                    badgeElement.style.background = 'linear-gradient(45deg, #FF9500, #FF5E3A)';
                } else if (badge === '独家') {
                    badgeElement.style.background = 'linear-gradient(45deg, #8B00FF, #5D3FD3)';
                }
                
                item.style.position = 'relative'; // 确保徽章定位正确
                item.appendChild(badgeElement);
            }
        }
    });
});