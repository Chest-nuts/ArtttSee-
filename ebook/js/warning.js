// 警告组件 - 折叠展开功能
document.addEventListener('DOMContentLoaded', function() {
    const warningContainer = document.getElementById('warning-container');
    const warningHeader = document.getElementById('warning-header');
    const warningToggle = document.getElementById('warning-toggle');
    
    // 检查是否已折叠（使用sessionStorage保持会话内状态）
    const isCollapsed = sessionStorage.getItem('warningCollapsed') === 'true';
    
    // 初始化时设置正确的文本和样式
    if (isCollapsed) {
        warningContainer.classList.add('warning-collapsed');
        warningToggle.textContent = '展开';
    } else {
        // 明确设置为非折叠状态的文本
        warningToggle.textContent = '收回';
    }
    
    // 切换折叠/展开状态
    function toggleWarning() {
        warningContainer.classList.toggle('warning-collapsed');
        
        // 更新按钮文字和存储状态
        if (warningContainer.classList.contains('warning-collapsed')) {
            warningToggle.textContent = '展开';
            sessionStorage.setItem('warningCollapsed', 'true');
        } else {
            warningToggle.textContent = '收回';
            sessionStorage.setItem('warningCollapsed', 'false');
        }
    }
    
    // 点击标题行切换折叠状态
    if (warningHeader) {
        warningHeader.addEventListener('click', toggleWarning);
    }
    
    // 全屏模式相关逻辑
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        let fullscreenToggled = false;
        
        fullscreenBtn.addEventListener('click', function() {
            fullscreenToggled = true;
        });
        
        // 监听全屏变化
        document.addEventListener('fullscreenchange', function() {
            if (fullscreenToggled && !document.fullscreenElement) {
                // 全屏退出后，如果警告已折叠，自动展开提示问题已解决
                if (warningContainer.classList.contains('warning-collapsed')) {
                    setTimeout(function() {
                        warningContainer.classList.remove('warning-collapsed');
                        warningToggle.textContent = '收回';
                        sessionStorage.setItem('warningCollapsed', 'false');
                    }, 1000);
                }
            }
        });
    }
});