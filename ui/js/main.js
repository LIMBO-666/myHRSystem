// 主入口文件

// 当前用户信息
let currentUserInfo = null;

// 角色权限配置 - 定义每个角色可以访问的菜单项
// 按照需求文档中的权限说明进行配置
const rolePermissions = {
    'HR_SPECIALIST': {
        // 人事专员：可进行档案登记、查询、变更
        'system': [], // 系统管理不在此角色权限范围内
        'archive': ['archive-register', 'archive-query'], // 档案登记、查询（变更功能在查询页面中）
        'salary': []
    },
    'HR_MANAGER': {
        // 人事经理：可进行档案复核、删除管理
        // 注意：系统管理员使用此角色，但权限应该包括系统管理
        // 这里保留系统管理权限，因为系统管理员使用的是HR_MANAGER角色
        'system': ['org-level1', 'org-level2', 'org-level3', 'position'],
        'archive': ['archive-review', 'archive-delete'], // 档案复核、删除管理（移除查询）
        'salary': []
    },
    'SALARY_SPECIALIST': {
        // 薪酬专员：可进行薪酬标准登记、薪酬发放登记、查询和变更（变更功能已整合到查询页面）
        'system': [], // 系统管理不在此角色权限范围内
        'archive': [],
        'salary': ['salary-standard-register', 'salary-issuance-register', 'salary-standard-query', 'salary-issuance-query'] // 登记、查询（变更功能在查询页面中）
    },
    'SALARY_MANAGER': {
        // 薪酬经理：可进行薪酬标准复核、薪酬发放复核、薪酬项目管理
        // 注意：薪酬标准查询功能已集成到薪酬标准复核模块中
        'system': ['salary-item'], // 薪酬项目管理
        'archive': [],
        'salary': ['salary-standard-review', 'salary-issuance-review', 'salary-issuance-query'] // 复核功能（查询功能在复核模块中）
    }
};

// 菜单项配置
const menuConfig = {
    'system': {
        title: '系统管理',
        items: [
            { page: 'org-level1', name: '一级机构' },
            { page: 'org-level2', name: '二级机构' },
            { page: 'org-level3', name: '三级机构' },
            { page: 'position', name: '职位设置' },
            { page: 'salary-item', name: '薪酬项目' }
        ]
    },
    'archive': {
        title: '人力资源档案管理',
        items: [
            { page: 'archive-register', name: '档案登记' },
            { page: 'archive-review', name: '登记复核' },
            { page: 'archive-query', name: '档案查询' },
            { page: 'archive-delete', name: '删除管理' }
        ]
    },
    'salary': {
        title: '薪酬管理',
        items: [
            { page: 'salary-standard-register', name: '薪酬标准登记' },
            { page: 'salary-standard-review', name: '薪酬标准复核' },
            { page: 'salary-standard-query', name: '薪酬标准查询' },
            // { page: 'salary-standard-update', name: '薪酬标准变更' }, // 已整合到查询页面，不再单独显示
            { page: 'salary-issuance-register', name: '薪酬发放登记' },
            { page: 'salary-issuance-review', name: '薪酬发放复核' },
            { page: 'salary-issuance-query', name: '薪酬发放查询' }
        ]
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    checkAuth();
    
    // 初始化退出按钮
    initLogout();
});

// 检查认证状态
async function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await UserAPI.getCurrentUser();
        if (response && response.data) {
            currentUserInfo = response.data;
            // 暴露到全局，供其他页面使用
            window.currentUserInfo = currentUserInfo;
            
            const usernameEl = document.getElementById('username');
            usernameEl.textContent = response.data.realName || response.data.username;
            
            // 根据角色生成菜单
            renderMenuByRole(response.data.role);
            
            // 初始化菜单点击事件
            initMenu();
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        removeToken();
        window.location.href = 'login.html';
    }
}

// 根据角色渲染菜单
function renderMenuByRole(role) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        console.error('未找到侧边栏元素');
        return;
    }
    
    // 获取当前角色的权限
    const permissions = rolePermissions[role] || {};
    
    // 清空侧边栏
    sidebar.innerHTML = '';
    
    // 遍历菜单配置，只显示有权限的菜单
    Object.keys(menuConfig).forEach(sectionKey => {
        const section = menuConfig[sectionKey];
        const allowedPages = permissions[sectionKey] || [];
        
        // 如果该模块没有任何权限，则不显示
        if (allowedPages.length === 0) {
            return;
        }
        
        // 创建菜单组
        const menuGroup = document.createElement('div');
        menuGroup.className = 'menu-group';
        
        const title = document.createElement('h2');
        title.textContent = section.title;
        menuGroup.appendChild(title);
        
        const menuList = document.createElement('ul');
        menuList.className = 'menu';
        
        // 添加菜单项
        section.items.forEach(item => {
            // 检查是否有权限访问该菜单项
            if (allowedPages.includes(item.page)) {
                const menuItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.dataset.page = item.page;
                link.textContent = item.name;
                menuItem.appendChild(link);
                menuList.appendChild(menuItem);
            }
        });
        
        // 如果菜单组有内容，则添加到侧边栏
        if (menuList.children.length > 0) {
            menuGroup.appendChild(menuList);
            sidebar.appendChild(menuGroup);
        }
    });
}

// 初始化菜单
function initMenu() {
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.dataset.page;
            if (pageName) {
                loadPage(pageName);
            }
        });
    });
}

// 初始化退出按钮
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('确定要退出登录吗？')) {
                try {
                    await apiRequest('/auth/logout', { method: 'POST' });
                } catch (error) {
                    console.error('登出失败:', error);
                    // 即使API调用失败，也清除本地Token并跳转
                } finally {
                    removeToken();
                    window.location.href = 'login.html';
                }
            }
        });
    }
}

