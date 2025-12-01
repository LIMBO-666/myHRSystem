// 员工档案相关API

const EmployeeArchiveAPI = {
    // 创建员工档案
    create: (data) => apiRequest('/employee-archives', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    // 获取档案详情
    getDetail: (archiveId) => apiRequest(`/employee-archives/${archiveId}`),
    
    // 更新员工档案
    update: (archiveId, data) => apiRequest(`/employee-archives/${archiveId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    
    // 删除员工档案
    delete: (archiveId, deleteReason) => apiRequest(`/employee-archives/${archiveId}`, {
        method: 'DELETE',
        body: JSON.stringify({ deleteReason }),
    }),
    
    // 获取待复核档案列表
    getPendingReviewList: (params = {}) => {
        const page = params.page || 1;
        const size = params.size || 10;
        const queryParams = new URLSearchParams({ page: page.toString(), size: size.toString() });
        
        if (params.archiveNumber) queryParams.append('archiveNumber', params.archiveNumber);
        if (params.name) queryParams.append('name', params.name);
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        
        return apiRequest(`/employee-archives/pending-review?${queryParams.toString()}`);
    },
    
    // 复核通过
    approveReview: (archiveId, reviewComments) => 
        apiRequest(`/employee-archives/${archiveId}/review/approve`, {
            method: 'POST',
            body: JSON.stringify({ reviewComments }),
        }),
    
    // 复核时修改并通过
    reviewWithModify: (archiveId, data) => 
        apiRequest(`/employee-archives/${archiveId}/review`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    
    // 查询员工档案
    query: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/employee-archives?${queryString}` : '/employee-archives';
        return apiRequest(url);
    },
    
    // 获取已删除档案列表
    getDeletedList: (page = 1, size = 10, params = {}) => {
        const queryParams = new URLSearchParams({ page: page.toString(), size: size.toString() });
        if (params.keyword) {
            queryParams.append('keyword', params.keyword);
        }
        return apiRequest(`/employee-archives/deleted?${queryParams.toString()}`);
    },
    
    // 恢复员工档案
    restore: (archiveId) => 
        apiRequest(`/employee-archives/${archiveId}/restore`, {
            method: 'POST',
        }),
    
    // 上传照片
    uploadPhoto: (archiveId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(`/employee-archives/${archiveId}/photo`, {
            method: 'POST',
            body: formData,
            headers: {}, // 不设置Content-Type，让浏览器自动设置
        });
    },
};

