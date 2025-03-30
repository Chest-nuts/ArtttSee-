/**
 * 电子书组件 - 用于在页面动态插入电子书阅读器
 * 优化版：使用简单淡入淡出效果代替复杂3D动画，提升性能
 */
class EbookComponent {
    constructor(options = {}) {
        // 默认配置
        this.options = Object.assign({
            containerId: 'ebook-component-container', // 容器ID，用于插入电子书
            cssPath: './css/book.css',               // 电子书CSS路径
            totalPages: 108,                          // 总页数
            imagePath: '../artbookpicture/BF/',       // 图片路径
            imagePrefix: 'BF',                        // 图片前缀
            defaultImg: './logo.png'                  // 默认图片（加载失败时显示）
        }, options);
        
        // 内部状态
        this.currentPageIndex = 0;
        this.isFullscreen = false;
        this.isLandscape = true;
        this.isZoomed = false;
        
        // 初始化组件
        this.init();
    }
    
    init() {
        // 加载CSS
        this.loadCSS();
        // 插入电子书HTML
        this.renderEbook();
        // 使用setTimeout确保DOM已更新
        setTimeout(() => {
            this.initElements();
            
            // 初始将电子书页面设为透明，等预加载完成后再显示
            if (this.ebookPages) {
                this.ebookPages.style.transition = 'opacity 0.5s ease';
                this.ebookPages.style.opacity = '0';
            }
            
            this.initFunctionality();
            
            // 生成页面后立即开始预加载图片
            this.preloadImages();
            
            // 初始化页面动画效果
            this.initPageAnimations();
        }, 0);
    }
    
    // 页面入场动画（从HTML移入到JS中）
    initPageAnimations() {
        // 首先设置初始透明度为0
        const ebookContainer = document.querySelector('.ebook-container');
        const controlFrame = document.querySelector('.control-frame');
        const ebookInfo = document.querySelector('.ebook-info');
        
        if (ebookContainer) ebookContainer.style.opacity = '0';
        if (controlFrame) controlFrame.style.opacity = '0';
        if (ebookInfo) ebookInfo.style.opacity = '0';
        
        // 监听整个页面加载完成事件
        window.addEventListener('load', () => {
            // 为了确保所有元素已准备就绪
            setTimeout(() => {
                if (ebookContainer) {
                    ebookContainer.style.transition = 'opacity 0.5s ease';
                    ebookContainer.style.opacity = '1';
                }
                
                if (controlFrame) {
                    controlFrame.style.transition = 'opacity 0.5s ease 0.2s';
                    controlFrame.style.opacity = '1';
                }
                
                if (ebookInfo) {
                    ebookInfo.style.transition = 'opacity 0.5s ease 0.4s';
                    ebookInfo.style.opacity = '1';
                }
            }, 100);
        });
    }
    
    loadCSS() {
        // 检查是否已经加载了电子书CSS
        if (!document.querySelector(`link[href="${this.options.cssPath}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this.options.cssPath;
            document.head.appendChild(link);
        }
    }
    
    renderEbook() {
        const ebookHTML = `
            <!-- 电子书容器 -->
            <div class="ebook-container" id="ebook-container">
                <div class="page-wrapper">
                    <div class="ebook-pages">
                        <!-- 页面将由JavaScript动态生成 -->
                    </div>
                    <!-- 添加点击区域用于翻页 -->
                    <div class="page-click-overlay left-overlay" id="left-overlay"></div>
                    <div class="page-click-overlay right-overlay" id="right-overlay"></div>
                </div>
                <!-- 全屏和旋转按钮 -->
                <button id="orientation-btn" class="orientation-btn" style="display: none;">
                    <span class="orientation-icon">⟳</span>
                </button>
                <button id="fullscreen-btn" class="fullscreen-btn">
                    <span class="fullscreen-icon">⛶</span>
                </button>
            </div>
            
            <!-- 图片放大层 -->
            <div class="image-zoom-overlay" id="image-zoom-overlay">
                <div class="zoomed-image-container">
                    <img src="" alt="放大的图片" class="zoomed-image" id="zoomed-image">
                    <button class="zoom-close-btn" id="zoom-close-btn">×</button>
                </div>
            </div>
            
            <!-- 控制栏 -->
            <div class="control-frame">
                <div class="control-group">
                    <button class="prev-page-btn">&lt; 上一页</button>
                    <p class="current-left-page">左页: 1</p>
                </div>
                <input type="range" class="page-slider" min="0" max="${Math.floor(this.options.totalPages / 2) - 1}" value="0">
                <div class="control-group">
                    <button class="next-page-btn">下一页 &gt;</button>
                    <p class="current-right-page">右页: 2</p>
                </div>
            </div>
        `;
        
        // 找到目标容器并插入电子书HTML
        const container = document.getElementById(this.options.containerId);
        if (container) {
            container.innerHTML = ebookHTML;
        } else {
            // 如果找不到指定容器，则在body中创建一个
            const ebookContainer = document.createElement('div');
            ebookContainer.id = this.options.containerId;
            ebookContainer.innerHTML = ebookHTML;
            document.body.appendChild(ebookContainer);
        }
    }
    
    initElements() {
        // 获取关键DOM元素
        this.ebookContainer = document.getElementById('ebook-container');
        this.ebookPages = document.querySelector('.ebook-pages');
        this.leftOverlay = document.getElementById('left-overlay');
        this.rightOverlay = document.getElementById('right-overlay');
        this.prevPageBtn = document.querySelector('.prev-page-btn');
        this.nextPageBtn = document.querySelector('.next-page-btn');
        this.pageSlider = document.querySelector('.page-slider');
        this.currentLeftPageElement = document.querySelector('.current-left-page');
        this.currentRightPageElement = document.querySelector('.current-right-page');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.orientationBtn = document.getElementById('orientation-btn');
        this.imageZoomOverlay = document.getElementById('image-zoom-overlay');
        this.zoomedImage = document.getElementById('zoomed-image');
        this.zoomCloseBtn = document.getElementById('zoom-close-btn');
        
        // 动态生成页面和添加图片
        this.generatePages();
    }
    
    generatePages() {
        const totalImages = this.options.totalPages;
        
        for (let i = 0; i < totalImages; i += 2) {
            // 创建左页
            const leftPage = document.createElement('div');
            leftPage.classList.add('page', 'left-page');
            leftPage.dataset.pageIndex = i;
            const leftImg = document.createElement('img');
            const leftImgNumber = (i + 1).toString().padStart(3, '0');
            leftImg.src = `${this.options.imagePath}${this.options.imagePrefix}${leftImgNumber}.jpg`;
            leftImg.alt = `第 ${i + 1} 页图片`;
            leftImg.dataset.pageIndex = i;
            leftImg.classList.add('book-img'); // 添加类名以便事件委托识别
            leftPage.appendChild(leftImg);

            // 图片加载错误处理
            leftImg.onerror = () => {
                console.error(`图片加载失败：${leftImg.src}`);
                leftImg.src = this.options.defaultImg;
                leftImg.style.opacity = '0.5';
            };

            // 添加懒加载
            leftImg.loading = 'lazy';
            this.ebookPages.appendChild(leftPage);

            // 如果有右页，创建右页
            if (i + 1 < totalImages) {
                const rightPage = document.createElement('div');
                rightPage.classList.add('page', 'right-page');
                rightPage.dataset.pageIndex = i + 1;
                const rightImg = document.createElement('img');
                const rightImgNumber = (i + 2).toString().padStart(3, '0');
                rightImg.src = `${this.options.imagePath}${this.options.imagePrefix}${rightImgNumber}.jpg`;
                rightImg.alt = `第 ${i + 2} 页图片`;
                rightImg.dataset.pageIndex = i + 1;
                rightImg.classList.add('book-img'); // 添加类名以便事件委托识别
                rightPage.appendChild(rightImg);

                // 图片加载错误处理
                rightImg.onerror = () => {
                    console.error(`图片加载失败：${rightImg.src}`);
                    rightImg.src = this.options.defaultImg;
                    rightImg.style.opacity = '0.5';
                };

                // 添加懒加载
                rightImg.loading = 'lazy';
                this.ebookPages.appendChild(rightPage);
            }
        }
    }
    
    preloadImages() {
        const totalImages = this.options.totalPages;
        const imagesToPreload = [];
        
        console.log('开始预加载图片...');
        
        // 创建预加载数组
        for (let i = 0; i < totalImages; i++) {
            const imgNumber = (i + 1).toString().padStart(3, '0');
            const imgUrl = `${this.options.imagePath}${this.options.imagePrefix}${imgNumber}.jpg`;
            imagesToPreload.push(imgUrl);
        }
        
        // 添加预加载状态指示到页面
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'ebook-loading-indicator';
        loadingIndicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.8);
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-size: 14px;
            text-align: center;
        `;
        loadingIndicator.innerHTML = '加载中 (0/' + totalImages + ')...';
        this.ebookContainer.appendChild(loadingIndicator);
        
        // 优先加载当前页和临近页面
        const priorityLoadCount = 6; // 优先加载前3组（6页）
        const regularImages = [...imagesToPreload];
        const priorityImages = regularImages.splice(0, priorityLoadCount);
        
        let loadedCount = 0;
        let priorityLoaded = false;
        
        // 优先加载函数
        const loadPriorityImages = () => {
            return Promise.all(priorityImages.map(imgUrl => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        loadedCount++;
                        loadingIndicator.innerHTML = '加载中 (' + loadedCount + '/' + totalImages + ')...';
                        resolve();
                    };
                    img.onerror = () => {
                        loadedCount++;
                        loadingIndicator.innerHTML = '加载中 (' + loadedCount + '/' + totalImages + ')...';
                        resolve();
                    };
                    img.src = imgUrl;
                });
            }));
        };
        
        // 常规加载函数
        const loadRegularImages = () => {
            return Promise.all(regularImages.map(imgUrl => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        loadedCount++;
                        loadingIndicator.innerHTML = '加载中 (' + loadedCount + '/' + totalImages + ')...';
                        resolve();
                    };
                    img.onerror = () => {
                        loadedCount++;
                        loadingIndicator.innerHTML = '加载中 (' + loadedCount + '/' + totalImages + ')...';
                        resolve();
                    };
                    img.src = imgUrl;
                });
            }));
        };
        
        // 首先加载优先图片
        loadPriorityImages().then(() => {
            priorityLoaded = true;
            console.log('优先图片已加载完成');
            
            // 优先图片加载完成后，显示页面并移除初始透明设置
            this.ebookPages.style.opacity = '1';
            
            // 显示首页
            this.showPage(0);
            
            // 添加鼠标指针样式
            this.addImagePointerStyles();
            
            // 然后开始加载剩余图片
            return loadRegularImages();
        }).then(() => {
            console.log('所有图片预加载完成');
            
            // 移除加载指示器
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        });
        
        // 如果优先图片2秒内没有加载完，也显示页面（避免长时间白屏）
        setTimeout(() => {
            if (!priorityLoaded) {
                this.ebookPages.style.opacity = '1';
                this.showPage(0);
                this.addImagePointerStyles();
            }
        }, 2000);
    }
    
    // 添加鼠标指针样式，提示用户图片可点击
    addImagePointerStyles() {
        const styleId = 'image-pointer-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @media (min-width: 768px) {
                    .book-img {
                        cursor: pointer;
                    }
                    .book-img:hover {
                        transition: all 0.2s ease;
                        filter: brightness(1.05);
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initFunctionality() {
        // 初始显示第一页
        this.showPage(this.currentPageIndex);
        
        // 设置按钮事件监听
        this.initEventListeners();
        
        // 初始化翻页覆盖层
        this.initOverlaysEvents();
        
        // 添加图片缩放功能 - 使用事件委托
        this.initImageZoom();
        
        // 添加响应式功能
        this.initResponsiveHandling();
        
        // 添加简单的淡入淡出动画样式
        this.addSimpleAnimationStyles();
        
        // 检测初始方向
        this.detectInitialOrientation();
    }
    
    initEventListeners() {
        // 上一页按钮
        if (this.prevPageBtn) {
            this.prevPageBtn.addEventListener('click', () => this.goToPrevPage());
        }
        
        // 下一页按钮
        if (this.nextPageBtn) {
            this.nextPageBtn.addEventListener('click', () => this.goToNextPage());
        }
        
        // 全屏按钮
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // 旋转方向按钮
        if (this.orientationBtn) {
            this.orientationBtn.addEventListener('click', () => this.toggleOrientation());
        }
        
        // 滑块控制
        if (this.pageSlider) {
            this.pageSlider.addEventListener('input', (e) => {
                if (this.isZoomed) return;
                this.currentPageIndex = parseInt(e.target.value) * 2;
                this.showPage(this.currentPageIndex);
            });
        }
        
        // 键盘翻页
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                this.goToPrevPage();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                this.goToNextPage();
            } else if (e.key === 'Escape') {
                if (this.isZoomed) {
                    this.closeZoom();
                } else if (this.isFullscreen) {
                    this.toggleFullscreen();
                }
            }
        });
        
        // 触摸滑动
        this.initTouchEvents();
    }
    
    initTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        let isSwiping = false;
        
        if (this.ebookPages) {
            this.ebookPages.addEventListener('touchstart', (e) => {
                if (this.isZoomed) return;
                
                touchStartX = e.touches[0].clientX;
                isSwiping = true;
            });
            
            this.ebookPages.addEventListener('touchmove', (e) => {
                if (!isSwiping || this.isZoomed) return;
                
                const currentX = e.touches[0].clientX;
                const diffX = currentX - touchStartX;
                
                if (Math.abs(diffX) > 20) {
                    e.preventDefault(); // 防止页面滚动
                }
            }, { passive: false });
            
            this.ebookPages.addEventListener('touchend', (e) => {
                if (!isSwiping || this.isZoomed) return;
                
                touchEndX = e.changedTouches[0].clientX;
                const diffX = touchEndX - touchStartX;
                
                if (diffX > 70) { // 向右滑动，上一页
                    this.goToPrevPage();
                } else if (diffX < -70) { // 向左滑动，下一页
                    this.goToNextPage();
                }
                
                isSwiping = false;
            });
            
            this.ebookPages.addEventListener('touchcancel', () => {
                isSwiping = false;
            });
        }
        
        // 双击屏幕退出全屏
        let lastTapTime = 0;
        document.addEventListener('touchend', (e) => {
            if (!this.isFullscreen) return;
            
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            if (tapLength < 300 && tapLength > 0) {
                this.toggleFullscreen();
                e.preventDefault();
            }
            
            lastTapTime = currentTime;
        });
    }
    
    // 使用事件委托来处理图片点击事件
    initImageZoom() {
        // 使用事件委托，将点击事件绑定在父容器上
        if (this.ebookPages) {
            // 移除现有的事件监听器（如果有）
            const newEbookPages = this.ebookPages.cloneNode(false);
            
            // 保存现有的子元素并将它们移到新容器
            while (this.ebookPages.firstChild) {
                newEbookPages.appendChild(this.ebookPages.firstChild);
            }
            
            // 替换旧容器
            if (this.ebookPages.parentNode) {
                this.ebookPages.parentNode.replaceChild(newEbookPages, this.ebookPages);
                this.ebookPages = newEbookPages;
            }
            
            // 使用事件委托 - 在容器上监听点击事件
            this.ebookPages.addEventListener('click', (e) => {
                // 检查点击的是否是图片元素
                if (e.target.tagName === 'IMG' && e.target.classList.contains('book-img')) {
                    // 只在桌面端启用点击放大
                    if (window.innerWidth >= 768 && !this.isZoomed) {
                        e.stopPropagation();
                        this.openZoom(e.target);
                    }
                }
            });
        }
        
        // 关闭按钮
        if (this.zoomCloseBtn) {
            this.zoomCloseBtn.addEventListener('click', () => this.closeZoom());
        }
        
        // 点击背景关闭
        if (this.imageZoomOverlay) {
            this.imageZoomOverlay.addEventListener('click', (e) => {
                if (e.target === this.imageZoomOverlay) {
                    this.closeZoom();
                }
            });
        }
        
        // 图片拖拽功能
        this.initImageDrag();
    }
    
    initImageDrag() {
        let dragStartX = 0;
        let dragStartY = 0;
        let currentTranslateX = 0;
        let currentTranslateY = 0;
        let isDragging = false;
        
        if (this.zoomedImage) {
            this.zoomedImage.addEventListener('mousedown', (e) => {
                if (!this.isZoomed) return;
                
                e.preventDefault();
                isDragging = true;
                this.zoomedImage.style.cursor = 'grabbing';
                
                // 记录初始位置
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                
                // 获取当前平移值
                currentTranslateX = currentTranslateX || 0;
                currentTranslateY = currentTranslateY || 0;
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging || !this.isZoomed) return;
                
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                
                // 限制移动范围
                const maxOffset = 300;
                const newTranslateX = Math.min(Math.max(currentTranslateX + dx, -maxOffset), maxOffset);
                const newTranslateY = Math.min(Math.max(currentTranslateY + dy, -maxOffset), maxOffset);
                
                this.zoomedImage.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
            });
            
            document.addEventListener('mouseup', () => {
                if (!this.isZoomed) return;
                
                if (isDragging) {
                    // 更新当前位置
                    const transform = window.getComputedStyle(this.zoomedImage).getPropertyValue('transform');
                    if (transform && transform !== 'none') {
                        const matrix = transform.match(/matrix\((.+)\)/);
                        if (matrix) {
                            const values = matrix[1].split(', ');
                            if (values.length >= 6) {
                                currentTranslateX = parseFloat(values[4]);
                                currentTranslateY = parseFloat(values[5]);
                            }
                        }
                    }
                    
                    this.zoomedImage.style.cursor = 'grab';
                    isDragging = false;
                }
            });
            
            // 双击重置位置
            this.zoomedImage.addEventListener('dblclick', () => {
                currentTranslateX = 0;
                currentTranslateY = 0;
                this.zoomedImage.style.transform = 'translate(0, 0)';
            });
        }
    }
    
    initOverlaysEvents() {
        if (!this.leftOverlay || !this.rightOverlay) return;
        
        // 移除现有的事件监听器（如果有）
        const newLeftOverlay = this.leftOverlay.cloneNode(true);
        const newRightOverlay = this.rightOverlay.cloneNode(true);
        
        if (this.leftOverlay.parentNode) {
            this.leftOverlay.parentNode.replaceChild(newLeftOverlay, this.leftOverlay);
        }
        
        if (this.rightOverlay.parentNode) {
            this.rightOverlay.parentNode.replaceChild(newRightOverlay, this.rightOverlay);
        }
        
        // 更新引用
        this.leftOverlay = document.getElementById('left-overlay');
        this.rightOverlay = document.getElementById('right-overlay');
        
        // 添加各种事件处理
        if (this.leftOverlay) {
            // 鼠标点击事件
            this.leftOverlay.addEventListener('click', (e) => {
                if (this.isFullscreen && !this.isZoomed) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.goToPrevPage();
                }
            });
            
            // 触摸事件（移动设备）
            this.leftOverlay.addEventListener('touchend', (e) => {
                if (this.isFullscreen && !this.isZoomed) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.goToPrevPage();
                }
            });
        }
        
        if (this.rightOverlay) {
            // 鼠标点击事件
            this.rightOverlay.addEventListener('click', (e) => {
                if (this.isFullscreen && !this.isZoomed) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.goToNextPage();
                }
            });
            
            // 触摸事件（移动设备）
            this.rightOverlay.addEventListener('touchend', (e) => {
                if (this.isFullscreen && !this.isZoomed) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.goToNextPage();
                }
            });
        }
    }
    
    initResponsiveHandling() {
        // 响应窗口大小变化
        window.addEventListener('resize', () => {
            if (this.isFullscreen) {
                // 更新覆盖层设置
                this.updateOverlays();
                
                // 调整按钮位置
                if (window.innerWidth < 768) {
                    // 移动端全屏模式下调整按钮位置
                    this.orientationBtn.style.top = '20px';
                    this.orientationBtn.style.right = '70px';
                    this.fullscreenBtn.style.top = '20px';
                    this.fullscreenBtn.style.right = '20px';
                } else {
                    // 桌面全屏模式下调整按钮位置
                    this.orientationBtn.style.top = '20px';
                    this.orientationBtn.style.right = '80px';
                    this.fullscreenBtn.style.top = '20px';
                    this.fullscreenBtn.style.right = '20px';
                }
            } else {
                // 非全屏模式下恢复默认按钮位置
                this.orientationBtn.style.top = '';
                this.orientationBtn.style.right = '';
                this.fullscreenBtn.style.top = '';
                this.fullscreenBtn.style.right = '';
            }
        });
        
        // 监听设备方向变化
        window.addEventListener('orientationchange', () => {
            if (this.isFullscreen && window.innerWidth < 768) {
                // 根据设备方向自动切换显示模式
                const isDeviceLandscape = window.orientation === 90 || window.orientation === -90;
                
                if (isDeviceLandscape !== this.isLandscape) {
                    // 如果设备方向与当前显示方向不一致，则切换
                    this.toggleOrientation();
                }
            }
            
            // 无论如何都更新覆盖层
            setTimeout(() => this.updateOverlays(), 200);
            setTimeout(() => this.initOverlaysEvents(), 300);
        });
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isFullscreen) {
                // 确保全屏模式下的样式正确应用
                setTimeout(() => {
                    if (document.body.classList.contains('fullscreen-active')) {
                        document.body.style.margin = '0';
                        document.body.style.padding = '0';
                        document.body.style.overflow = 'hidden';
                        this.ebookContainer.style.width = '100vw';
                        this.ebookContainer.style.height = '100vh';
                        this.ebookContainer.style.margin = '0';
                        this.ebookContainer.style.top = '0';
                        this.ebookContainer.style.left = '0';
                        
                        // 重新更新覆盖层和事件
                        this.updateOverlays();
                        this.initOverlaysEvents();
                    }
                }, 100);
            }
        });
    }
    
    // 添加简单的淡入淡出动画样式
    addSimpleAnimationStyles() {
        const styleId = 'ebook-animation-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                /* 简单的淡入淡出动画 */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                @keyframes zoomIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                @keyframes zoomOut {
                    from { transform: scale(1); opacity: 1; }
                    to { transform: scale(0.5); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 核心页面操作方法 - 优化后的淡入淡出效果
    showPage(index) {
        const allPages = document.querySelectorAll('.page');
        const totalPages = this.options.totalPages;
        
        // 首先移除所有活动状态
        allPages.forEach(page => {
            page.classList.remove('active');
            page.style.transition = 'none';
            page.style.opacity = '0';
        });

        // 显示左页和右页
        if (index < totalPages) {
            const leftPage = allPages[index];
            if (leftPage) {
                leftPage.classList.add('active');
                leftPage.style.transition = 'opacity 0.3s ease';
                
                // 使用setTimeout确保过渡效果生效
                setTimeout(() => {
                    leftPage.style.opacity = '1';
                }, 50);
                
                this.currentLeftPageElement.textContent = `左页: ${index + 1}`;
            }
        }

        if (index + 1 < totalPages) {
            const rightPage = allPages[index + 1];
            if (rightPage) {
                rightPage.classList.add('active');
                rightPage.style.transition = 'opacity 0.3s ease';
                
                // 使用setTimeout确保过渡效果生效
                setTimeout(() => {
                    rightPage.style.opacity = '1';
                }, 50);
                
                this.currentRightPageElement.textContent = `右页: ${index + 2}`;
            }
        } else {
            this.currentRightPageElement.textContent = '右页: -';
        }

        // 更新滑块值
        if (this.pageSlider) {
            this.pageSlider.value = index / 2;
        }
    }
    
    // 简化的翻页功能 - 移除复杂动画
    goToPrevPage() {
        if (this.isZoomed) return; // 如果图片处于放大状态，不允许翻页
        
        if (this.currentPageIndex >= 2) {
            this.currentPageIndex -= 2;
            this.showPage(this.currentPageIndex);
        }
    }
    
    goToNextPage() {
        if (this.isZoomed) return; // 如果图片处于放大状态，不允许翻页
        
        if (this.currentPageIndex + 2 < this.options.totalPages) {
            this.currentPageIndex += 2;
            this.showPage(this.currentPageIndex);
        }
    }
    
    updateOverlays() {
        if (!this.leftOverlay || !this.rightOverlay) return;
        
        if (this.isFullscreen) {
            // 显示翻页区域
            this.leftOverlay.style.display = 'block';
            this.rightOverlay.style.display = 'block';
            
            // 确保z-index正确
            this.leftOverlay.style.zIndex = '95';
            this.rightOverlay.style.zIndex = '95';
            
            // 根据当前显示模式调整覆盖层布局
            if (this.isLandscape) {
                // 横屏模式（左右排列）
                this.leftOverlay.style.width = '50%';
                this.leftOverlay.style.height = '100%';
                this.leftOverlay.style.top = '0';
                this.leftOverlay.style.left = '0';
                this.leftOverlay.style.right = 'auto';
                
                this.rightOverlay.style.width = '50%';
                this.rightOverlay.style.height = '100%';
                this.rightOverlay.style.top = '0';
                this.rightOverlay.style.right = '0';
                this.rightOverlay.style.left = 'auto';
            } else {
                // 竖屏模式（上下排列）
                this.leftOverlay.style.width = '100%';
                this.leftOverlay.style.height = '50%';
                this.leftOverlay.style.top = '0';
                this.leftOverlay.style.left = '0';
                this.leftOverlay.style.right = 'auto';
                
                this.rightOverlay.style.width = '100%';
                this.rightOverlay.style.height = '50%';
                this.rightOverlay.style.top = '50%';
                this.rightOverlay.style.left = '0';
                this.rightOverlay.style.right = 'auto';
            }
            
            // 添加微弱背景色便于调试和增加用户视觉反馈
            if (window.innerWidth < 768) {
                this.leftOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                this.rightOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
            }
        } else {
            // 非全屏模式下隐藏覆盖层
            this.leftOverlay.style.display = 'none';
            this.rightOverlay.style.display = 'none';
        }
    }
    
    toggleOrientation() {
        if (!this.isFullscreen || this.isZoomed) return;
        
        this.isLandscape = !this.isLandscape;
        
        if (this.isLandscape) {
            // 切换到横屏模式
            this.ebookContainer.classList.add('landscape-mode');
            this.ebookContainer.classList.remove('portrait-mode');
            this.orientationBtn.querySelector('.orientation-icon').textContent = '⤢';
        } else {
            // 切换到竖屏模式
            this.ebookContainer.classList.add('portrait-mode');
            this.ebookContainer.classList.remove('landscape-mode');
            this.orientationBtn.querySelector('.orientation-icon').textContent = '⤡';
        }
        
        // 立即更新覆盖层位置和大小
        this.updateOverlays();
        
        // 重新初始化事件监听
        this.initOverlaysEvents();
        
        // 延迟一点时间重新应用一次，确保更改生效
        setTimeout(() => this.updateOverlays(), 300);
    }
    
    toggleFullscreen() {
        if (this.isZoomed) return; // 如果图片处于放大状态，不允许切换全屏
        
        if (!this.isFullscreen) {
            // 进入全屏模式
            this.ebookContainer.classList.add('fullscreen-mode');
            
            // 设置初始屏幕方向
            if (this.isLandscape) {
                this.ebookContainer.classList.add('landscape-mode');
                this.ebookContainer.classList.remove('portrait-mode');
                this.orientationBtn.querySelector('.orientation-icon').textContent = '⤢';
            } else {
                this.ebookContainer.classList.add('portrait-mode');
                this.ebookContainer.classList.remove('landscape-mode');
                this.orientationBtn.querySelector('.orientation-icon').textContent = '⤡';
            }
            
            // 显示旋转按钮
            this.orientationBtn.style.display = 'flex';
            
            this.fullscreenBtn.querySelector('.fullscreen-icon').textContent = '✕';
            
            // 隐藏控制栏
            document.querySelector('.control-frame').style.display = 'none';
            
            // 隐藏导航栏
            document.body.classList.add('fullscreen-active');
            
            // 禁止滚动
            document.body.style.overflow = 'hidden';
            this.isFullscreen = true;
            
            // 重新调整当前页面
            this.showPage(this.currentPageIndex);
            
            // 调用更新覆盖层函数
            this.updateOverlays();
            
            // 重新初始化事件
            this.initOverlaysEvents();
            
            // 按钮样式和可见性设置
            this.fullscreenBtn.style.zIndex = '1002';
            this.fullscreenBtn.style.position = 'fixed';
            this.fullscreenBtn.style.opacity = '1';
            
            if (window.innerWidth < 768) {
                this.fullscreenBtn.style.width = '44px';
                this.fullscreenBtn.style.height = '44px';
                this.fullscreenBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                this.fullscreenBtn.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
                this.fullscreenBtn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            }
            
            // 尝试实际进入浏览器全屏模式（如果支持）
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {
                    console.log('全屏请求被拒绝');
                });
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen().catch(() => {
                    console.log('WebKit全屏请求被拒绝');
                });
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen().catch(() => {
                    console.log('MS全屏请求被拒绝');
                });
            }
            
            // 确保全屏模式正确应用样式
            setTimeout(() => {
                document.body.style.margin = '0';
                document.body.style.padding = '0';
                document.body.style.width = '100vw';
                document.body.style.height = '100vh';
            }, 100);
        } else {
            // 退出全屏模式
            this.ebookContainer.classList.remove('fullscreen-mode', 'landscape-mode', 'portrait-mode');
            this.fullscreenBtn.querySelector('.fullscreen-icon').textContent = '⛶';
            
            // 隐藏旋转按钮
            this.orientationBtn.style.display = 'none';
            
            // 显示控制栏
            document.querySelector('.control-frame').style.display = 'flex';
            
            // 显示导航栏
            document.body.classList.remove('fullscreen-active');
            
            // 恢复滚动
            document.body.style.overflow = '';
            this.isFullscreen = false;
            
            // 重置全屏按钮样式
            this.fullscreenBtn.style.width = '';
            this.fullscreenBtn.style.height = '';
            this.fullscreenBtn.style.backgroundColor = '';
            this.fullscreenBtn.style.boxShadow = '';
            this.fullscreenBtn.style.zIndex = '';
            this.fullscreenBtn.style.position = '';
            this.fullscreenBtn.style.border = '';
            
            // 重新调整当前页面
            this.showPage(this.currentPageIndex);
            
            // 隐藏翻页区域
            if (this.leftOverlay && this.rightOverlay) {
                this.leftOverlay.style.display = 'none';
                this.rightOverlay.style.display = 'none';
                
                // 重置覆盖层样式
                this.leftOverlay.style.backgroundColor = '';
                this.rightOverlay.style.backgroundColor = '';
            }
            
            // 退出浏览器全屏模式
            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {
                    console.log('退出全屏失败');
                });
            } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
                document.webkitExitFullscreen().catch(() => {
                    console.log('退出WebKit全屏失败');
                });
            } else if (document.msExitFullscreen && document.msFullscreenElement) {
                document.msExitFullscreen().catch(() => {
                    console.log('退出MS全屏失败');
                });
            }
            
            // 恢复body样式
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.body.style.width = '';
            document.body.style.height = '';
        }
    }
    
    openZoom(img) {
        if (this.isZoomed) return;
        
        this.isZoomed = true;
        this.zoomedImage.src = img.src;
        this.zoomedImage.alt = img.alt;
        this.zoomedImage.dataset.pageIndex = img.dataset.pageIndex;
        
        // 显示缩放层
        this.imageZoomOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    closeZoom() {
        if (!this.isZoomed) return;
        
        // 添加关闭动画
        const container = this.zoomedImage.parentElement;
        container.style.animation = 'zoomOut 0.3s ease forwards';
        
        setTimeout(() => {
            this.imageZoomOverlay.classList.remove('active');
            this.zoomedImage.src = '';
            document.body.style.overflow = ''; // 恢复滚动
            container.style.animation = '';
            this.isZoomed = false;
        }, 300);
    }
    
    detectInitialOrientation() {
        // 如果是移动设备，根据屏幕宽高比自动设置初始方向
        if (window.innerWidth < 768) {
            this.isLandscape = window.innerWidth > window.innerHeight;
        } else {
            // 桌面端默认使用横屏模式
            this.isLandscape = true;
        }
    }
    
    // 公共方法 - 跳转到指定页面
    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.options.totalPages) {
            console.error(`页码 ${pageNumber} 超出范围 (1-${this.options.totalPages})`);
            return;
        }
        
        // 计算页面索引（从0开始）
        const pageIndex = pageNumber - 1;
        // 确保是偶数页（左页）
        const adjustedIndex = pageIndex % 2 === 0 ? pageIndex : pageIndex - 1;
        
        this.currentPageIndex = adjustedIndex;
        this.showPage(this.currentPageIndex);
    }
    
    // 获取当前页码
    getCurrentPage() {
        return this.currentPageIndex + 1;
    }
    
    // 获取总页数
    getTotalPages() {
        return this.options.totalPages;
    }
    
    // 全屏状态检查
    isInFullscreen() {
        return this.isFullscreen;
    }
}

// 导出组件
// 如果使用模块系统
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = EbookComponent;
} else {
    // 否则添加到全局对象（浏览器）
    window.EbookComponent = EbookComponent;
}