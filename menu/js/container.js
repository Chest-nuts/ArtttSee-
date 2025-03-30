document.addEventListener('DOMContentLoaded', function () {
    /* ==========================================================================
       变量定义区域
       ========================================================================== */
    // 导航栏相关元素
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navList = document.querySelector('#nav-list');
    const navLinks = document.querySelectorAll('#nav-list li a');
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const nav = document.querySelector('nav');
    
    // 电子书网格和分页相关元素
    const bookItems = document.querySelectorAll('.book-item');
    const bookGrid = document.querySelector('.book-grid');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageNumbersContainer = document.getElementById('page-numbers');
    const jumpToPageInput = document.getElementById('jump-to-page');
    const jumpButton = document.getElementById('jump-button');
    
    // 配置参数
    const itemsPerPage = 8; // 设置每页显示8个容器，可以根据需要调整
    let currentPage = 1; // 当前页码
    
    // 创建页面指示器
    let pageIndicator = document.querySelector('.page-indicator');
    if (!pageIndicator) {
        pageIndicator = createPageIndicator();
    }
    
    console.log(`总项目数: ${bookItems.length}, 每页显示: ${itemsPerPage}`);

    /* ==========================================================================
       导航栏功能区域
       ========================================================================== */
    
    // 汉堡菜单点击事件
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function () {
            navList.classList.toggle('show');
            hamburgerMenu.classList.toggle('active');
        });
    }
    
    // 点击导航链接关闭移动导航菜单
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    navList.classList.remove('show');
                    hamburgerMenu.classList.remove('active');
                }
            });
        });
    }
    
    // 搜索框焦点效果
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 0 2px rgba(37, 117, 252, 0.3)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = 'none';
        });
    }
    
    // 搜索功能
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            performSearch();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // 搜索功能实现
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // 过滤出匹配的项目
            const matchedItems = Array.from(bookItems).filter(item => {
                const title = item.querySelector('h2').textContent.toLowerCase();
                const description = item.querySelector('p').textContent.toLowerCase();
                return title.includes(searchTerm.toLowerCase()) || 
                       description.includes(searchTerm.toLowerCase());
            });
            
            // 隐藏所有项目
            bookItems.forEach(item => {
                item.style.display = 'none';
            });
            
            // 显示匹配的项目
            matchedItems.forEach((item, index) => {
                if (index < itemsPerPage) { // 只显示每页数量的项目
                    item.style.display = 'flex';
                    // 重置动画状态，保证视图动画触发
                    item.style.animation = 'none';
                    item.offsetHeight; // 触发重绘
                    item.style.animation = '';
                }
            });
            
            // 设置筛选后的项目数量
            window.filteredItemsCount = matchedItems.length;
            
            // 更新页面指示器
            if (pageIndicator) {
                pageIndicator.textContent = `搜索结果: ${matchedItems.length} 项`;
            }
            
            // 如果搜索结果为空，显示提示
            if (matchedItems.length === 0) {
                const noResults = document.createElement('div');
                noResults.style.gridColumn = '1 / -1';
                noResults.style.textAlign = 'center';
                noResults.style.padding = '50px';
                noResults.style.color = '#666';
                noResults.textContent = `没有找到与 "${searchTerm}" 相关的设定集`;
                bookGrid.appendChild(noResults);
                
                // 隐藏分页
                document.querySelector('.pagination').style.display = 'none';
            } else {
                // 显示分页
                document.querySelector('.pagination').style.display = 'flex';
                
                // 如果有现有的"无结果"消息，移除它
                const existingNoResults = bookGrid.querySelector('div[style*="grid-column: 1 / -1"]');
                if (existingNoResults) {
                    bookGrid.removeChild(existingNoResults);
                }
                
                // 重置分页到第一页
                currentPage = 1;
                showPage(currentPage);
                updatePageButtons();
            }
            
            console.log(`搜索: ${searchTerm}，找到 ${matchedItems.length} 个结果`);
        }
    }
    
    // 滚动时改变导航栏样式
    if (nav) {
        let scrollTimeout;
        
        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(function() {
                if (scrollTop > 50) {
                    if (window.innerWidth > 768) {
                        nav.style.height = '50px';
                        nav.style.padding = '0 50px';
                    } else {
                        nav.style.padding = '5px 15px';
                    }
                } else {
                    if (window.innerWidth > 768) {
                        nav.style.height = '55px';
                        nav.style.padding = '0 50px';
                    } else {
                        nav.style.padding = '8px 15px';
                    }
                }
            }, 50);
        }
        
        window.addEventListener('scroll', handleScroll);
    }
    
    /* ==========================================================================
       内容区域功能
       ========================================================================== */
    
    // 为卡片添加点击事件和徽章
    bookItems.forEach((card, index) => {
        // 为每个卡片添加徽章
        addBadgeToCard(card, index);
        
        // 卡片点击事件
        card.addEventListener('click', (e) => {
            // 如果点击的是链接，不执行卡片点击效果
            if (e.target.tagName === 'A') {
                return;
            }
            
            // 获取卡片内的"查看详情"链接
            const detailLink = card.querySelector('a');
            if (detailLink) {
                detailLink.click(); // 模拟点击"查看详情"链接
            }
        });
        
        // 确保所有卡片内容保持一致的高度
        const img = card.querySelector('img');
        if (img) {
            img.addEventListener('load', () => {
                // 图片加载完成后确保卡片高度一致
                card.style.height = '380px';
            });
        }
    });
    
    // 为卡片添加徽章
    function addBadgeToCard(card, index) {
        // 检查卡片是否有自定义徽章属性
        const customBadge = card.getAttribute('data-badge');
        
        if (customBadge) {
            // 创建徽章元素
            const badge = document.createElement('div');
            badge.className = 'book-badge';
            badge.textContent = customBadge;
            
            // 根据徽章类型设置不同背景色
            if (customBadge === '热门') {
                badge.style.background = 'linear-gradient(45deg, #FF416C, #FF4B2B)';
            } else if (customBadge === '新品') {
                badge.style.background = 'linear-gradient(45deg, #11998e, #38ef7d)';
            } else if (customBadge === '推荐') {
                badge.style.background = 'linear-gradient(45deg, #6a11cb, #2575fc)';
            } else if (customBadge === '限时') {
                badge.style.background = 'linear-gradient(45deg, #FF9500, #FF5E3A)';
            } else if (customBadge === '独家') {
                badge.style.background = 'linear-gradient(45deg, #8B00FF, #5D3FD3)';
            }
            
            card.style.position = 'relative'; // 确保徽章定位正确
            card.appendChild(badge);
        }
    }
    
    /* ==========================================================================
       分页功能区域
       ========================================================================== */
    
    // 获取可见项目
    function getVisibleItems() {
        return Array.from(bookItems).filter(item => {
            // 检查是否是可见的项目
            return item.style.display !== 'none' && !item.classList.contains('filtered-out');
        });
    }
    
    // 显示指定页码的电子书
    function showPage(page) {
        console.log(`正在显示第 ${page} 页`);
        
        // 获取筛选后的项目数量（如果存在），否则使用所有项目数量
        const totalItems = window.filteredItemsCount || bookItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        console.log(`使用筛选后项目数量: ${totalItems}, 总页数: ${totalPages}`);
        
        // 确保页码在有效范围内
        if (page < 1) page = 1;
        if (page > totalPages && totalPages > 0) page = totalPages;
        
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        // 隐藏所有电子书
        bookItems.forEach(item => {
            item.style.display = 'none';
        });

        // 显示当前页的电子书（只显示符合筛选条件的项目）
        let displayCount = 0;
        let visibleCount = 0;
        
        bookItems.forEach(item => {
            // 检查项目是否符合筛选条件（没有filtered-out类）
            if (!item.classList.contains('filtered-out')) {
                // 如果在当前页范围内，则显示
                if (visibleCount >= startIndex && visibleCount < endIndex) {
                    item.style.display = 'flex';
                    displayCount++;
                    
                    // 重置动画状态，保证每次显示都能触发视图动画
                    item.style.animation = 'none';
                    item.offsetHeight; // A force reflow/repaint
                    item.style.animation = '';
                }
                visibleCount++;
            }
        });
        
        console.log(`显示项目: ${displayCount} (页码 ${page}/${totalPages})`);
        
        // 更新页面指示器
        if (pageIndicator) {
            pageIndicator.textContent = `第 ${page} 页，共 ${totalPages} 页 (总计 ${totalItems} 个设定集)`;
        }
        
        // 页面滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 更新当前页码
        currentPage = page;
        
        // 暴露给全局使用
        window.currentPage = currentPage;
    }

    // 生成页码按钮
    function generatePageNumbers() {
        // 使用筛选后的项目数量（如果存在），否则使用所有项目数量
        const totalItems = window.filteredItemsCount || bookItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        console.log(`生成页码按钮: 总项目数=${totalItems}, 总页数=${totalPages}, 当前页=${currentPage}`);
        
        // 清空页码容器
        pageNumbersContainer.innerHTML = '';

        // 如果只有一页，不显示页码按钮
        if (totalPages <= 1) {
            return;
        }

        // 如果页数太多，只显示部分页码
        const maxVisibleButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
        
        // 调整起始页码，确保显示正确数量的按钮
        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        // 添加第一页按钮
        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => {
                currentPage = 1;
                showPage(currentPage);
                updatePageButtons();
            });
            pageNumbersContainer.appendChild(firstPageButton);
            
            // 添加省略号
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-ellipsis';
                pageNumbersContainer.appendChild(ellipsis);
            }
        }
        
        // 添加中间的页码按钮
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            // 确保按钮有足够的触摸面积
            pageButton.style.minWidth = '44px';
            pageButton.style.minHeight = '44px';
        
            pageButton.addEventListener('click', () => {
                currentPage = i;
                showPage(currentPage);
                updatePageButtons();
            });
        
            // 为当前页添加active类
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
        
            pageNumbersContainer.appendChild(pageButton);
        }
        
        // 添加最后一页按钮
        if (endPage < totalPages) {
            // 添加省略号
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-ellipsis';
                pageNumbersContainer.appendChild(ellipsis);
            }
            
            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = totalPages;
            lastPageButton.addEventListener('click', () => {
                currentPage = totalPages;
                showPage(currentPage);
                updatePageButtons();
            });
            pageNumbersContainer.appendChild(lastPageButton);
        }
    }

    // 更新页码按钮状态
    function updatePageButtons() {
        // 使用筛选后的项目数量（如果存在），否则使用所有项目数量
        const totalItems = window.filteredItemsCount || bookItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        console.log(`更新页码按钮: 总页数=${totalPages}, 当前页=${currentPage}`);
        
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
        
        // 重新生成页码按钮
        generatePageNumbers();
    }

    // 上一页按钮点击事件
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
            updatePageButtons();
        }
    });

    // 下一页按钮点击事件
    nextPageButton.addEventListener('click', () => {
        // 使用筛选后的项目数量计算总页数
        const totalItems = window.filteredItemsCount || bookItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            showPage(currentPage);
            updatePageButtons();
        }
    });

    // 跳转按钮点击事件
    jumpButton.addEventListener('click', () => {
        const pageNumber = parseInt(jumpToPageInput.value);
        // 使用筛选后的项目数量计算总页数
        const totalItems = window.filteredItemsCount || bookItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            currentPage = pageNumber;
            showPage(currentPage);
            updatePageButtons();
            
            // 清空输入框
            jumpToPageInput.value = '';
        } else {
            alert('请输入有效的页码（1 到 ' + totalPages + ' 之间）');
        }
    });

    // Enter键跳转
    jumpToPageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            jumpButton.click();
        }
    });

    // 添加键盘导航支持
    document.addEventListener('keydown', function(e) {
        // 左箭头键 - 上一页
        if (e.key === 'ArrowLeft' && !prevPageButton.disabled) {
            prevPageButton.click();
        }
        // 右箭头键 - 下一页
        else if (e.key === 'ArrowRight' && !nextPageButton.disabled) {
            nextPageButton.click();
        }
    });

    /* ==========================================================================
       辅助功能和初始化区域
       ========================================================================== */

    // 添加页面指示器
    function createPageIndicator() {
        // 检查是否已存在页面指示器
        if (!document.querySelector('.page-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'page-indicator';
            
            // 插入到分页导航之前
            const pagination = document.querySelector('.pagination');
            if (pagination && pagination.parentNode) {
                pagination.parentNode.insertBefore(indicator, pagination);
            }
            
            return indicator;
        }
        
        return document.querySelector('.page-indicator');
    }

    // 点击页面其他地方关闭移动菜单
    if (navList) {
        document.addEventListener('click', function(event) {
            const isClickInsideNav = nav && nav.contains(event.target);
            
            if (!isClickInsideNav && navList.classList.contains('show') && window.innerWidth <= 768) {
                navList.classList.remove('show');
                if (hamburgerMenu) hamburgerMenu.classList.remove('active');
            }
        });
    }

    // 窗口大小变化时的处理
    let resizeTimeout;

    function handleResize() {
        clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(function() {
            if (navList && window.innerWidth > 768 && navList.classList.contains('show')) {
                navList.classList.remove('show');
                if (hamburgerMenu) hamburgerMenu.classList.remove('active');
            }
            
            if (nav) {
                if (window.innerWidth > 768) {
                    nav.style.height = window.pageYOffset > 50 ? '50px' : '55px';
                    nav.style.padding = '0 50px';
                } else {
                    nav.style.height = 'auto';
                    nav.style.padding = window.pageYOffset > 50 ? '5px 15px' : '8px 15px';
                }
            }
            
            // 确保内容在调整大小后仍然可见
            document.body.style.minHeight = window.innerHeight + 'px';
        }, 100);
    }

    window.addEventListener('resize', handleResize);

    // 初始化函数
    function init() {
        console.log('初始化分页系统...');
        
        const totalItems = bookItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        console.log(`总项目: ${totalItems}, 总页数: ${totalPages}`);
        
        // 初始化分页系统
        if (totalItems > itemsPerPage) {
            // 显示分页导航
            const pagination = document.querySelector('.pagination');
            if (pagination) {
                pagination.style.display = 'flex';
            }
            
            // 显示第一页内容
            showPage(1);
            
            // 生成页码按钮
            generatePageNumbers();
            
            // 更新上一页/下一页按钮状态
            updatePageButtons();
        } else {
            // 如果项目数量少于每页显示数量，隐藏分页导航
            const pagination = document.querySelector('.pagination');
            if (pagination) {
                pagination.style.display = 'none';
            }
            
            // 显示所有项目
            bookItems.forEach((item) => {
                item.style.display = 'flex';
            });
            
            // 更新页面指示器
            if (pageIndicator) {
                pageIndicator.textContent = `显示全部 ${totalItems} 个设定集`;
            }
        }
        
        // 初始设置导航栏样式
        if (nav) {
            if (window.innerWidth > 768) {
                nav.style.height = '55px';
                nav.style.padding = '0 50px';
            } else {
                nav.style.height = 'auto';
                nav.style.padding = '8px 15px';
            }
        }
        
        // 确保内容可以滚动到底部
        document.body.style.minHeight = window.innerHeight + 'px';
        
        // 初始运行一次窗口大小处理
        handleResize();
    }

    // 导出关键函数供筛选器使用
    window.showPage = showPage;
    window.updatePageButtons = updatePageButtons;
    window.currentPage = currentPage;

    // 运行初始化
    init();
});