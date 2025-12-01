// Mock API实现
// 在api.js之前加载，用于拦截API请求

const USE_MOCK = true; // 设置为false则使用真实API

// Token管理函数（在api.js之前定义，供Mock API使用）
// 直接赋值给 window，避免函数声明提升导致的重复声明问题
window.getToken = function() {
    return localStorage.getItem('token');
};

window.setToken = function(token) {
    localStorage.setItem('token', token);
};

window.removeToken = function() {
    localStorage.removeItem('token');
};

if (USE_MOCK) {
    // 定义Mock版本的apiRequest函数（在api.js加载前定义，供api.js使用）
    window.apiRequest = async function(url, options = {}) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const method = options.method || 'GET';
        // 处理FormData和JSON
        let body = {};
        if (options.body) {
            if (options.body instanceof FormData) {
                // FormData需要特殊处理，保存到options中供后续使用
                options.file = options.body.get('file');
                body = {}; // FormData不能直接解析为JSON
            } else {
                try {
                    body = JSON.parse(options.body);
                } catch (e) {
                    body = {};
                }
            }
        }
        
        try {
            let result;
            
            // 登录接口
            if (url === '/auth/login' && method === 'POST') {
                const { username, password } = body;
                // 总是从最新的MockData中查找用户
                const user = MockData.users.find(u => u.username === username);
                
                if (user && password === 'password123') {
                    const token = 'mock_token_' + Date.now();
                    setToken(token);
                    // 保存当前登录用户信息到localStorage（使用最新的数据）
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    result = {
                        code: 200,
                        message: '登录成功',
                        data: {
                            token: token,
                            refreshToken: token + '_refresh',
                            expiresIn: 3600,
                            user: user
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('用户名或密码错误');
                }
            }
            // 登出接口
            else if (url === '/auth/logout' && method === 'POST') {
                // 清除当前用户信息
                localStorage.removeItem('currentUser');
                result = { code: 200, message: '登出成功', data: null, timestamp: Date.now() };
            }
            // 获取当前用户
            else if (url === '/users/me' && method === 'GET') {
                const token = getToken();
                if (!token) throw new Error('未登录');
                
                // 从localStorage获取当前登录用户信息
                const currentUserStr = localStorage.getItem('currentUser');
                if (currentUserStr) {
                    const savedUser = JSON.parse(currentUserStr);
                    // 从最新的MockData中查找用户，确保使用最新的数据
                    const latestUser = MockData.users.find(u => u.username === savedUser.username);
                    const currentUser = latestUser || savedUser;
                    
                    // 更新localStorage中的用户信息为最新数据
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    result = {
                        code: 200,
                        message: '获取成功',
                        data: currentUser,
                        timestamp: Date.now()
                    };
                } else {
                    // 如果没有保存的用户信息，默认返回第一个用户
                    result = {
                        code: 200,
                        message: '获取成功',
                        data: MockData.users[0],
                        timestamp: Date.now()
                    };
                }
            }
            // 获取一级机构列表
            else if (url === '/organizations/level1' && method === 'GET') {
                const orgs = MockData.organizations.filter(o => o.orgLevel === 1);
                result = { code: 200, message: '查询成功', data: orgs, timestamp: Date.now() };
            }
            // 获取二级机构列表
            else if (url.startsWith('/organizations/level2') && method === 'GET') {
                const parentId = parseInt(new URLSearchParams(url.split('?')[1]).get('parentId'));
                const orgs = MockData.organizations.filter(o => o.orgLevel === 2 && o.parentId === parentId);
                result = { code: 200, message: '查询成功', data: orgs, timestamp: Date.now() };
            }
            // 获取三级机构列表
            else if (url.startsWith('/organizations/level3') && method === 'GET') {
                const parentId = parseInt(new URLSearchParams(url.split('?')[1]).get('parentId'));
                const orgs = MockData.organizations.filter(o => o.orgLevel === 3 && o.parentId === parentId);
                result = { code: 200, message: '查询成功', data: orgs, timestamp: Date.now() };
            }
            // 创建一级机构
            else if (url === '/organizations/level1' && method === 'POST') {
                const newOrg = {
                    orgId: MockData.nextOrgId++,
                    orgCode: body.orgCode || '01',
                    orgName: body.orgName,
                    orgLevel: 1,
                    parentId: null,
                    status: 'ACTIVE'
                };
                MockData.organizations.push(newOrg);
                saveMockData();
                result = { code: 200, message: '创建成功', data: newOrg, timestamp: Date.now() };
            }
            // 创建二级机构
            else if (url === '/organizations/level2' && method === 'POST') {
                const newOrg = {
                    orgId: MockData.nextOrgId++,
                    orgCode: body.orgCode || '01',
                    orgName: body.orgName,
                    orgLevel: 2,
                    parentId: body.parentId,
                    status: 'ACTIVE'
                };
                MockData.organizations.push(newOrg);
                saveMockData();
                result = { code: 200, message: '创建成功', data: newOrg, timestamp: Date.now() };
            }
            // 创建三级机构
            else if (url === '/organizations/level3' && method === 'POST') {
                const newOrg = {
                    orgId: MockData.nextOrgId++,
                    orgCode: body.orgCode || '01',
                    orgName: body.orgName,
                    orgLevel: 3,
                    parentId: body.parentId,
                    status: 'ACTIVE'
                };
                MockData.organizations.push(newOrg);
                saveMockData();
                result = { code: 200, message: '创建成功', data: newOrg, timestamp: Date.now() };
            }
            // 更新机构
            else if (url.match(/^\/organizations\/(\d+)$/) && method === 'PUT') {
                const orgId = parseInt(url.match(/^\/organizations\/(\d+)$/)[1]);
                const org = MockData.organizations.find(o => o.orgId === orgId);
                if (org) {
                    Object.assign(org, body);
                    saveMockData();
                    result = { code: 200, message: '更新成功', data: org, timestamp: Date.now() };
                } else {
                    throw new Error('机构不存在');
                }
            }
            // 删除机构
            else if (url.match(/^\/organizations\/(\d+)$/) && method === 'DELETE') {
                const orgId = parseInt(url.match(/^\/organizations\/(\d+)$/)[1]);
                const org = MockData.organizations.find(o => o.orgId === orgId);
                if (org) {
                    org.status = 'INACTIVE';
                    saveMockData();
                    result = { code: 200, message: '删除成功', data: null, timestamp: Date.now() };
                } else {
                    throw new Error('机构不存在');
                }
            }
            // 获取职位列表
            else if (url.startsWith('/positions') && method === 'GET') {
                let positions = [...MockData.positions];
                if (url.includes('thirdOrgId=')) {
                    const thirdOrgId = parseInt(new URLSearchParams(url.split('?')[1]).get('thirdOrgId'));
                    positions = positions.filter(p => p.thirdOrgId === thirdOrgId);
                }
                result = { code: 200, message: '查询成功', data: positions, timestamp: Date.now() };
            }
            // 获取职位详情
            else if (url.match(/^\/positions\/(\d+)$/) && method === 'GET') {
                const positionId = parseInt(url.match(/^\/positions\/(\d+)$/)[1]);
                const position = MockData.positions.find(p => p.positionId === positionId);
                if (position) {
                    result = { code: 200, message: '查询成功', data: position, timestamp: Date.now() };
                } else {
                    throw new Error('职位不存在');
                }
            }
            // 创建职位
            else if (url === '/positions' && method === 'POST') {
                const newPosition = {
                    positionId: MockData.nextPositionId++,
                    positionName: body.positionName,
                    thirdOrgId: body.thirdOrgId,
                    description: body.description || '',
                    status: 'ACTIVE'
                };
                MockData.positions.push(newPosition);
                saveMockData();
                result = { code: 200, message: '创建成功', data: newPosition, timestamp: Date.now() };
            }
            // 更新职位
            else if (url.match(/^\/positions\/(\d+)$/) && method === 'PUT') {
                const positionId = parseInt(url.match(/^\/positions\/(\d+)$/)[1]);
                const position = MockData.positions.find(p => p.positionId === positionId);
                if (position) {
                    Object.assign(position, body);
                    saveMockData();
                    result = { code: 200, message: '更新成功', data: position, timestamp: Date.now() };
                } else {
                    throw new Error('职位不存在');
                }
            }
            // 删除职位
            else if (url.match(/^\/positions\/(\d+)$/) && method === 'DELETE') {
                const positionId = parseInt(url.match(/^\/positions\/(\d+)$/)[1]);
                const index = MockData.positions.findIndex(p => p.positionId === positionId);
                if (index !== -1) {
                    MockData.positions.splice(index, 1);
                    saveMockData();
                    result = { code: 200, message: '删除成功', data: null, timestamp: Date.now() };
                } else {
                    throw new Error('职位不存在');
                }
            }
            // 获取薪酬项目列表
            else if (url.startsWith('/salary-items') && method === 'GET') {
                let items = [...MockData.salaryItems];
                if (url.includes('?')) {
                    const params = new URLSearchParams(url.split('?')[1]);
                    if (params.get('itemType')) {
                        items = items.filter(i => i.itemType === params.get('itemType'));
                    }
                    if (params.get('status')) {
                        items = items.filter(i => i.status === params.get('status'));
                    }
                }
                result = { code: 200, message: '查询成功', data: items, timestamp: Date.now() };
            }
            // 获取薪酬项目详情
            else if (url.match(/^\/salary-items\/(\d+)$/) && method === 'GET') {
                const itemId = parseInt(url.match(/^\/salary-items\/(\d+)$/)[1]);
                const item = MockData.salaryItems.find(i => i.itemId === itemId);
                if (item) {
                    result = { code: 200, message: '查询成功', data: item, timestamp: Date.now() };
                } else {
                    throw new Error('薪酬项目不存在');
                }
            }
            // 创建薪酬项目
            else if (url === '/salary-items' && method === 'POST') {
                const newItem = {
                    itemId: MockData.nextSalaryItemId++,
                    itemCode: body.itemCode,
                    itemName: body.itemName,
                    itemType: body.itemType,
                    calculationRule: body.calculationRule || null,
                    sortOrder: body.sortOrder || 0,
                    status: 'ACTIVE'
                };
                MockData.salaryItems.push(newItem);
                saveMockData();
                result = { code: 200, message: '创建成功', data: newItem, timestamp: Date.now() };
            }
            // 更新薪酬项目
            else if (url.match(/^\/salary-items\/(\d+)$/) && method === 'PUT') {
                const itemId = parseInt(url.match(/^\/salary-items\/(\d+)$/)[1]);
                const item = MockData.salaryItems.find(i => i.itemId === itemId);
                if (item) {
                    Object.assign(item, body);
                    saveMockData();
                    result = { code: 200, message: '更新成功', data: item, timestamp: Date.now() };
                } else {
                    throw new Error('薪酬项目不存在');
                }
            }
            // 删除薪酬项目
            else if (url.match(/^\/salary-items\/(\d+)$/) && method === 'DELETE') {
                const itemId = parseInt(url.match(/^\/salary-items\/(\d+)$/)[1]);
                const index = MockData.salaryItems.findIndex(i => i.itemId === itemId);
                if (index !== -1) {
                    MockData.salaryItems.splice(index, 1);
                    saveMockData();
                    result = { code: 200, message: '删除成功', data: null, timestamp: Date.now() };
                } else {
                    throw new Error('薪酬项目不存在');
                }
            }
            // 根据职位和职称获取薪酬标准
            else if (url.startsWith('/salary-standards/by-position') && method === 'GET') {
                const params = new URLSearchParams(url.split('?')[1]);
                const positionId = parseInt(params.get('positionId'));
                const jobTitle = params.get('jobTitle');
                
                // 查找或创建薪酬标准
                let standard = MockData.salaryStandards.find(s => 
                    s.positionId === positionId && s.jobTitle === jobTitle && s.status === 'APPROVED'
                );
                
                if (!standard) {
                    // 创建一个默认的薪酬标准
                    const position = MockData.positions.find(p => p.positionId === positionId);
                    standard = {
                        standardId: MockData.nextStandardId++,
                        standardCode: 'SAL' + new Date().getFullYear() + String(MockData.nextStandardId).padStart(3, '0'),
                        standardName: (position ? position.positionName : '职位') + '-' + 
                            (jobTitle === 'JUNIOR' ? '初级' : jobTitle === 'INTERMEDIATE' ? '中级' : '高级') + '标准',
                        positionId: positionId,
                        jobTitle: jobTitle,
                        status: 'APPROVED'
                    };
                    MockData.salaryStandards.push(standard);
                    saveMockData();
                }
                
                result = { code: 200, message: '查询成功', data: standard, timestamp: Date.now() };
            }
            // 创建员工档案
            else if (url === '/employee-archives' && method === 'POST') {
                const firstOrg = MockData.organizations.find(o => o.orgId === body.firstOrgId);
                const secondOrg = MockData.organizations.find(o => o.orgId === body.secondOrgId);
                const thirdOrg = MockData.organizations.find(o => o.orgId === body.thirdOrgId);
                const position = MockData.positions.find(p => p.positionId === body.positionId);
                
                // 生成档案编号
                const year = new Date().getFullYear();
                const archiveNumber = year + 
                    (firstOrg ? firstOrg.orgCode.padStart(2, '0') : '01') +
                    (secondOrg ? secondOrg.orgCode.padStart(2, '0') : '01') +
                    (thirdOrg ? thirdOrg.orgCode.padStart(2, '0') : '01') +
                    String(MockData.nextArchiveId).padStart(2, '0');
                
                const archive = {
                    archiveId: MockData.nextArchiveId++,
                    archiveNumber: archiveNumber,
                    ...body,
                    registrarId: 2, // 默认登记人
                    registrarName: '王管理员',
                    registrationTime: new Date().toISOString(),
                    status: 'PENDING_REVIEW',
                    firstOrgName: firstOrg ? firstOrg.orgName : '',
                    secondOrgName: secondOrg ? secondOrg.orgName : '',
                    thirdOrgName: thirdOrg ? thirdOrg.orgName : '',
                    orgFullPath: [firstOrg, secondOrg, thirdOrg].filter(o => o).map(o => o.orgName).join('/'),
                    positionName: position ? position.positionName : ''
                };
                
                MockData.employeeArchives.push(archive);
                saveMockData();
                
                result = {
                    code: 200,
                    message: '登记成功',
                    data: {
                        archiveId: archive.archiveId,
                        archiveNumber: archive.archiveNumber,
                        name: archive.name,
                        status: archive.status,
                        registrationTime: archive.registrationTime
                    },
                    timestamp: Date.now()
                };
            }
            // 获取档案详情
            else if (url.match(/^\/employee-archives\/(\d+)$/) && method === 'GET') {
                const archiveId = parseInt(url.match(/^\/employee-archives\/(\d+)$/)[1]);
                const archive = MockData.employeeArchives.find(a => a.archiveId === archiveId);
                if (archive) {
                    result = { code: 200, message: '查询成功', data: archive, timestamp: Date.now() };
                } else {
                    throw new Error('档案不存在');
                }
            }
            // 更新员工档案（人事专员变更档案）
            else if (url.match(/^\/employee-archives\/(\d+)$/) && method === 'PUT') {
                const archiveId = parseInt(url.match(/^\/employee-archives\/(\d+)$/)[1]);
                const archive = MockData.employeeArchives.find(a => a.archiveId === archiveId);
                if (!archive) {
                    throw new Error('档案不存在');
                }
                
                // 只有状态为PENDING_REVIEW的档案才能进行变更
                if (archive.status !== 'PENDING_REVIEW') {
                    throw new Error('只有待复核状态的档案才能进行变更');
                }
                
                // 更新档案信息（档案编号、所属机构、职位不能修改）
                const allowedFields = [
                    'name', 'gender', 'idNumber', 'birthday', 'age', 'nationality', 
                    'placeOfBirth', 'ethnicity', 'religiousBelief', 'politicalStatus',
                    'educationLevel', 'major', 'email', 'phone', 'qq', 'mobile',
                    'address', 'postalCode', 'hobby', 'personalResume', 
                    'familyRelationship', 'remarks', 'jobTitle', 'salaryStandardId'
                ];
                
                allowedFields.forEach(field => {
                    if (body[field] !== undefined) {
                        archive[field] = body[field];
                    }
                });
                
                // 变更后状态仍为待复核（等待复核）
                archive.status = 'PENDING_REVIEW';
                archive.updateTime = new Date().toISOString();
                
                // 清除之前的复核信息（因为需要重新复核）
                archive.reviewerId = null;
                archive.reviewerName = null;
                archive.reviewTime = null;
                archive.reviewComments = null;
                
                saveMockData();
                
                result = {
                    code: 200,
                    message: '更新成功，等待复核',
                    data: {
                        archiveId: archive.archiveId,
                        archiveNumber: archive.archiveNumber,
                        status: archive.status,
                        updateTime: archive.updateTime
                    },
                    timestamp: Date.now()
                };
            }
            // 删除员工档案（软删除，标记为已删除状态）
            // 注意：这是软删除，不会真正从数组中删除记录，只是修改状态
            else if (url.match(/^\/employee-archives\/(\d+)$/) && method === 'DELETE') {
                const archiveId = parseInt(url.match(/^\/employee-archives\/(\d+)$/)[1]);
                const archive = MockData.employeeArchives.find(a => a.archiveId === archiveId);
                if (!archive) {
                    throw new Error('档案不存在');
                }
                
                // 状态为"待复核"的档案不能删除
                if (archive.status === 'PENDING_REVIEW') {
                    throw new Error('状态为"待复核"的员工档案不能删除');
                }
                
                // 如果已经是已删除状态，直接返回
                if (archive.status === 'DELETED') {
                    throw new Error('档案已经是已删除状态');
                }
                
                // 软删除：只标记状态为DELETED，记录删除时间和原因
                // 重要：不会从MockData.employeeArchives数组中删除记录，记录仍然保留
                archive.status = 'DELETED';
                archive.deleteTime = new Date().toISOString();
                archive.deleteReason = body.deleteReason || '';
                archive.updateTime = new Date().toISOString();
                
                saveMockData();
                
                result = {
                    code: 200,
                    message: '删除成功',
                    data: {
                        archiveId: archive.archiveId,
                        status: archive.status,
                        deleteTime: archive.deleteTime,
                        deleteReason: archive.deleteReason
                    },
                    timestamp: Date.now()
                };
            }
            // 获取待复核档案列表
            else if (url.startsWith('/employee-archives/pending-review') && method === 'GET') {
                const params = new URLSearchParams(url.split('?')[1]);
                const page = parseInt(params.get('page') || '1');
                const size = parseInt(params.get('size') || '10');
                
                // 返回待复核和已通过状态的档案（复核通过后记录保留，状态变为NORMAL）
                let reviewArchives = MockData.employeeArchives.filter(a => 
                    a.status === 'PENDING_REVIEW' || a.status === 'NORMAL'
                );
                
                // 应用搜索条件
                if (params.get('archiveNumber')) {
                    const archiveNumber = params.get('archiveNumber').toLowerCase();
                    reviewArchives = reviewArchives.filter(a => 
                        a.archiveNumber && a.archiveNumber.toLowerCase().includes(archiveNumber)
                    );
                }
                
                if (params.get('name')) {
                    const name = params.get('name').toLowerCase();
                    reviewArchives = reviewArchives.filter(a => 
                        a.name && a.name.toLowerCase().includes(name)
                    );
                }
                
                if (params.get('keyword')) {
                    const keyword = params.get('keyword').toLowerCase();
                    reviewArchives = reviewArchives.filter(a => 
                        (a.name && a.name.toLowerCase().includes(keyword)) ||
                        (a.orgFullPath && a.orgFullPath.toLowerCase().includes(keyword)) ||
                        (a.positionName && a.positionName.toLowerCase().includes(keyword))
                    );
                }
                
                if (params.get('status')) {
                    const status = params.get('status');
                    reviewArchives = reviewArchives.filter(a => a.status === status);
                }
                
                // 日期过滤（使用提交时间，即updateTime或registrationTime）
                if (params.get('startDate')) {
                    const startDate = new Date(params.get('startDate'));
                    reviewArchives = reviewArchives.filter(a => {
                        const submitTime = a.updateTime || a.registrationTime;
                        if (!submitTime) return false;
                        const submitDate = submitTime.split('T')[0];
                        return submitDate >= params.get('startDate');
                    });
                }
                
                if (params.get('endDate')) {
                    const endDate = params.get('endDate');
                    reviewArchives = reviewArchives.filter(a => {
                        const submitTime = a.updateTime || a.registrationTime;
                        if (!submitTime) return false;
                        const submitDate = submitTime.split('T')[0];
                        return submitDate <= endDate;
                    });
                }
                
                // 排序：待复核的在前，已通过的在后；同状态内按更新时间或登记时间倒序排列（最新的在前）
                reviewArchives.sort((a, b) => {
                    // 先按状态排序：PENDING_REVIEW在前，NORMAL在后
                    if (a.status === 'PENDING_REVIEW' && b.status === 'NORMAL') return -1;
                    if (a.status === 'NORMAL' && b.status === 'PENDING_REVIEW') return 1;
                    // 同状态内按时间倒序
                    const timeA = new Date(a.updateTime || a.registrationTime || 0).getTime();
                    const timeB = new Date(b.updateTime || b.registrationTime || 0).getTime();
                    return timeB - timeA;
                });
                
                const total = reviewArchives.length;
                const start = (page - 1) * size;
                const end = start + size;
                const list = reviewArchives.slice(start, end);
                
                result = {
                    code: 200,
                    message: '查询成功',
                    data: {
                        total: total,
                        list: list
                    },
                    timestamp: Date.now()
                };
            }
            // 复核时修改并通过
            else if (url.match(/^\/employee-archives\/(\d+)\/review$/) && method === 'PUT') {
                const archiveId = parseInt(url.match(/^\/employee-archives\/(\d+)\/review$/)[1]);
                const archive = MockData.employeeArchives.find(a => a.archiveId === archiveId);
                if (!archive) {
                    throw new Error('档案不存在');
                }
                
                // 只有状态为PENDING_REVIEW的档案才能进行复核
                if (archive.status !== 'PENDING_REVIEW') {
                    throw new Error('只有待复核状态的档案才能进行复核');
                }
                
                // 更新档案信息（档案编号、所属机构、职位不能修改）
                const allowedFields = [
                    'name', 'gender', 'idNumber', 'birthday', 'age', 'nationality', 
                    'placeOfBirth', 'ethnicity', 'religiousBelief', 'politicalStatus',
                    'educationLevel', 'major', 'email', 'phone', 'qq', 'mobile',
                    'address', 'postalCode', 'hobby', 'personalResume', 
                    'familyRelationship', 'remarks', 'jobTitle', 'salaryStandardId'
                ];
                
                allowedFields.forEach(field => {
                    if (body[field] !== undefined) {
                        archive[field] = body[field];
                    }
                });
                
                // 复核通过，状态变为NORMAL
                archive.status = 'NORMAL';
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                archive.reviewerId = currentUser.userId || 3;
                archive.reviewerName = currentUser.realName || '李管理员';
                archive.reviewTime = new Date().toISOString();
                archive.updateTime = new Date().toISOString();
                
                saveMockData();
                
                result = {
                    code: 200,
                    message: '复核通过，档案已生效',
                    data: {
                        archiveId: archive.archiveId,
                        status: archive.status,
                        reviewTime: archive.reviewTime
                    },
                    timestamp: Date.now()
                };
            }
            // 复核通过（不修改）
            else if (url.match(/^\/employee-archives\/(\d+)\/review\/approve$/) && method === 'POST') {
                const archiveId = parseInt(url.match(/^\/employee-archives\/(\d+)\/review\/approve$/)[1]);
                const archive = MockData.employeeArchives.find(a => a.archiveId === archiveId);
                if (archive) {
                    archive.status = 'NORMAL';
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    archive.reviewerId = currentUser.userId || 3;
                    archive.reviewerName = currentUser.realName || '李管理员';
                    archive.reviewTime = new Date().toISOString();
                    archive.reviewComments = body.reviewComments || '';
                    archive.updateTime = new Date().toISOString();
                    saveMockData();
                    result = {
                        code: 200,
                        message: '复核通过',
                        data: {
                            archiveId: archive.archiveId,
                            status: archive.status,
                            reviewTime: archive.reviewTime
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('档案不存在');
                }
            }
            // 查询员工档案
            else if (url.startsWith('/employee-archives') && method === 'GET' && !url.includes('/pending-review') && !url.includes('/deleted')) {
                const queryString = url.split('?')[1] || '';
                const params = new URLSearchParams(queryString);
                const page = parseInt(params.get('page') || '1');
                const size = parseInt(params.get('size') || '10');
                const statusParam = params.get('status');
                
                // 如果没有指定status参数，返回NORMAL和PENDING_REVIEW两种状态的记录
                // 如果指定了status参数，只返回该状态的记录
                let archives;
                if (statusParam) {
                    archives = MockData.employeeArchives.filter(a => a.status === statusParam);
                } else {
                    // 默认返回正常和待复核状态的记录（不包括已删除的）
                    archives = MockData.employeeArchives.filter(a => 
                        a.status === 'NORMAL' || a.status === 'PENDING_REVIEW'
                    );
                }
                
                // 调试信息
                console.log('Mock API - 查询参数:', {
                    page,
                    size,
                    statusParam,
                    firstOrgId: params.get('firstOrgId'),
                    secondOrgId: params.get('secondOrgId'),
                    thirdOrgId: params.get('thirdOrgId'),
                    positionId: params.get('positionId'),
                    startDate: params.get('startDate'),
                    endDate: params.get('endDate')
                });
                console.log('Mock API - 过滤前档案数量:', archives.length);
                
                // 应用筛选条件（所有条件都是AND关系，必须同时满足）
                const firstOrgId = params.get('firstOrgId');
                if (firstOrgId && firstOrgId.trim() !== '') {
                    const orgId = parseInt(firstOrgId);
                    if (!isNaN(orgId) && orgId > 0) {
                        const beforeCount = archives.length;
                        archives = archives.filter(a => a.firstOrgId === orgId);
                        console.log(`Mock API - 一级机构过滤 (ID: ${orgId}): ${beforeCount} -> ${archives.length}`);
                    }
                }
                
                const secondOrgId = params.get('secondOrgId');
                if (secondOrgId && secondOrgId.trim() !== '') {
                    const orgId = parseInt(secondOrgId);
                    if (!isNaN(orgId) && orgId > 0) {
                        const beforeCount = archives.length;
                        archives = archives.filter(a => a.secondOrgId === orgId);
                        console.log(`Mock API - 二级机构过滤 (ID: ${orgId}): ${beforeCount} -> ${archives.length}`);
                    }
                }
                
                const thirdOrgId = params.get('thirdOrgId');
                if (thirdOrgId && thirdOrgId.trim() !== '') {
                    const orgId = parseInt(thirdOrgId);
                    if (!isNaN(orgId) && orgId > 0) {
                        const beforeCount = archives.length;
                        archives = archives.filter(a => a.thirdOrgId === orgId);
                        console.log(`Mock API - 三级机构过滤 (ID: ${orgId}): ${beforeCount} -> ${archives.length}`);
                    }
                }
                
                const positionId = params.get('positionId');
                if (positionId && positionId.trim() !== '') {
                    const posId = parseInt(positionId);
                    if (!isNaN(posId) && posId > 0) {
                        const beforeCount = archives.length;
                        archives = archives.filter(a => a.positionId === posId);
                        console.log(`Mock API - 职位过滤 (ID: ${posId}): ${beforeCount} -> ${archives.length}`);
                    }
                }
                
                // 日期过滤
                const startDate = params.get('startDate');
                const endDate = params.get('endDate');
                if (startDate || endDate) {
                    const beforeCount = archives.length;
                    archives = archives.filter(a => {
                        if (!a.registrationTime) return false;
                        // 提取日期部分（YYYY-MM-DD）
                        const archiveDate = a.registrationTime.split('T')[0];
                        
                        // 如果指定了起始日期，档案日期必须 >= 起始日期
                        if (startDate && startDate.trim() !== '') {
                            if (archiveDate < startDate.trim()) {
                                return false;
                            }
                        }
                        // 如果指定了结束日期，档案日期必须 <= 结束日期
                        if (endDate && endDate.trim() !== '') {
                            if (archiveDate > endDate.trim()) {
                                return false;
                            }
                        }
                        return true;
                    });
                    console.log(`Mock API - 日期过滤: ${beforeCount} -> ${archives.length}`);
                }
                
                console.log('Mock API - 过滤后档案数量:', archives.length);
                
                // 分页处理
                const start = (page - 1) * size;
                const end = start + size;
                const list = archives.slice(start, end);
                
                result = {
                    code: 200,
                    message: '查询成功',
                    data: {
                        total: archives.length,
                        list: list
                    },
                    timestamp: Date.now()
                };
            }
            // 获取删除管理列表（只显示状态为正常和已删除的员工）
            else if (url.startsWith('/employee-archives/deleted') && method === 'GET') {
                const params = new URLSearchParams(url.split('?')[1]);
                const page = parseInt(params.get('page') || '1');
                const size = parseInt(params.get('size') || '10');
                const keyword = params.get('keyword') || '';
                
                // 只返回状态为NORMAL和DELETED的员工记录（不包括PENDING_REVIEW）
                let archives = MockData.employeeArchives.filter(a => 
                    a.status === 'NORMAL' || a.status === 'DELETED'
                );
                
                // 如果有关键字，进行搜索过滤（在姓名和档案编号中搜索）
                if (keyword && keyword.trim()) {
                    const keywordLower = keyword.trim().toLowerCase();
                    archives = archives.filter(a => {
                        const nameMatch = a.name && a.name.toLowerCase().includes(keywordLower);
                        const archiveNumberMatch = a.archiveNumber && a.archiveNumber.toLowerCase().includes(keywordLower);
                        return nameMatch || archiveNumberMatch;
                    });
                }
                
                // 按更新时间或登记时间倒序排列（最新的在前）
                archives.sort((a, b) => {
                    const timeA = new Date(a.updateTime || a.registrationTime || 0).getTime();
                    const timeB = new Date(b.updateTime || b.registrationTime || 0).getTime();
                    return timeB - timeA;
                });
                
                const start = (page - 1) * size;
                const end = start + size;
                const list = archives.slice(start, end);
                
                result = {
                    code: 200,
                    message: '查询成功',
                    data: {
                        total: archives.length,
                        list: list
                    },
                    timestamp: Date.now()
                };
            }
            // 恢复员工档案
            // 注意：恢复操作只是修改状态，不会删除或新增记录，记录始终保留在数组中
            else if (url.match(/^\/employee-archives\/(\d+)\/restore$/) && method === 'POST') {
                const archiveId = parseInt(url.match(/^\/employee-archives\/(\d+)\/restore$/)[1]);
                const archive = MockData.employeeArchives.find(a => a.archiveId === archiveId);
                if (archive) {
                    // 恢复：只修改状态为NORMAL，清除删除相关信息
                    // 重要：不会从MockData.employeeArchives数组中删除记录，记录仍然保留
                    archive.status = 'NORMAL';
                    archive.deleteTime = null;
                    archive.deleteReason = null;
                    archive.updateTime = new Date().toISOString(); // 更新修改时间
                    saveMockData();
                    result = {
                        code: 200,
                        message: '恢复成功',
                        data: {
                            archiveId: archive.archiveId,
                            status: archive.status
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('档案不存在');
                }
            }
            // 上传员工照片
            else if (url.match(/^\/employee-archives\/(\d+)\/photo$/) && method === 'POST') {
                const archiveId = parseInt(url.match(/^\/employee-archives\/(\d+)\/photo$/)[1]);
                const archive = MockData.employeeArchives.find(a => a.archiveId === archiveId);
                
                if (!archive) {
                    throw new Error('档案不存在');
                }
                
                // 从options中获取文件（在Mock环境中，我们模拟上传）
                const file = options.file;
                
                if (!file) {
                    throw new Error('请选择照片文件');
                }
                
                // 验证文件类型
                if (!file.type || !file.type.startsWith('image/')) {
                    throw new Error('请选择图片文件');
                }
                
                // 生成模拟的照片URL（在实际环境中，这应该是服务器返回的真实URL）
                // 使用base64编码作为临时方案，或者生成一个模拟URL
                const photoUrl = file instanceof File ? 
                    URL.createObjectURL(file) : // 使用blob URL作为临时显示
                    `https://example.com/photos/${archive.archiveNumber || archiveId}_${Date.now()}.jpg`;
                
                // 更新档案中的照片URL
                archive.photoUrl = photoUrl;
                saveMockData();
                
                result = {
                    code: 200,
                    message: '上传成功',
                    data: {
                        photoUrl: photoUrl
                    },
                    timestamp: Date.now()
                };
            }
            // ========== 薪酬标准管理接口 ==========
            // 创建薪酬标准
            else if (url === '/salary-standards' && method === 'POST') {
                const year = new Date().getFullYear();
                const standardCode = 'SAL' + year + String(MockData.nextStandardId).padStart(3, '0');
                
                const newStandard = {
                    standardId: MockData.nextStandardId++,
                    standardCode: standardCode,
                    standardName: body.standardName,
                    positionId: body.positionId,
                    jobTitle: body.jobTitle,
                    formulatorId: body.formulatorId,
                    registrarId: body.formulatorId, // 假设登记人就是制定人
                    registrationTime: new Date().toISOString(),
                    status: 'PENDING_REVIEW',
                    items: body.items || []
                };
                
                MockData.salaryStandards.push(newStandard);
                saveMockData();
                
                result = {
                    code: 200,
                    message: '登记成功',
                    data: {
                        standardId: newStandard.standardId,
                        standardCode: newStandard.standardCode,
                        standardName: newStandard.standardName,
                        positionId: newStandard.positionId,
                        jobTitle: newStandard.jobTitle,
                        status: newStandard.status
                    },
                    timestamp: Date.now()
                };
            }
            // 获取待复核薪酬标准列表
            else if (url.startsWith('/salary-standards/pending-review') && method === 'GET') {
                const params = new URLSearchParams(url.split('?')[1]);
                const page = parseInt(params.get('page')) || 1;
                const size = parseInt(params.get('size')) || 10;
                
                let standards = MockData.salaryStandards.filter(s => s.status === 'PENDING_REVIEW');
                
                // 添加关联信息
                standards = standards.map(s => {
                    const position = MockData.positions.find(p => p.positionId === s.positionId);
                    const formulator = MockData.users.find(u => u.userId === s.formulatorId);
                    return {
                        ...s,
                        positionName: position ? position.positionName : '-',
                        formulatorName: formulator ? formulator.realName : '-'
                    };
                });
                
                const total = standards.length;
                const start = (page - 1) * size;
                const list = standards.slice(start, start + size);
                
                result = {
                    code: 200,
                    message: '查询成功',
                    data: { total, list },
                    timestamp: Date.now()
                };
            }
            // 获取薪酬标准详情
            else if (url.match(/^\/salary-standards\/(\d+)$/) && method === 'GET') {
                const standardId = parseInt(url.match(/^\/salary-standards\/(\d+)$/)[1]);
                const standard = MockData.salaryStandards.find(s => s.standardId === standardId);
                
                if (standard) {
                    const position = MockData.positions.find(p => p.positionId === standard.positionId);
                    const formulator = MockData.users.find(u => u.userId === standard.formulatorId);
                    const registrar = MockData.users.find(u => u.userId === standard.registrarId);
                    const reviewer = standard.reviewerId ? MockData.users.find(u => u.userId === standard.reviewerId) : null;
                    
                    // 构建items详情
                    const items = (standard.items || []).map(item => {
                        const salaryItem = MockData.salaryItems.find(si => si.itemId === item.itemId);
                        return {
                            itemId: item.itemId,
                            itemCode: salaryItem ? salaryItem.itemCode : '',
                            itemName: salaryItem ? salaryItem.itemName : '',
                            itemType: salaryItem ? salaryItem.itemType : '',
                            amount: item.amount || 0,
                            isCalculated: item.isCalculated || false,
                            calculationRule: salaryItem ? salaryItem.calculationRule : null
                        };
                    });
                    
                    result = {
                        code: 200,
                        message: '查询成功',
                        data: {
                            ...standard,
                            positionName: position ? position.positionName : '-',
                            formulatorName: formulator ? formulator.realName : '-',
                            registrarName: registrar ? registrar.realName : '-',
                            reviewerName: reviewer ? reviewer.realName : null,
                            items: items
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('薪酬标准不存在');
                }
            }
            // 复核通过
            else if (url.match(/^\/salary-standards\/(\d+)\/review\/approve$/) && method === 'POST') {
                const standardId = parseInt(url.match(/^\/salary-standards\/(\d+)\/review\/approve$/)[1]);
                const standard = MockData.salaryStandards.find(s => s.standardId === standardId);
                
                if (standard) {
                    // 获取当前登录用户
                    const currentUserStr = localStorage.getItem('currentUser');
                    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
                    const reviewerId = currentUser ? currentUser.userId : null;
                    const reviewer = reviewerId ? MockData.users.find(u => u.userId === reviewerId) : null;
                    
                    standard.status = 'APPROVED';
                    standard.reviewerId = reviewerId;
                    standard.reviewerName = reviewer ? reviewer.realName : null;
                    standard.reviewTime = new Date().toISOString();
                    standard.reviewComments = body.reviewComments || '';
                    // 复核通过后，记录不会被删除，只是状态改变
                    saveMockData();
                    
                    result = {
                        code: 200,
                        message: '复核通过',
                        data: {
                            standardId: standard.standardId,
                            status: standard.status,
                            reviewTime: standard.reviewTime
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('薪酬标准不存在');
                }
            }
            // 复核驳回
            else if (url.match(/^\/salary-standards\/(\d+)\/review\/reject$/) && method === 'POST') {
                const standardId = parseInt(url.match(/^\/salary-standards\/(\d+)\/review\/reject$/)[1]);
                const standard = MockData.salaryStandards.find(s => s.standardId === standardId);
                
                if (standard) {
                    // 复核不通过，状态回到待复核
                    standard.status = 'PENDING_REVIEW';
                    standard.reviewerId = null;
                    standard.reviewTime = null;
                    standard.reviewComments = body.reviewComments || '';
                    saveMockData();
                    
                    result = {
                        code: 200,
                        message: '复核不通过，已退回待复核',
                        data: {
                            standardId: standard.standardId,
                            status: standard.status,
                            reviewTime: standard.reviewTime
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('薪酬标准不存在');
                }
            }
            // 查询薪酬标准
            else if (url.startsWith('/salary-standards') && method === 'GET' && !url.includes('/pending-review') && !url.includes('/by-position')) {
                const params = new URLSearchParams(url.split('?')[1]);
                const page = parseInt(params.get('page')) || 1;
                const size = parseInt(params.get('size')) || 10;
                
                let standards = [...MockData.salaryStandards];
                
                // 先添加关联信息，以便后续查询可以使用
                standards = standards.map(s => {
                    const position = MockData.positions.find(p => p.positionId === s.positionId);
                    const formulator = MockData.users.find(u => u.userId === s.formulatorId);
                    const registrar = MockData.users.find(u => u.userId === s.registrarId);
                    const reviewer = s.reviewerId ? MockData.users.find(u => u.userId === s.reviewerId) : null;
                    return {
                        ...s,
                        positionName: position ? position.positionName : (s.positionName || '-'),
                        formulatorName: formulator ? formulator.realName : (s.formulatorName || '-'),
                        registrarName: registrar ? registrar.realName : (s.registrarName || '-'),
                        reviewerName: reviewer ? reviewer.realName : (s.reviewerName || null)
                    };
                });
                
                // 应用筛选条件
                if (params.get('standardCode')) {
                    const code = params.get('standardCode');
                    standards = standards.filter(s => s.standardCode.includes(code));
                }
                if (params.get('keyword')) {
                    const keyword = params.get('keyword').toLowerCase();
                    standards = standards.filter(s => 
                        s.standardName.toLowerCase().includes(keyword) ||
                        (s.formulatorName && s.formulatorName.toLowerCase().includes(keyword)) ||
                        (s.registrarName && s.registrarName.toLowerCase().includes(keyword)) ||
                        (s.reviewerName && s.reviewerName.toLowerCase().includes(keyword))
                    );
                }
                if (params.get('startDate')) {
                    const startDate = new Date(params.get('startDate'));
                    standards = standards.filter(s => {
                        if (!s.registrationTime) return false;
                        return new Date(s.registrationTime) >= startDate;
                    });
                }
                if (params.get('endDate')) {
                    const endDate = new Date(params.get('endDate'));
                    endDate.setHours(23, 59, 59, 999); // 设置为当天的最后一刻
                    standards = standards.filter(s => {
                        if (!s.registrationTime) return false;
                        return new Date(s.registrationTime) <= endDate;
                    });
                }
                if (params.get('status')) {
                    standards = standards.filter(s => s.status === params.get('status'));
                }
                if (params.get('positionId')) {
                    standards = standards.filter(s => s.positionId === parseInt(params.get('positionId')));
                }
                if (params.get('jobTitle')) {
                    standards = standards.filter(s => s.jobTitle === params.get('jobTitle'));
                }
                
                const total = standards.length;
                const start = (page - 1) * size;
                const list = standards.slice(start, start + size);
                
                result = {
                    code: 200,
                    message: '查询成功',
                    data: { total, list },
                    timestamp: Date.now()
                };
            }
            // 更新薪酬标准
            else if (url.match(/^\/salary-standards\/(\d+)$/) && method === 'PUT') {
                const standardId = parseInt(url.match(/^\/salary-standards\/(\d+)$/)[1]);
                const standard = MockData.salaryStandards.find(s => s.standardId === standardId);
                
                if (standard) {
                    standard.standardName = body.standardName;
                    standard.items = body.items || [];
                    standard.status = 'PENDING_REVIEW'; // 变更后需要重新复核
                    saveMockData();
                    
                    result = {
                        code: 200,
                        message: '更新成功，等待复核',
                        data: {
                            standardId: standard.standardId,
                            status: standard.status
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('薪酬标准不存在');
                }
            }
            // ========== 薪酬发放管理接口 ==========
            // 获取待登记薪酬发放单列表
            else if (url.startsWith('/salary-issuances/pending-registration') && method === 'GET') {
                const params = new URLSearchParams(url.split('?')[1]);
                const issuanceMonth = params.get('issuanceMonth') || getCurrentMonth();
                const thirdOrgId = params.get('thirdOrgId') ? parseInt(params.get('thirdOrgId')) : null;
                
                // 获取所有三级机构下的正常员工
                const orgs = [];
                for (const org1 of MockData.organizations.filter(o => o.orgLevel === 1)) {
                    for (const org2 of MockData.organizations.filter(o => o.parentId === org1.orgId)) {
                        for (const org3 of MockData.organizations.filter(o => o.parentId === org2.orgId)) {
                            if (thirdOrgId && org3.orgId !== thirdOrgId) continue;
                            
                            const employees = MockData.employeeArchives.filter(a => 
                                a.thirdOrgId === org3.orgId && a.status === 'NORMAL'
                            );
                            
                            if (employees.length > 0) {
                                const totalBasicSalary = employees.reduce((sum, e) => sum + 10000, 0); // 简化计算
                                orgs.push({
                                    thirdOrgId: org3.orgId,
                                    thirdOrgName: org3.orgName,
                                    orgFullPath: `${org1.orgName}/${org2.orgName}/${org3.orgName}`,
                                    totalEmployees: employees.length,
                                    totalBasicSalary: totalBasicSalary,
                                    salarySlipNumber: null,
                                    status: 'PENDING_REGISTRATION'
                                });
                            }
                        }
                    }
                }
                
                result = {
                    code: 200,
                    message: '查询成功',
                    data: orgs,
                    timestamp: Date.now()
                };
            }
            // 登记薪酬发放单
            else if (url === '/salary-issuances' && method === 'POST') {
                const year = new Date().getFullYear();
                const month = String(new Date().getMonth() + 1).padStart(2, '0');
                const salarySlipNumber = 'PAY' + year + month + String(MockData.nextIssuanceId).padStart(3, '0');
                
                const employees = MockData.employeeArchives.filter(a => 
                    a.thirdOrgId === body.thirdOrgId && a.status === 'NORMAL'
                );
                
                const newIssuance = {
                    issuanceId: MockData.nextIssuanceId++,
                    salarySlipNumber: salarySlipNumber,
                    thirdOrgId: body.thirdOrgId,
                    totalEmployees: employees.length,
                    totalBasicSalary: employees.length * 10000, // 简化计算
                    totalNetPay: employees.length * 10000,
                    issuanceMonth: body.issuanceMonth + '-01',
                    registrarId: 4, // 假设当前用户
                    registrationTime: new Date().toISOString(),
                    status: 'PENDING_REVIEW'
                };
                
                MockData.salaryIssuances.push(newIssuance);
                
                // 创建明细
                body.details.forEach(detail => {
                    const employee = employees.find(e => e.archiveId === detail.employeeId);
                    if (employee) {
                        MockData.salaryIssuanceDetails.push({
                            detailId: MockData.nextIssuanceDetailId++,
                            issuanceId: newIssuance.issuanceId,
                            employeeId: detail.employeeId,
                            employeeNumber: employee.archiveNumber,
                            employeeName: employee.name,
                            positionName: employee.positionName,
                            basicSalary: 10000,
                            performanceBonus: 2000,
                            transportationAllowance: 500,
                            mealAllowance: 300,
                            pensionInsurance: 800,
                            medicalInsurance: 203,
                            unemploymentInsurance: 50,
                            housingFund: 800,
                            awardAmount: detail.awardAmount || 0,
                            deductionAmount: detail.deductionAmount || 0,
                            totalIncome: 12800,
                            totalDeduction: 1853,
                            netPay: 10947 + (detail.awardAmount || 0) - (detail.deductionAmount || 0)
                        });
                    }
                });
                
                saveMockData();
                
                result = {
                    code: 200,
                    message: '登记成功',
                    data: newIssuance,
                    timestamp: Date.now()
                };
            }
            // 获取薪酬发放单详情
            else if (url.match(/^\/salary-issuances\/(\d+)$/) && method === 'GET') {
                const issuanceId = parseInt(url.match(/^\/salary-issuances\/(\d+)$/)[1]);
                const issuance = MockData.salaryIssuances.find(i => i.issuanceId === issuanceId);
                
                if (issuance) {
                    const org3 = MockData.organizations.find(o => o.orgId === issuance.thirdOrgId);
                    const org2 = org3 ? MockData.organizations.find(o => o.orgId === org3.parentId) : null;
                    const org1 = org2 ? MockData.organizations.find(o => o.orgId === org2.parentId) : null;
                    const registrar = MockData.users.find(u => u.userId === issuance.registrarId);
                    
                    const details = MockData.salaryIssuanceDetails.filter(d => d.issuanceId === issuanceId);
                    
                    result = {
                        code: 200,
                        message: '查询成功',
                        data: {
                            ...issuance,
                            thirdOrgName: org3 ? org3.orgName : '-',
                            orgFullPath: org1 && org2 && org3 ? `${org1.orgName}/${org2.orgName}/${org3.orgName}` : '-',
                            registrarName: registrar ? registrar.realName : '-',
                            details: details
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('薪酬发放单不存在');
                }
            }
            // 获取待复核薪酬发放单列表
            else if (url.startsWith('/salary-issuances/pending-review') && method === 'GET') {
                const params = new URLSearchParams(url.split('?')[1]);
                const page = parseInt(params.get('page')) || 1;
                const size = parseInt(params.get('size')) || 10;
                
                let issuances = MockData.salaryIssuances.filter(i => i.status === 'PENDING_REVIEW');
                
                // 添加关联信息
                issuances = issuances.map(issuance => {
                    const org3 = MockData.organizations.find(o => o.orgId === issuance.thirdOrgId);
                    const org2 = org3 ? MockData.organizations.find(o => o.orgId === org3.parentId) : null;
                    const org1 = org2 ? MockData.organizations.find(o => o.orgId === org2.parentId) : null;
                    return {
                        ...issuance,
                        orgFullPath: org1 && org2 && org3 ? `${org1.orgName}/${org2.orgName}/${org3.orgName}` : '-'
                    };
                });
                
                const total = issuances.length;
                const start = (page - 1) * size;
                const list = issuances.slice(start, start + size);
                
                result = {
                    code: 200,
                    message: '查询成功',
                    data: { total, list },
                    timestamp: Date.now()
                };
            }
            // 复核通过
            else if (url.match(/^\/salary-issuances\/(\d+)\/review\/approve$/) && method === 'POST') {
                const issuanceId = parseInt(url.match(/^\/salary-issuances\/(\d+)\/review\/approve$/)[1]);
                const issuance = MockData.salaryIssuances.find(i => i.issuanceId === issuanceId);
                
                if (issuance) {
                    issuance.status = 'EXECUTED';
                    issuance.reviewerId = 5; // 假设当前用户ID为5
                    issuance.reviewTime = new Date().toISOString();
                    
                    // 更新明细中的奖励和应扣金额
                    if (body.details) {
                        body.details.forEach(d => {
                            const detail = MockData.salaryIssuanceDetails.find(det => det.detailId === d.detailId);
                            if (detail) {
                                detail.awardAmount = d.awardAmount || 0;
                                detail.deductionAmount = d.deductionAmount || 0;
                                detail.netPay = detail.totalIncome + detail.awardAmount - detail.totalDeduction - detail.deductionAmount;
                            }
                        });
                    }
                    
                    saveMockData();
                    
                    result = {
                        code: 200,
                        message: '复核通过',
                        data: {
                            issuanceId: issuance.issuanceId,
                            status: issuance.status,
                            reviewTime: issuance.reviewTime
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('薪酬发放单不存在');
                }
            }
            // 复核驳回
            else if (url.match(/^\/salary-issuances\/(\d+)\/review\/reject$/) && method === 'POST') {
                const issuanceId = parseInt(url.match(/^\/salary-issuances\/(\d+)\/review\/reject$/)[1]);
                const issuance = MockData.salaryIssuances.find(i => i.issuanceId === issuanceId);
                
                if (issuance) {
                    issuance.status = 'REJECTED';
                    issuance.reviewerId = 5;
                    issuance.reviewTime = new Date().toISOString();
                    issuance.rejectReason = body.rejectReason || '';
                    saveMockData();
                    
                    result = {
                        code: 200,
                        message: '已驳回',
                        data: {
                            issuanceId: issuance.issuanceId,
                            status: issuance.status
                        },
                        timestamp: Date.now()
                    };
                } else {
                    throw new Error('薪酬发放单不存在');
                }
            }
            // 查询薪酬发放单
            else if (url.startsWith('/salary-issuances') && method === 'GET' && 
                     !url.includes('/pending-registration') && !url.includes('/pending-review')) {
                const params = new URLSearchParams(url.split('?')[1]);
                const page = parseInt(params.get('page')) || 1;
                const size = parseInt(params.get('size')) || 10;
                
                let issuances = [...MockData.salaryIssuances];
                
                // 应用筛选条件
                if (params.get('salarySlipNumber')) {
                    const number = params.get('salarySlipNumber');
                    issuances = issuances.filter(i => i.salarySlipNumber.includes(number));
                }
                if (params.get('keyword')) {
                    const keyword = params.get('keyword').toLowerCase();
                    issuances = issuances.filter(i => 
                        i.salarySlipNumber.toLowerCase().includes(keyword) ||
                        (i.orgFullPath && i.orgFullPath.toLowerCase().includes(keyword)) ||
                        (i.registrarName && i.registrarName.toLowerCase().includes(keyword))
                    );
                }
                if (params.get('startDate')) {
                    const startDate = new Date(params.get('startDate'));
                    issuances = issuances.filter(i => {
                        if (!i.issuanceTime) return false;
                        return new Date(i.issuanceTime) >= startDate;
                    });
                }
                if (params.get('endDate')) {
                    const endDate = new Date(params.get('endDate'));
                    endDate.setHours(23, 59, 59, 999); // 设置为当天的最后一刻
                    issuances = issuances.filter(i => {
                        if (!i.issuanceTime) return false;
                        return new Date(i.issuanceTime) <= endDate;
                    });
                }
                if (params.get('status')) {
                    const statusParam = params.get('status');
                    // 支持多状态查询（用逗号分隔）
                    const statuses = statusParam.split(',').map(s => s.trim());
                    issuances = issuances.filter(i => statuses.includes(i.status));
                }
                if (params.get('thirdOrgId')) {
                    issuances = issuances.filter(i => i.thirdOrgId === parseInt(params.get('thirdOrgId')));
                }
                if (params.get('issuanceMonth')) {
                    const month = params.get('issuanceMonth');
                    issuances = issuances.filter(i => {
                        if (!i.issuanceMonth) return false;
                        const issuanceMonthStr = i.issuanceMonth.substring(0, 7); // 取前7位 yyyy-MM
                        return issuanceMonthStr === month;
                    });
                }
                
                // 添加关联信息
                issuances = issuances.map(issuance => {
                    const org3 = MockData.organizations.find(o => o.orgId === issuance.thirdOrgId);
                    const org2 = org3 ? MockData.organizations.find(o => o.orgId === org3.parentId) : null;
                    const org1 = org2 ? MockData.organizations.find(o => o.orgId === org2.parentId) : null;
                    return {
                        ...issuance,
                        orgFullPath: org1 && org2 && org3 ? `${org1.orgName}/${org2.orgName}/${org3.orgName}` : (issuance.orgFullPath || '-')
                    };
                });
                
                const total = issuances.length;
                const start = (page - 1) * size;
                const list = issuances.slice(start, start + size);
                
                result = {
                    code: 200,
                    message: '查询成功',
                    data: { total, list },
                    timestamp: Date.now()
                };
            }
            else {
                throw new Error('接口未实现: ' + method + ' ' + url);
            }
            
            return result;
        } catch (error) {
            return {
                code: 500,
                message: error.message || '服务器错误',
                data: null,
                timestamp: Date.now()
            };
        }
    };
    
    // 辅助函数：获取当前月份
    function getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    console.log('✅ Mock API已启用 - 使用模拟数据，无需后端服务');
    console.log('💡 提示：所有数据保存在浏览器LocalStorage中');
}

