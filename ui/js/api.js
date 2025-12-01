// API配置
const API_BASE_URL = 'http://localhost:8080/api';

// 获取Token（如果Mock API已定义，使用Mock版本，否则定义新函数）
// 使用立即执行函数创建作用域，避免重复声明
const getToken = (function() {
    const tokenGetter = window.getToken;
    if (tokenGetter) {
        return function() {
            return tokenGetter();
        };
    }
    return function() {
        return localStorage.getItem('token');
    };
})();

// 设置Token（如果Mock API已定义，使用Mock版本，否则定义新函数）
const setToken = (function() {
    const tokenSetter = window.setToken;
    if (tokenSetter) {
        return function(token) {
            tokenSetter(token);
        };
    }
    return function(token) {
        localStorage.setItem('token', token);
    };
})();

// 移除Token（如果Mock API已定义，使用Mock版本，否则定义新函数）
const removeToken = (function() {
    const tokenRemover = window.removeToken;
    if (tokenRemover) {
        return function() {
            tokenRemover();
        };
    }
    return function() {
        localStorage.removeItem('token');
    };
})();

// 通用API请求方法
// 如果Mock API已定义（在mock-api.js中），则使用Mock版本，否则使用真实API
const apiRequest = window.apiRequest || async function(url, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {}),
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, finalOptions);
        const data = await response.json();

        if (response.status === 401) {
            // Token过期，跳转到登录页
            removeToken();
            window.location.href = 'login.html';
            return;
        }

        if (data.code !== 200) {
            throw new Error(data.message || '请求失败');
        }

        return data;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
};

// 机构相关API
const OrgAPI = {
    // 获取一级机构列表
    getLevel1List: () => apiRequest('/organizations/level1'),
    
    // 获取二级机构列表
    getLevel2List: (parentId) => apiRequest(`/organizations/level2?parentId=${parentId}`),
    
    // 获取三级机构列表
    getLevel3List: (parentId) => apiRequest(`/organizations/level3?parentId=${parentId}`),
    
    // 创建一级机构
    createLevel1: (data) => apiRequest('/organizations/level1', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 创建二级机构
    createLevel2: (data) => apiRequest('/organizations/level2', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 创建三级机构
    createLevel3: (data) => apiRequest('/organizations/level3', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 更新机构
    update: (orgId, data) => apiRequest(`/organizations/${orgId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    // 删除机构
    delete: (orgId) => apiRequest(`/organizations/${orgId}`, {
        method: 'DELETE',
    }),
};

// 职位相关API
const PositionAPI = {
    // 获取职位列表
    getList: (thirdOrgId) => {
        const url = thirdOrgId ? `/positions?thirdOrgId=${thirdOrgId}` : '/positions';
        return apiRequest(url);
    },
    
    // 获取职位详情
    getDetail: (positionId) => apiRequest(`/positions/${positionId}`),
    
    // 创建职位
    create: (data) => apiRequest('/positions', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 更新职位
    update: (positionId, data) => apiRequest(`/positions/${positionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    // 删除职位
    delete: (positionId) => apiRequest(`/positions/${positionId}`, {
        method: 'DELETE',
    }),
};

// 薪酬项目相关API
const SalaryItemAPI = {
    // 获取薪酬项目列表
    getList: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/salary-items?${queryString}` : '/salary-items';
        return apiRequest(url);
    },
    
    // 获取薪酬项目详情
    getDetail: (itemId) => apiRequest(`/salary-items/${itemId}`),
    
    // 创建薪酬项目
    create: (data) => apiRequest('/salary-items', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 更新薪酬项目
    update: (itemId, data) => apiRequest(`/salary-items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    // 删除薪酬项目
    delete: (itemId) => apiRequest(`/salary-items/${itemId}`, {
        method: 'DELETE',
    }),
};

// 用户相关API
const UserAPI = {
    // 获取当前用户信息
    getCurrentUser: () => apiRequest('/users/me'),
};

// 将 apiRequest 暴露到全局，供 login.html 等页面使用
// 注意：getToken、setToken、removeToken 已经在 mock-api.js 中暴露，这里只暴露 apiRequest
if (typeof window !== 'undefined') {
    // 如果 mock-api.js 已经定义了 apiRequest，不要覆盖它
    if (!window.apiRequest) {
        window.apiRequest = apiRequest;
    }
    // getToken、setToken、removeToken 已经在 mock-api.js 中定义，不要重复赋值
}

