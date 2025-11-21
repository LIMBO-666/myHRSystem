// 薪酬标准相关API

const SalaryStandardAPI = {
    // 创建薪酬标准
    create: (data) => apiRequest('/salary-standards', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 获取待复核薪酬标准列表
    getPendingReview: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/salary-standards/pending-review?${queryString}` : '/salary-standards/pending-review';
        return apiRequest(url);
    },
    
    // 获取薪酬标准详情
    getDetail: (standardId) => apiRequest(`/salary-standards/${standardId}`),
    
    // 复核通过
    approve: (standardId, reviewComments) => apiRequest(`/salary-standards/${standardId}/review/approve`, {
        method: 'POST',
        body: JSON.stringify({ reviewComments }),
    }),
    
    // 复核驳回
    reject: (standardId, reviewComments) => apiRequest(`/salary-standards/${standardId}/review/reject`, {
        method: 'POST',
        body: JSON.stringify({ reviewComments }),
    }),
    
    // 查询薪酬标准
    query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/salary-standards?${queryString}` : '/salary-standards';
        return apiRequest(url);
    },
    
    // 更新薪酬标准
    update: (standardId, data) => apiRequest(`/salary-standards/${standardId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    // 根据职位和职称获取薪酬标准
    getByPosition: (positionId, jobTitle) => 
        apiRequest(`/salary-standards/by-position?positionId=${positionId}&jobTitle=${jobTitle}`),
};

