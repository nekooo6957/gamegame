/**
 * 主入口文件
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 创建UI实例并初始化
    window.gameUI = new UI();
    window.gameUI.init();

    console.log('游戏已加载');
});
