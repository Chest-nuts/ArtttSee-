// 关键词：let slideInterval 修改桌面端自动轮播的时间，毫秒制
// 关键词：function startMobileAutoSlide 修改移动端自动轮播的时间，毫秒制
document.addEventListener('DOMContentLoaded', function () {
    // 修复iOS Safari 100vh问题
    function setViewportHeight() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    // 添加lordicon库的支持（如需使用）
    if (!document.querySelector('script[src="https://cdn.lordicon.com/libs/frhvbuzj/lord-icon-2.0.2.js"]')) {
        const script = document.createElement('script');
        script.src = "https://cdn.lordicon.com/libs/frhvbuzj/lord-icon-2.0.2.js";
        document.head.appendChild(script);
    }
    
    // 从HTML获取轮播图数据
    let carouselImages = [];
    const carouselDataElement = document.getElementById('carousel-data');

    if (carouselDataElement && carouselDataElement.dataset.images) {
        try {
            carouselImages = JSON.parse(carouselDataElement.dataset.images);
            console.log("成功从HTML加载轮播图数据");
        } catch (error) {
            console.error("解析轮播图数据失败:", error);
            // 使用默认数据作为备用
            carouselImages = [
                {url: "./home/headpicture/art.jpg", title: "设定集预览", description: "探索精美的设定集世界", link: "#"}
            ];
        }
    } else {
        console.warn("未找到轮播图数据元素，使用默认数据");
        // 使用默认数据作为备用
        carouselImages = [
            {url: "./home/headpicture/art.jpg", title: "设定集预览", description: "探索精美的设定集世界", link: "#"}
        ];
    }
    
    // --------------------- 桌面版轮播逻辑 ---------------------
    // 全局变量
    let _direction = true;  
    let isAnimating = false;
    let timer = null;
    let animationDuration = 700; // 动画持续时间（毫秒）
    let slideInterval = 3500; // 自动轮播间隔（毫秒）
    let queuedAnimation = null; // 用于存储队列中的动画请求
    
    // 创建轮播项 - 修改为使用DOM API创建元素并阻止冒泡
    function createCarouselItems() {
        const slideContainer = document.getElementById('slide');
        if (!slideContainer) return; // 确保元素存在
        
        slideContainer.innerHTML = ''; // 清空容器
        
        // 添加轮播项
        carouselImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'item';
            item.style.backgroundImage = `url(${image.url})`;
            
            // 添加内容
            const content = document.createElement('div');
            content.className = 'content';
            
            // 创建标题和描述
            const nameDiv = document.createElement('div');
            nameDiv.className = 'name';
            nameDiv.textContent = image.title;
            
            const desDiv = document.createElement('div');
            desDiv.className = 'des';
            desDiv.textContent = image.description;
            
            // 创建链接按钮并阻止事件冒泡
            const linkBtn = document.createElement('a');
            linkBtn.href = image.link || '#';
            linkBtn.target = "_blank";
            linkBtn.rel = "noopener noreferrer";
            linkBtn.className = 'btn-detail';
            linkBtn.textContent = '查看详情';
            
            // 阻止按钮点击事件冒泡到轮播项
            linkBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡到轮播项
            });
            
            // 将元素添加到内容区域
            content.appendChild(nameDiv);
            content.appendChild(desDiv);
            content.appendChild(linkBtn);
            
            item.appendChild(content);
            slideContainer.appendChild(item);
        });
    }
    
    // 启动自动轮播 - 确保在启动前先停止任何已存在的计时器
    function startAutoSlide() {
        // 确保先停止任何现有的计时器
        stopAutoSlide();
        
        timer = setInterval(() => {
            if (!isAnimating) {
                _direction = true;
                animateSlide();
            }
        }, slideInterval);
    }

    // 停止自动轮播
    function stopAutoSlide() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // 执行滑动动画
    function animateSlide() {
        if (isAnimating) {
            // 如果正在动画中，不执行新的动画
            return false;
        }
        
        const slideContainer = document.querySelector("#slide");
        if (!slideContainer) return false; // 确保元素存在
        
        isAnimating = true;
        let lists = document.querySelectorAll(".item");
        
        // 添加过渡类，以防止闪烁
        lists.forEach(item => {
            item.style.transition = "all 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)";
        });
        
        if (_direction) {
            // 向左移动
            const firstItem = lists[0];
            slideContainer.appendChild(firstItem);
        } else {
            // 向右移动
            const lastItem = lists[lists.length - 1];
            
            // 临时使最后一个项透明
            lastItem.style.opacity = "0";
            lastItem.style.transform = "translateX(50px) scale(0.8) translateZ(0)";
            
            // 移动DOM元素
            slideContainer.prepend(lastItem);
            
            // 强制浏览器重绘
            void lastItem.offsetWidth;
            
            // 恢复可见性和正确的位置
            setTimeout(() => {
                lastItem.style.opacity = "";
                lastItem.style.transform = "";
            }, 50);
        }
        
        // 设置一个严格的定时器，确保动画锁定被释放
        setTimeout(() => {
            isAnimating = false;
            
            // 如果有排队的动画请求，现在执行它
            if (queuedAnimation) {
                const { direction } = queuedAnimation;
                queuedAnimation = null;
                _direction = direction;
                animateSlide();
            }
        }, animationDuration + 50); // 添加一点额外时间以确保动画完成
        
        return true;
    }
    
    // --------------------- 移动端轮播逻辑 ---------------------
    let currentMobileSlide = 0;
    let mobileSlideCount = 0;
    let mobileAutoSlideTimer = null;
    let mobileSliding = false;
    let mobileSlideAnimationTimer = null; // 添加动画计时器变量
    
    // 初始化移动版轮播 - 修改为使用DOM API创建元素并阻止冒泡
    function initMobileCarousel() {
        const mobileSlider = document.querySelector('.mobile-slider');
        const mobileIndicators = document.querySelector('.mobile-indicators');
        
        if (!mobileSlider || !mobileIndicators) return; // 确保元素存在
        
        // 清空容器
        mobileSlider.innerHTML = '';
        mobileIndicators.innerHTML = '';
        
        // 为每个图片创建对应的移动轮播项
        carouselImages.forEach((image, index) => {
            // 创建移动轮播项
            const mobileSlide = document.createElement('div');
            mobileSlide.className = 'mobile-slide';
            mobileSlide.style.backgroundImage = `url(${image.url})`;
            
            // 第一个幻灯片为激活状态
            if (index === 0) {
                mobileSlide.classList.add('active');
            }
            
            // 创建内容区域
            const mobileContent = document.createElement('div');
            mobileContent.className = 'mobile-content';
            
            // 创建标题
            const mobileTitle = document.createElement('div');
            mobileTitle.className = 'mobile-title';
            mobileTitle.textContent = image.title;
            
            // 创建描述
            const mobileDescription = document.createElement('div');
            mobileDescription.className = 'mobile-description';
            mobileDescription.textContent = image.description;
            
            // 创建链接按钮
            const mobileButton = document.createElement('a');
            mobileButton.href = image.link || '#';
            mobileButton.target = "_blank";
            mobileButton.rel = "noopener noreferrer";
            mobileButton.className = 'mobile-button';
            mobileButton.textContent = '查看详情';
            
            // 防止按钮点击事件冒泡
            mobileButton.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            
            // 添加到内容区域
            mobileContent.appendChild(mobileTitle);
            mobileContent.appendChild(mobileDescription);
            mobileContent.appendChild(mobileButton);
            
            mobileSlide.appendChild(mobileContent);
            mobileSlider.appendChild(mobileSlide);
            
            // 创建指示器
            const indicator = document.createElement('div');
            indicator.className = 'mobile-dot' + (index === 0 ? ' active' : '');
            indicator.dataset.index = index;
            indicator.addEventListener('click', () => {
                goToMobileSlide(index);
            });
            mobileIndicators.appendChild(indicator);
        });
        
        mobileSlideCount = carouselImages.length;
        
        // 添加导航按钮事件
        const prevButton = document.querySelector('.mobile-nav-button.prev');
        const nextButton = document.querySelector('.mobile-nav-button.next');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                prevMobileSlide();
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                nextMobileSlide();
            });
        }
        
        // 添加触摸滑动支持 - 修复移动端滑动问题
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchMoveX = 0;
        let touchMoveY = 0;
        let isHorizontalSwipe = false;
        let isTouchStart = false;
        
        const mobileCarousel = document.querySelector('.mobile-carousel');
        if (!mobileCarousel) return;
        
        mobileCarousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isTouchStart = true;
            isHorizontalSwipe = false;
            stopMobileAutoSlide();
        }, { passive: false });
        
        mobileCarousel.addEventListener('touchmove', (e) => {
            if (!isTouchStart) return;
            
            touchMoveX = e.touches[0].clientX;
            touchMoveY = e.touches[0].clientY;
            
            // 计算水平和垂直移动距离
            const diffX = Math.abs(touchMoveX - touchStartX);
            const diffY = Math.abs(touchMoveY - touchStartY);
            
            // 如果是第一次确定滑动方向，并且水平移动大于垂直移动和阈值
            if (!isHorizontalSwipe && diffX > diffY && diffX > 10) {
                isHorizontalSwipe = true;
            }
            
            // 如果确定是水平滑动，阻止默认行为（页面滚动）
            if (isHorizontalSwipe) {
                e.preventDefault();
            }
        }, { passive: false });
        
        mobileCarousel.addEventListener('touchend', (e) => {
            if (!isTouchStart) return;
            
            touchEndX = e.changedTouches[0].clientX;
            isTouchStart = false;
            
            // 只有确定是水平滑动时才处理轮播切换
            if (isHorizontalSwipe) {
                handleMobileSwipe();
            }
            
            startMobileAutoSlide();
        }, { passive: false });
        
        function handleMobileSwipe() {
            const swipeThreshold = 50; // 最小滑动距离
            if (mobileSliding) return;
            
            if (touchEndX - touchStartX > swipeThreshold) {
                // 向右滑动，显示上一张
                prevMobileSlide();
            } else if (touchStartX - touchEndX > swipeThreshold) {
                // 向左滑动，显示下一张
                nextMobileSlide();
            }
        }
        
        // 开始自动轮播
        startMobileAutoSlide();
    }
    
    // 跳转到指定幻灯片 - 优化版
    function goToMobileSlide(index) {
        // 如果目标幻灯片就是当前幻灯片，不执行操作
        if (index === currentMobileSlide) return;
        
        // 即使正在滑动，也取消当前动画，立即执行新的滑动请求
        // 这样可以处理快速连续点击的情况
        clearTimeout(mobileSlideAnimationTimer);
        
        // 标记正在滑动
        mobileSliding = true;
        
        // 移除所有幻灯片的active类
        const slides = document.querySelectorAll('.mobile-slide');
        slides.forEach(slide => slide.classList.remove('active'));
        
        // 更新当前索引
        currentMobileSlide = index;
        
        // 立即更新轮播位置，无需延迟
        const mobileSlider = document.querySelector('.mobile-slider');
        if (mobileSlider) {
            mobileSlider.style.transform = `translateX(-${currentMobileSlide * 100}%)`;
        }
        
        // 给当前幻灯片添加active类
        if (slides[currentMobileSlide]) {
            slides[currentMobileSlide].classList.add('active');
        }
        
        // 更新指示器
        const dots = document.querySelectorAll('.mobile-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentMobileSlide);
        });
        
        // 使用较短的动画完成时间
        let animationCompleteTime = 400; // 从原来的600ms减少到400ms
        
        // 动画完成后重置状态
        mobileSlideAnimationTimer = setTimeout(() => {
            mobileSliding = false;
        }, animationCompleteTime);
    }
    
    // 显示下一张幻灯片 - 优化处理连续点击
    function nextMobileSlide() {
        let nextIndex = (currentMobileSlide + 1) % mobileSlideCount;
        goToMobileSlide(nextIndex);
    }
    
    // 显示上一张幻灯片 - 优化处理连续点击
    function prevMobileSlide() {
        let prevIndex = (currentMobileSlide - 1 + mobileSlideCount) % mobileSlideCount;
        goToMobileSlide(prevIndex);
    }
    
    // 启动自动轮播 - 确保在启动前先停止任何已存在的计时器
    function startMobileAutoSlide() {
        // 确保先停止任何现有的计时器
        stopMobileAutoSlide();
        
        mobileAutoSlideTimer = setInterval(() => {
            nextMobileSlide();
        }, 4000); // 4秒切换一次
    }
    
    // 停止自动轮播
    function stopMobileAutoSlide() {
        if (mobileAutoSlideTimer) {
            clearInterval(mobileAutoSlideTimer);
            mobileAutoSlideTimer = null;
        }
    }
    
    // 创建轮播项
    createCarouselItems();
    
    // 初始化桌面版轮播事件监听 - 修复缩略图点击处理
    function initDesktopCarouselEvents() {
        // 缩略图点击事件处理
        const thumbnails = document.querySelectorAll(".item:nth-child(n+3)");
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', (e) => {
                // 如果点击的是详情按钮或其子元素，不执行轮播逻辑
                if (e.target.classList.contains('btn-detail') || 
                    e.target.closest('.btn-detail')) {
                    return;
                }
                
                if (isAnimating) return;
                
                // 计算需要移动的次数（往前移动）
                let movesNeeded = index + 1;
                
                // 设置方向为向左移动
                _direction = true;
                stopAutoSlide();
                
                // 创建一个函数来执行多次移动
                const multipleMove = (count) => {
                    if (count <= 0) {
                        startAutoSlide();
                        return;
                    }
                    
                    if (animateSlide()) {
                        setTimeout(() => multipleMove(count - 1), animationDuration + 100);
                    }
                };
                
                // 开始移动
                multipleMove(movesNeeded);
            });
        });
        
        // 找到所有切换按钮
        const buttons = document.querySelectorAll(".s_button");
        if (buttons.length >= 2) {
            // 点击右箭头按钮
            buttons[1].onclick = () => {  
                _direction = true;
                
                // 如果可以立即执行动画
                if (!isAnimating) {
                    stopAutoSlide();
                    if (animateSlide()) {
                        startAutoSlide();
                    }
                } else {
                    // 如果当前正在动画中，将请求加入队列
                    queuedAnimation = { direction: true };
                }
            };

            // 点击左箭头按钮 
            buttons[0].onclick = () => {  
                _direction = false;
                
                // 如果可以立即执行动画
                if (!isAnimating) {
                    stopAutoSlide();
                    if (animateSlide()) {
                        startAutoSlide();
                    }
                } else {
                    // 如果当前正在动画中，将请求加入队列
                    queuedAnimation = { direction: false };
                }
            };
        }
        
        // 鼠标悬停事件
        const desktopCarousel = document.querySelector(".desktop-carousel");
        if (desktopCarousel) {
            desktopCarousel.addEventListener("mouseover", () => {  
                stopAutoSlide();
            });  

            desktopCarousel.addEventListener("mouseout", () => {  
                startAutoSlide();
            });
        }
    }
    
    // 初始化桌面版轮播事件
    initDesktopCarouselEvents();
    
    // 初始化移动版轮播
    initMobileCarousel();
    
    // 启动桌面版自动轮播
    startAutoSlide();
    
    // 检查是否需要显示哪个轮播版本
    checkCarouselVersion();
    
    // 当窗口大小改变时，检查是否需要切换轮播版本
    window.addEventListener('resize', checkCarouselVersion);
    
    // 检查屏幕尺寸并决定显示哪个轮播版本
    function checkCarouselVersion() {
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        
        const desktopCarousel = document.querySelector('.desktop-carousel');
        const mobileCarousel = document.querySelector('.mobile-carousel');
        
        if (!desktopCarousel || !mobileCarousel) return;
        
        if (isMobile) {
            desktopCarousel.style.display = 'none';
            mobileCarousel.style.display = 'block';
            
            // 如果切换到移动版，确保移动版轮播正常运行
            stopAutoSlide();
            startMobileAutoSlide();
        } else {
            desktopCarousel.style.display = 'block';
            mobileCarousel.style.display = 'none';
            
            // 如果切换到桌面版，确保桌面版轮播正常运行
            stopMobileAutoSlide();
            startAutoSlide();
        }
    }
});