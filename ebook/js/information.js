document.addEventListener('DOMContentLoaded', function () {
    // 添加页面加载动画
    window.addEventListener('load', function() {
        // 所有内容加载完成后，添加页面入场动画
        document.querySelector('.ebook-container').style.opacity = '0';
        document.querySelector('.control-frame').style.opacity = '0';
        document.querySelector('.ebook-info').style.opacity = '0';
        
        setTimeout(() => {
            document.querySelector('.ebook-container').style.transition = 'opacity 0.5s ease';
            document.querySelector('.control-frame').style.transition = 'opacity 0.5s ease 0.2s';
            document.querySelector('.ebook-info').style.transition = 'opacity 0.5s ease 0.4s';
            
            document.querySelector('.ebook-container').style.opacity = '1';
            document.querySelector('.control-frame').style.opacity = '1';
            document.querySelector('.ebook-info').style.opacity = '1';
        }, 100);
    });
});