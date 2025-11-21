// 薪酬发放相关API

const SalaryIssuanceAPI = {
    // 获取待登记薪酬发放单列表
    getPendingRegistration: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/salary-issuances/pending-registration?${queryString}` : '/salary-issuances/pending-registration';
        return apiRequest(url);
    },
    
    // 登记薪酬发放单
    create: (data) => apiRequest('/salary-issuances', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 获取薪酬发放单详情
    getDetail: (issuanceId) => apiRequest(`/salary-issuances/${issuanceId}`),
    
    // 获取待复核薪酬发放单列表
    getPendingReview: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/salary-issuances/pending-review?${queryString}` : '/salary-issuances/pending-review';
        return apiRequest(url);
    },
    
    // 复核通过
    approve: (issuanceId, data) => apiRequest(`/salary-issuances/${issuanceId}/review/approve`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 复核驳回
    reject: (issuanceId, rejectReason) => apiRequest(`/salary-issuances/${issuanceId}/review/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectReason }),
    }),
    
    // 查询薪酬发放单
    query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/salary-issuances?${queryString}` : '/salary-issuances';
        return apiRequest(url);
    },
};

