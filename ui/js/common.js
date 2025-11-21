// 通用工具函数

// 显示消息提示
function showMessage(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        contentArea.insertBefore(alertDiv, contentArea.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

// 显示确认对话框
function showConfirm(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 格式化日期时间
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

// 创建模态框
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    setTimeout(() => modal.classList.add('show'), 10);
    
    return { modal, closeModal };
}

// 页面加载函数映射表
const pageLoaders = {
    'org-level1': 'loadOrgLevel1Page',
    'org-level2': 'loadOrgLevel2Page',
    'org-level3': 'loadOrgLevel3Page',
    'position': 'loadPositionPage',
    'salary-item': 'loadSalaryItemPage',
    'archive-register': 'loadArchiveRegisterPage',
    'archive-review': 'loadArchiveReviewPage',
    'archive-query': 'loadArchiveQueryPage',
    'archive-delete': 'loadArchiveDeletePage',
    'salary-standard-register': 'loadSalaryStandardRegisterPage',
    'salary-standard-review': 'loadSalaryStandardReviewPage',
    'salary-standard-query': 'loadSalaryStandardQueryPage',
    'salary-standard-update': 'loadSalaryStandardUpdatePage',
    'salary-issuance-register': 'loadSalaryIssuanceRegisterPage',
    'salary-issuance-review': 'loadSalaryIssuanceReviewPage',
    'salary-issuance-query': 'loadSalaryIssuanceQueryPage'
};

// 加载页面内容
async function loadPage(pageName) {
    const contentArea = document.getElementById('content-area');
    
    // 更新菜单激活状态
    document.querySelectorAll('.menu a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // 根据页面名称加载对应内容
    try {
        const funcName = pageLoaders[pageName];
        if (funcName) {
            // 检查函数是否存在
            if (typeof window[funcName] === 'function') {
                await window[funcName]();
            } else {
                throw new Error(`页面加载函数 ${funcName} 未定义。请按 Ctrl+F5 强制刷新页面清除缓存。`);
            }
        } else {
            contentArea.innerHTML = `
                <div class="welcome">
                    <h2>欢迎使用人力资源管理系统</h2>
                    <p>请从左侧菜单选择功能模块</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('加载页面失败:', error);
        const errorMsg = error.message || '未知错误';
        contentArea.innerHTML = `
            <div class="welcome">
                <h2 style="color: #ff4d4f;">加载页面失败</h2>
                <p style="color: #ff4d4f;">${errorMsg}</p>
                <p style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="location.reload(true)">强制刷新页面</button>
                </p>
            </div>
        `;
        showMessage('加载页面失败：' + errorMsg, 'error');
    }
}

