/**
 * 导航栏组件 - 用于在所有页面动态插入相同的导航栏
 */
class NavComponent {
    constructor(options = {}) {
      // 默认配置
      this.options = Object.assign({
        activePage: '首页',     // 当前活动页面的ID
        cssPath: './nav.css',  // 导航栏CSS路径
        basePath: ''           // 基础路径，用于正确加载资源
      }, options);
      
      // 初始化组件
      this.init();
    }
    
    init() {
      // 加载CSS
      this.loadCSS();
      // 插入导航HTML
      this.renderNav();
      // 使用setTimeout确保DOM已更新
      setTimeout(() => {
        this.initNavFunctionality();
      }, 0);
    }
    
    loadCSS() {
      // 检查是否已经加载了导航栏CSS
      if (!document.querySelector(`link[href="${this.options.cssPath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = this.options.cssPath;
        document.head.appendChild(link);
      }
    }
    
    renderNav() {
      const navHTML = `
        <nav>
          <a href="${this.options.basePath}#" class="logo">
            <img src="${this.options.basePath}/logo.png" alt="网站 logo">
          </a>
          <ul id="nav-list">
            <li><a href="${this.options.basePath}#" ${this.options.activePage === '首页' ? 'class="active"' : ''}>首页</a></li>
            <li><a href="${this.options.basePath}#" ${this.options.activePage === '设定集' ? 'class="active"' : ''}>设定集</a></li>
            <li><a href="${this.options.basePath}#" ${this.options.activePage === '画集' ? 'class="active"' : ''}>画集</a></li>
            <li><a href="${this.options.basePath}#" ${this.options.activePage === '捐赠' ? 'class="active"' : ''}>捐赠</a></li>
          </ul>
          <div class="search-bar">
            <input type="text" placeholder="搜索设定集...">
            <button>搜索</button>
          </div>
          <div class="hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      `;
      
      // 在页面开始处插入导航栏
      const firstElement = document.body.firstChild;
      const navElement = document.createElement('div');
      navElement.innerHTML = navHTML;
      document.body.insertBefore(navElement.firstElementChild, firstElement);
    }
    
    initNavFunctionality() {
      // 获取导航元素
      const hamburgerMenu = document.querySelector('.hamburger-menu');
      const navList = document.querySelector('#nav-list');
      const navLinks = document.querySelectorAll('#nav-list li a');
      const searchInput = document.querySelector('.search-bar input');
      const searchButton = document.querySelector('.search-bar button');
      const nav = document.querySelector('nav');
      
      // 确保所有元素都存在
      if (!hamburgerMenu || !navList || !nav) {
        console.error('导航栏元素未找到，无法初始化功能');
        return;
      }
      
      // 汉堡菜单点击事件 - 添加更详细的调试
      hamburgerMenu.addEventListener('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        console.log('汉堡菜单被点击');
        
        // 切换导航列表的显示状态
        navList.classList.toggle('show');
        
        // 切换汉堡菜单样式（变为X形状）
        hamburgerMenu.classList.toggle('active');
      });
      
      // 点击导航链接关闭移动导航菜单
      navLinks.forEach(link => {
        link.addEventListener('click', function () {
          // 只在移动视图下执行关闭操作
          if (window.innerWidth <= 768) {
            navList.classList.remove('show');
            hamburgerMenu.classList.remove('active');
          }
        });
      });
      
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
        
        // 按下回车键也可以搜索
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
          console.log('搜索:', searchTerm);
        }
      }
      
      // 滚动时改变导航栏样式
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
      
      // 窗口大小变化时的处理
      let resizeTimeout;
      
      function handleResize() {
        clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(function() {
          if (window.innerWidth > 768 && navList.classList.contains('show')) {
            navList.classList.remove('show');
            hamburgerMenu.classList.remove('active');
          }
          
          if (window.innerWidth > 768) {
            nav.style.height = window.pageYOffset > 50 ? '50px' : '55px';
            nav.style.padding = '0 50px';
          } else {
            nav.style.height = 'auto';
            nav.style.padding = window.pageYOffset > 50 ? '5px 15px' : '8px 15px';
          }
        }, 100);
      }
      
      window.addEventListener('resize', handleResize);
      
      // 初始设置导航高度
      if (window.innerWidth > 768) {
        nav.style.height = '55px';
        nav.style.padding = '0 50px';
      } else {
        nav.style.height = 'auto';
        nav.style.padding = '8px 15px';
      }
      
      // 点击页面其他地方关闭移动菜单
      document.addEventListener('click', function(event) {
        const isClickInsideNav = nav.contains(event.target);
        
        if (!isClickInsideNav && navList.classList.contains('show') && window.innerWidth <= 768) {
          navList.classList.remove('show');
          hamburgerMenu.classList.remove('active');
        }
      });
    }
  }
  
  // 在页面元素加载完成后初始化
  window.addEventListener('load', () => {
    // 检查是否有data-nav-active属性来设置当前活动页面
    const navElement = document.querySelector('[data-nav-active]');
    const activePage = navElement ? navElement.getAttribute('data-nav-active') : '首页';
    
    // 检查是否有data-nav-base属性来设置基础路径
    const baseElement = document.querySelector('[data-nav-base]');
    const basePath = baseElement ? baseElement.getAttribute('data-nav-base') : '';
    
    // 检查是否有data-nav-css属性来设置CSS路径
    const cssElement = document.querySelector('[data-nav-css]');
    const cssPath = cssElement ? cssElement.getAttribute('data-nav-css') : '../css/导航.css';
    
    // 初始化导航栏
    new NavComponent({
      activePage: activePage,
      basePath: basePath,
      cssPath: cssPath
    });
  });