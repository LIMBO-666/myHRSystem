// 人力资源档案查询

let queryPage = 1;
const queryPageSize = 10;

// 存储可搜索下拉框实例
let queryFirstOrgSearchable = null;
let querySecondOrgSearchable = null;
let queryThirdOrgSearchable = null;
let queryPositionSearchable = null;

// 确保可以访问currentUserInfo
async function loadArchiveQueryPage() {
    // 如果没有currentUserInfo，尝试获取
    if (!window.currentUserInfo) {
        try {
            const response = await UserAPI.getCurrentUser();
            if (response && response.data) {
                window.currentUserInfo = response.data;
            }
        } catch (error) {
            console.log('获取用户信息失败:', error);
        }
    }
    
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <h2 class="page-title">人力资源档案查询</h2>
            
            <div class="form-section" style="background: #fafafa; padding: 20px; border-radius: 4px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>一级机构</label>
                        <select id="queryFirstOrgId" class="form-control">
                            <option value="">选择一级机构</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>二级机构</label>
                        <select id="querySecondOrgId" class="form-control">
                            <option value="">选择二级机构</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>三级机构</label>
                        <select id="queryThirdOrgId" class="form-control">
                            <option value="">选择三级机构</option>
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <div class="form-group">
                        <label>职位名称</label>
                        <select id="queryPositionId" class="form-control">
                            <option value="">选择职位名称</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>建档起始日期</label>
                        <input type="date" id="queryStartDate" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>建档结束日期</label>
                        <input type="date" id="queryEndDate" class="form-control">
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-secondary" onclick="resetArchiveQuery()" style="margin-right: 10px;">重置条件</button>
                    <button class="btn btn-primary" onclick="doQuery()">查询</button>
                </div>
            </div>
            
            <div class="list-section" style="margin-top: 30px;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>档案编号</th>
                            <th>姓名</th>
                            <th>所属机构</th>
                            <th>职位</th>
                            <th>建档时间</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="queryTableBody">
                        <tr>
                            <td colspan="7" style="text-align: center; color: #999; padding: 20px;">请输入查询条件并点击查询</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div id="queryPagination" style="margin-top: 20px; text-align: center;"></div>
        </div>
    `;
    
    await loadQueryOrgData();
    
    // 监听档案创建、更新和复核事件，自动刷新列表（如果已查询过）
    const refreshIfQueried = async () => {
        const tbody = document.getElementById('queryTableBody');
        if (tbody && tbody.innerHTML && !tbody.innerHTML.includes('请输入查询条件')) {
            await executeQuery();
        }
    };
    
    window.addEventListener('employeeArchiveCreated', refreshIfQueried);
    window.addEventListener('employeeArchiveUpdated', refreshIfQueried);
    window.addEventListener('employeeArchiveReviewed', refreshIfQueried);
}

async function loadQueryOrgData() {
    try {
        // 加载一级机构
        const level1Response = await OrgAPI.getLevel1List();
        const level1Orgs = level1Response.data || [];
        
        // 创建一级机构可搜索下拉框
        const firstOrgOptions = level1Orgs.map(org => ({
            value: org.orgId,
            text: org.orgName
        }));
        
        queryFirstOrgSearchable = createSearchableSelect('queryFirstOrgId', firstOrgOptions, (value, text) => {
            onQueryFirstOrgChangeWithId(value);
        }, '输入关键词搜索或选择一级机构');
        
    } catch (error) {
        showMessage('加载机构数据失败: ' + error.message, 'error');
    }
}

// 带ID参数的一级机构变化处理函数
async function onQueryFirstOrgChangeWithId(firstOrgId) {
    // 清空二级、三级机构和职位
    if (querySecondOrgSearchable) {
        querySecondOrgSearchable.clear();
        querySecondOrgSearchable.updateOptions([]);
    } else {
        const secondOrgSelect = document.getElementById('querySecondOrgId');
        if (secondOrgSelect) {
            secondOrgSelect.innerHTML = '<option value="">选择二级机构</option>';
        }
    }
    
    if (queryThirdOrgSearchable) {
        queryThirdOrgSearchable.clear();
        queryThirdOrgSearchable.updateOptions([]);
    } else {
        const thirdOrgSelect = document.getElementById('queryThirdOrgId');
        if (thirdOrgSelect) {
            thirdOrgSelect.innerHTML = '<option value="">选择三级机构</option>';
        }
    }
    
    if (queryPositionSearchable) {
        queryPositionSearchable.clear();
        queryPositionSearchable.updateOptions([]);
    } else {
        const positionSelect = document.getElementById('queryPositionId');
        if (positionSelect) {
            positionSelect.innerHTML = '<option value="">选择职位名称</option>';
        }
    }
    
    if (!firstOrgId) return;
    
    try {
        const response = await OrgAPI.getLevel2List(parseInt(firstOrgId));
        const level2Orgs = response.data || [];
        
        // 更新二级机构可搜索下拉框
        const secondOrgOptions = level2Orgs.map(org => ({
            value: org.orgId,
            text: org.orgName
        }));
        
        if (!querySecondOrgSearchable) {
            querySecondOrgSearchable = createSearchableSelect('querySecondOrgId', secondOrgOptions, (value, text) => {
                onQuerySecondOrgChangeWithId(value);
            }, '输入关键词搜索或选择二级机构');
        } else {
            querySecondOrgSearchable.updateOptions(secondOrgOptions);
        }
    } catch (error) {
        showMessage('加载二级机构失败: ' + error.message, 'error');
    }
}

// 带ID参数的二级机构变化处理函数
async function onQuerySecondOrgChangeWithId(secondOrgId) {
    // 清空三级机构和职位
    if (queryThirdOrgSearchable) {
        queryThirdOrgSearchable.clear();
        queryThirdOrgSearchable.updateOptions([]);
    } else {
        const thirdOrgSelect = document.getElementById('queryThirdOrgId');
        if (thirdOrgSelect) {
            thirdOrgSelect.innerHTML = '<option value="">选择三级机构</option>';
        }
    }
    
    if (queryPositionSearchable) {
        queryPositionSearchable.clear();
        queryPositionSearchable.updateOptions([]);
    } else {
        const positionSelect = document.getElementById('queryPositionId');
        if (positionSelect) {
            positionSelect.innerHTML = '<option value="">选择职位名称</option>';
        }
    }
    
    if (!secondOrgId) return;
    
    try {
        const response = await OrgAPI.getLevel3List(parseInt(secondOrgId));
        const level3Orgs = response.data || [];
        
        // 更新三级机构可搜索下拉框
        const thirdOrgOptions = level3Orgs.map(org => ({
            value: org.orgId,
            text: org.orgName
        }));
        
        if (!queryThirdOrgSearchable) {
            queryThirdOrgSearchable = createSearchableSelect('queryThirdOrgId', thirdOrgOptions, (value, text) => {
                onQueryThirdOrgChangeWithId(value);
            }, '输入关键词搜索或选择三级机构');
        } else {
            queryThirdOrgSearchable.updateOptions(thirdOrgOptions);
        }
    } catch (error) {
        showMessage('加载三级机构失败: ' + error.message, 'error');
    }
}

// 带ID参数的三级机构变化处理函数
async function onQueryThirdOrgChangeWithId(thirdOrgId) {
    // 清空职位
    if (queryPositionSearchable) {
        queryPositionSearchable.clear();
        queryPositionSearchable.updateOptions([]);
    } else {
        const positionSelect = document.getElementById('queryPositionId');
        if (positionSelect) {
            positionSelect.innerHTML = '<option value="">选择职位名称</option>';
        }
    }
    
    if (!thirdOrgId) return;
    
    try {
        const response = await PositionAPI.getList(parseInt(thirdOrgId));
        const positions = response.data || [];
        
        // 更新职位可搜索下拉框
        const positionOptions = positions.map(pos => ({
            value: pos.positionId,
            text: pos.positionName
        }));
        
        if (!queryPositionSearchable) {
            queryPositionSearchable = createSearchableSelect('queryPositionId', positionOptions, () => {
                // 职位选择变化时不需要特殊处理
            }, '输入关键词搜索或选择职位名称');
        } else {
            queryPositionSearchable.updateOptions(positionOptions);
        }
    } catch (error) {
        showMessage('加载职位失败: ' + error.message, 'error');
    }
}

async function doQuery() {
    queryPage = 1;
    await executeQuery();
}

async function executeQuery() {
    try {
        // 获取筛选条件 - 优先从可搜索下拉框获取，如果没有则从原始select获取
        let firstOrgIdRaw = '';
        if (queryFirstOrgSearchable) {
            const value = queryFirstOrgSearchable.getValue();
            firstOrgIdRaw = value ? String(value) : '';
            // 如果可搜索下拉框返回空，尝试从原始select获取
            if (!firstOrgIdRaw) {
                const selectEl = document.getElementById('queryFirstOrgId');
                firstOrgIdRaw = selectEl ? String(selectEl.value || '') : '';
            }
        } else {
            const selectEl = document.getElementById('queryFirstOrgId');
            firstOrgIdRaw = selectEl ? String(selectEl.value || '') : '';
        }
        
        let secondOrgIdRaw = '';
        if (querySecondOrgSearchable) {
            const value = querySecondOrgSearchable.getValue();
            secondOrgIdRaw = value ? String(value) : '';
            if (!secondOrgIdRaw) {
                const selectEl = document.getElementById('querySecondOrgId');
                secondOrgIdRaw = selectEl ? String(selectEl.value || '') : '';
            }
        } else {
            const selectEl = document.getElementById('querySecondOrgId');
            secondOrgIdRaw = selectEl ? String(selectEl.value || '') : '';
        }
        
        let thirdOrgIdRaw = '';
        if (queryThirdOrgSearchable) {
            const value = queryThirdOrgSearchable.getValue();
            thirdOrgIdRaw = value ? String(value) : '';
            if (!thirdOrgIdRaw) {
                const selectEl = document.getElementById('queryThirdOrgId');
                thirdOrgIdRaw = selectEl ? String(selectEl.value || '') : '';
            }
        } else {
            const selectEl = document.getElementById('queryThirdOrgId');
            thirdOrgIdRaw = selectEl ? String(selectEl.value || '') : '';
        }
        
        let positionIdRaw = '';
        if (queryPositionSearchable) {
            const value = queryPositionSearchable.getValue();
            positionIdRaw = value ? String(value) : '';
            if (!positionIdRaw) {
                const selectEl = document.getElementById('queryPositionId');
                positionIdRaw = selectEl ? String(selectEl.value || '') : '';
            }
        } else {
            const selectEl = document.getElementById('queryPositionId');
            positionIdRaw = selectEl ? String(selectEl.value || '') : '';
        }
        
        const startDateRaw = document.getElementById('queryStartDate')?.value || '';
        const endDateRaw = document.getElementById('queryEndDate')?.value || '';
        
        // 清理并验证筛选条件
        const firstOrgId = firstOrgIdRaw && String(firstOrgIdRaw).trim() !== '' ? String(firstOrgIdRaw).trim() : null;
        const secondOrgId = secondOrgIdRaw && String(secondOrgIdRaw).trim() !== '' ? String(secondOrgIdRaw).trim() : null;
        const thirdOrgId = thirdOrgIdRaw && String(thirdOrgIdRaw).trim() !== '' ? String(thirdOrgIdRaw).trim() : null;
        const positionId = positionIdRaw && String(positionIdRaw).trim() !== '' ? String(positionIdRaw).trim() : null;
        const startDate = startDateRaw && startDateRaw.trim() !== '' ? startDateRaw.trim() : null;
        const endDate = endDateRaw && endDateRaw.trim() !== '' ? endDateRaw.trim() : null;
        
        // 构建查询参数
        // 查询正常和待复核状态的档案（变更后的档案状态为待复核）
        const params = {
            page: queryPage,
            size: queryPageSize
            // 不指定status参数，让API返回所有状态的记录，或者可以查询NORMAL和PENDING_REVIEW
        };
        
        // 只添加有效的筛选条件
        if (firstOrgId) {
            const id = parseInt(firstOrgId);
            if (!isNaN(id) && id > 0) {
                params.firstOrgId = id;
            }
        }
        if (secondOrgId) {
            const id = parseInt(secondOrgId);
            if (!isNaN(id) && id > 0) {
                params.secondOrgId = id;
            }
        }
        if (thirdOrgId) {
            const id = parseInt(thirdOrgId);
            if (!isNaN(id) && id > 0) {
                params.thirdOrgId = id;
            }
        }
        if (positionId) {
            const id = parseInt(positionId);
            if (!isNaN(id) && id > 0) {
                params.positionId = id;
            }
        }
        if (startDate) {
            params.startDate = startDate;
        }
        if (endDate) {
            params.endDate = endDate;
        }
        
        // 调试信息
        console.log('查询参数:', params);
        console.log('原始值:', {
            firstOrgIdRaw,
            secondOrgIdRaw,
            thirdOrgIdRaw,
            positionIdRaw,
            startDateRaw,
            endDateRaw
        });
        // 调试可搜索下拉框状态
        if (queryFirstOrgSearchable) {
            console.log('一级机构可搜索下拉框状态:', {
                getValue: queryFirstOrgSearchable.getValue(),
                getText: queryFirstOrgSearchable.getText(),
                inputValue: queryFirstOrgSearchable.input?.value,
                originalSelectValue: document.getElementById('queryFirstOrgId')?.value
            });
        }
        
        // 执行查询
        const response = await EmployeeArchiveAPI.query(params);
        const data = response.data || {};
        const archives = data.list || [];
        const total = data.total || 0;
        
        const tbody = document.getElementById('queryTableBody');
        if (!tbody) {
            console.error('找不到queryTableBody元素');
            return;
        }
        
        // 如果没有查询结果，显示提示信息
        if (archives.length === 0 || total === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999; padding: 20px;">未查询到相关结果</td></tr>';
            const pagination = document.getElementById('queryPagination');
            if (pagination) {
                pagination.innerHTML = '';
            }
            return;
        }
        
        // 获取当前用户角色
        const currentUser = window.currentUserInfo || {};
        const userRole = currentUser.role;
        const isHRSpecialist = userRole === 'HR_SPECIALIST';
        
        tbody.innerHTML = archives.map(archive => {
            // 待复核状态的档案可以查看和变更，正常状态的档案只能查看
            const isPendingReview = archive.status === 'PENDING_REVIEW';
            const isNormal = archive.status === 'NORMAL';
            
            let actionButtons = '';
            if (isHRSpecialist) {
                if (isPendingReview) {
                    // 待复核：显示查看和变更
                    actionButtons = `<button class="btn btn-warning" onclick="viewArchive(${archive.archiveId})" style="margin-right: 5px;">查看</button>` +
                                   `<button class="btn btn-primary" onclick="changeArchive(${archive.archiveId})">变更</button>`;
                } else if (isNormal) {
                    // 正常：只显示查看
                    actionButtons = `<button class="btn btn-warning" onclick="viewArchive(${archive.archiveId})">查看</button>`;
                } else {
                    // 其他状态：只显示查看
                    actionButtons = `<button class="btn btn-warning" onclick="viewArchive(${archive.archiveId})">查看</button>`;
                }
            } else {
                // 非人事专员：只显示查看
                actionButtons = `<button class="btn btn-warning" onclick="viewArchive(${archive.archiveId})">查看</button>`;
            }
            
            // 根据状态显示不同的标签
            let statusBadge = '';
            if (archive.status === 'PENDING_REVIEW') {
                statusBadge = '<span style="padding: 4px 8px; background: #fffbe6; color: #faad14; border-radius: 4px;">待复核</span>';
            } else if (archive.status === 'NORMAL') {
                statusBadge = '<span style="padding: 4px 8px; background: #f6ffed; color: #52c41a; border-radius: 4px;">正常</span>';
            } else if (archive.status === 'DELETED') {
                statusBadge = '<span style="padding: 4px 8px; background: #fff1f0; color: #ff4d4f; border-radius: 4px;">已删除</span>';
            } else {
                statusBadge = '<span style="padding: 4px 8px; background: #f0f0f0; color: #666; border-radius: 4px;">' + archive.status + '</span>';
            }
            
            return `
            <tr>
                <td>${archive.archiveNumber}</td>
                <td>${archive.name}</td>
                <td>${archive.orgFullPath || '-'}</td>
                <td>${archive.positionName || '-'}</td>
                <td>${formatDateTime(archive.registrationTime)}</td>
                <td>
                    ${statusBadge}
                </td>
                <td>
                    ${actionButtons}
                </td>
            </tr>
        `;
        }).join('');
        
        // 分页
        renderQueryPagination(total, queryPage, queryPageSize);
    } catch (error) {
        showMessage('查询失败: ' + error.message, 'error');
    }
}

function renderQueryPagination(total, current, size) {
    const totalPages = Math.ceil(total / size);
    const pagination = document.getElementById('queryPagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = `<div style="text-align: center; margin-top: 10px; color: #999;">共 ${total} 条记录</div>`;
        return;
    }
    
    let html = '<div style="display: flex; justify-content: center; gap: 10px; align-items: center;">';
    
    if (current > 1) {
        html += `<button class="btn btn-secondary" onclick="changeQueryPage(${current - 1})">上一页</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === current) {
            html += `<span style="padding: 8px 12px; background: #1890ff; color: white; border-radius: 4px;">${i}</span>`;
        } else {
            html += `<button class="btn btn-secondary" onclick="changeQueryPage(${i})">${i}</button>`;
        }
    }
    
    if (current < totalPages) {
        html += `<button class="btn btn-secondary" onclick="changeQueryPage(${current + 1})">下一页</button>`;
    }
    
    html += `</div><div style="text-align: center; margin-top: 10px; color: #999;">共 ${total} 条记录</div>`;
    pagination.innerHTML = html;
}

function changeQueryPage(page) {
    queryPage = page;
    executeQuery();
}

function resetArchiveQuery() {
    console.log('重置档案查询条件被调用');
    console.log('可搜索下拉框实例:', {
        queryFirstOrgSearchable: !!queryFirstOrgSearchable,
        querySecondOrgSearchable: !!querySecondOrgSearchable,
        queryThirdOrgSearchable: !!queryThirdOrgSearchable,
        queryPositionSearchable: !!queryPositionSearchable
    });
    console.log('全局对象:', window.searchableSelects);
    
    try {
        // 方法1: 从全局对象获取并清空
        const firstOrgSearchable = window.searchableSelects && window.searchableSelects['queryFirstOrgId'];
        const secondOrgSearchable = window.searchableSelects && window.searchableSelects['querySecondOrgId'];
        const thirdOrgSearchable = window.searchableSelects && window.searchableSelects['queryThirdOrgId'];
        const positionSearchable = window.searchableSelects && window.searchableSelects['queryPositionId'];
        
        console.log('从全局对象获取:', {
            firstOrg: !!firstOrgSearchable,
            secondOrg: !!secondOrgSearchable,
            thirdOrg: !!thirdOrgSearchable,
            position: !!positionSearchable
        });
        
        // 一级机构
        if (firstOrgSearchable && firstOrgSearchable.input) {
            firstOrgSearchable.input.value = '';
            firstOrgSearchable.clear();
            console.log('一级机构已通过全局对象清空');
        } else if (queryFirstOrgSearchable && queryFirstOrgSearchable.input) {
            queryFirstOrgSearchable.input.value = '';
            queryFirstOrgSearchable.clear();
            console.log('一级机构已通过本地变量清空');
        } else {
            const firstOrgInput = document.getElementById('queryFirstOrgId_input');
            if (firstOrgInput) {
                firstOrgInput.value = '';
                firstOrgInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('一级机构输入框已直接清空');
            }
        }
        
        // 二级机构
        if (secondOrgSearchable && secondOrgSearchable.input) {
            secondOrgSearchable.input.value = '';
            secondOrgSearchable.clear();
            secondOrgSearchable.updateOptions([]);
            console.log('二级机构已通过全局对象清空');
        } else if (querySecondOrgSearchable && querySecondOrgSearchable.input) {
            querySecondOrgSearchable.input.value = '';
            querySecondOrgSearchable.clear();
            querySecondOrgSearchable.updateOptions([]);
            console.log('二级机构已通过本地变量清空');
        } else {
            const secondOrgInput = document.getElementById('querySecondOrgId_input');
            if (secondOrgInput) {
                secondOrgInput.value = '';
                secondOrgInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('二级机构输入框已直接清空');
            }
            const secondOrgSelect = document.getElementById('querySecondOrgId');
            if (secondOrgSelect) {
                secondOrgSelect.value = '';
                secondOrgSelect.innerHTML = '<option value="">选择二级机构</option>';
            }
        }
        
        // 三级机构
        if (thirdOrgSearchable && thirdOrgSearchable.input) {
            thirdOrgSearchable.input.value = '';
            thirdOrgSearchable.clear();
            thirdOrgSearchable.updateOptions([]);
            console.log('三级机构已通过全局对象清空');
        } else if (queryThirdOrgSearchable && queryThirdOrgSearchable.input) {
            queryThirdOrgSearchable.input.value = '';
            queryThirdOrgSearchable.clear();
            queryThirdOrgSearchable.updateOptions([]);
            console.log('三级机构已通过本地变量清空');
        } else {
            const thirdOrgInput = document.getElementById('queryThirdOrgId_input');
            if (thirdOrgInput) {
                thirdOrgInput.value = '';
                thirdOrgInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('三级机构输入框已直接清空');
            }
            const thirdOrgSelect = document.getElementById('queryThirdOrgId');
            if (thirdOrgSelect) {
                thirdOrgSelect.value = '';
                thirdOrgSelect.innerHTML = '<option value="">选择三级机构</option>';
            }
        }
        
        // 职位
        if (positionSearchable && positionSearchable.input) {
            positionSearchable.input.value = '';
            positionSearchable.clear();
            positionSearchable.updateOptions([]);
            console.log('职位已通过全局对象清空');
        } else if (queryPositionSearchable && queryPositionSearchable.input) {
            queryPositionSearchable.input.value = '';
            queryPositionSearchable.clear();
            queryPositionSearchable.updateOptions([]);
            console.log('职位已通过本地变量清空');
        } else {
            const positionInput = document.getElementById('queryPositionId_input');
            if (positionInput) {
                positionInput.value = '';
                positionInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('职位输入框已直接清空');
            }
            const positionSelect = document.getElementById('queryPositionId');
            if (positionSelect) {
                positionSelect.value = '';
                positionSelect.innerHTML = '<option value="">选择职位名称</option>';
            }
        }
        
        // 重置日期
        const startDateInput = document.getElementById('queryStartDate');
        if (startDateInput) {
            startDateInput.value = '';
            console.log('起始日期已重置');
        }
        
        const endDateInput = document.getElementById('queryEndDate');
        if (endDateInput) {
            endDateInput.value = '';
            console.log('结束日期已重置');
        }
        
        // 重置查询结果
        const tableBody = document.getElementById('queryTableBody');
        if (tableBody) {
            tableBody.innerHTML = 
                '<tr><td colspan="7" style="text-align: center; color: #999; padding: 20px;">请输入查询条件并点击查询</td></tr>';
            console.log('查询结果已重置');
        }
        
        // 重置分页
        const pagination = document.getElementById('queryPagination');
        if (pagination) {
            pagination.innerHTML = '';
            console.log('分页已重置');
        }
        
        // 重置分页页码
        queryPage = 1;
        
        console.log('重置完成');
    } catch (error) {
        console.error('重置查询条件时出错:', error);
        showMessage('重置失败: ' + error.message, 'error');
    }
}

async function viewArchive(archiveId) {
    try {
        const response = await EmployeeArchiveAPI.getDetail(archiveId);
        const archive = response.data;
        
        // 显示档案详情模态框
        createModal('档案详情', `
            <div style="max-height: 70vh; overflow-y: auto;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div><strong>档案编号：</strong>${archive.archiveNumber}</div>
                    <div><strong>姓名：</strong>${archive.name}</div>
                    <div><strong>性别：</strong>${archive.gender === 'MALE' ? '男' : '女'}</div>
                    <div><strong>身份证号：</strong>${archive.idNumber || '-'}</div>
                    <div><strong>出生日期：</strong>${archive.birthday || '-'}</div>
                    <div><strong>年龄：</strong>${archive.age || '-'}</div>
                    <div><strong>所属机构：</strong>${archive.orgFullPath || '-'}</div>
                    <div><strong>职位：</strong>${archive.positionName || '-'}</div>
                    <div><strong>职称：</strong>${archive.jobTitle === 'JUNIOR' ? '初级' : archive.jobTitle === 'INTERMEDIATE' ? '中级' : '高级'}</div>
                    <div><strong>状态：</strong>${archive.status === 'NORMAL' ? '正常' : archive.status === 'PENDING_REVIEW' ? '待复核' : '已删除'}</div>
                </div>
            </div>
        `);
    } catch (error) {
        showMessage('加载档案详情失败: ' + error.message, 'error');
    }
}

// 档案变更功能
let currentChangeArchiveId = null;
let changeArchiveLevel1Orgs = [];
let changeArchiveLevel2Orgs = [];
let changeArchiveLevel3Orgs = [];
let changeArchivePositions = [];
let changeArchiveSalaryStandards = [];

async function changeArchive(archiveId) {
    currentChangeArchiveId = archiveId;
    
    try {
        // 获取档案详情
        const response = await EmployeeArchiveAPI.getDetail(archiveId);
        const archive = response.data;
        
        // 检查状态，只有待复核状态的档案才能变更
        if (archive.status !== 'PENDING_REVIEW') {
            showMessage('只有待复核状态的档案才能变更', 'error');
            return;
        }
        
        // 加载机构数据
        await loadChangeArchiveOrgData();
        
        // 显示变更表单模态框
        showChangeArchiveForm(archive);
    } catch (error) {
        showMessage('加载档案信息失败: ' + error.message, 'error');
    }
}

async function loadChangeArchiveOrgData() {
    try {
        // 加载一级机构
        const level1Response = await OrgAPI.getLevel1List();
        changeArchiveLevel1Orgs = level1Response.data || [];
    } catch (error) {
        showMessage('加载机构数据失败: ' + error.message, 'error');
    }
}

function showChangeArchiveForm(archive) {
    const modalContent = `
        <div style="max-height: 80vh; overflow-y: auto;">
            <form id="changeArchiveForm" onsubmit="submitChangeArchive(event)">
                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">基本信息（不可修改）</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>档案编号</label>
                            <input type="text" class="form-control" value="${archive.archiveNumber}" readonly style="background: #f5f5f5;">
                        </div>
                        <div class="form-group">
                            <label>所属机构</label>
                            <input type="text" class="form-control" value="${archive.orgFullPath || '-'}" readonly style="background: #f5f5f5;">
                        </div>
                        <div class="form-group">
                            <label>职位</label>
                            <input type="text" class="form-control" value="${archive.positionName || '-'}" readonly style="background: #f5f5f5;">
                        </div>
                    </div>
                </div>

                <div class="form-section" style="margin-top: 20px;">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">可修改信息</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>姓名 <span style="color: red;">*</span></label>
                            <input type="text" id="changeName" class="form-control" value="${archive.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>性别 <span style="color: red;">*</span></label>
                            <select id="changeGender" class="form-control" required>
                                <option value="MALE" ${archive.gender === 'MALE' ? 'selected' : ''}>男</option>
                                <option value="FEMALE" ${archive.gender === 'FEMALE' ? 'selected' : ''}>女</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>身份证号码</label>
                            <input type="text" id="changeIdNumber" class="form-control" value="${archive.idNumber || ''}">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>出生日期</label>
                            <input type="date" id="changeBirthday" class="form-control" value="${archive.birthday || ''}">
                        </div>
                        <div class="form-group">
                            <label>年龄</label>
                            <input type="number" id="changeAge" class="form-control" value="${archive.age || ''}" readonly style="background: #f5f5f5;">
                        </div>
                        <div class="form-group">
                            <label>民族</label>
                            <input type="text" id="changeEthnicity" class="form-control" list="changeEthnicity-list" placeholder="输入关键词搜索或选择民族" value="${archive.ethnicity || ''}" autocomplete="off">
                            <datalist id="changeEthnicity-list">
                                <option value="汉族">汉族</option>
                                <option value="蒙古族">蒙古族</option>
                                <option value="回族">回族</option>
                                <option value="藏族">藏族</option>
                                <option value="维吾尔族">维吾尔族</option>
                                <option value="苗族">苗族</option>
                                <option value="彝族">彝族</option>
                                <option value="壮族">壮族</option>
                                <option value="布依族">布依族</option>
                                <option value="朝鲜族">朝鲜族</option>
                                <option value="满族">满族</option>
                                <option value="侗族">侗族</option>
                                <option value="瑶族">瑶族</option>
                                <option value="白族">白族</option>
                                <option value="土家族">土家族</option>
                                <option value="哈尼族">哈尼族</option>
                                <option value="哈萨克族">哈萨克族</option>
                                <option value="傣族">傣族</option>
                                <option value="黎族">黎族</option>
                                <option value="傈僳族">傈僳族</option>
                                <option value="佤族">佤族</option>
                                <option value="畲族">畲族</option>
                                <option value="高山族">高山族</option>
                                <option value="拉祜族">拉祜族</option>
                                <option value="水族">水族</option>
                                <option value="东乡族">东乡族</option>
                                <option value="纳西族">纳西族</option>
                                <option value="景颇族">景颇族</option>
                                <option value="柯尔克孜族">柯尔克孜族</option>
                                <option value="土族">土族</option>
                                <option value="达斡尔族">达斡尔族</option>
                                <option value="仫佬族">仫佬族</option>
                                <option value="羌族">羌族</option>
                                <option value="布朗族">布朗族</option>
                                <option value="撒拉族">撒拉族</option>
                                <option value="毛南族">毛南族</option>
                                <option value="仡佬族">仡佬族</option>
                                <option value="锡伯族">锡伯族</option>
                                <option value="阿昌族">阿昌族</option>
                                <option value="普米族">普米族</option>
                                <option value="塔吉克族">塔吉克族</option>
                                <option value="怒族">怒族</option>
                                <option value="乌孜别克族">乌孜别克族</option>
                                <option value="俄罗斯族">俄罗斯族</option>
                                <option value="鄂温克族">鄂温克族</option>
                                <option value="德昂族">德昂族</option>
                                <option value="保安族">保安族</option>
                                <option value="裕固族">裕固族</option>
                                <option value="京族">京族</option>
                                <option value="塔塔尔族">塔塔尔族</option>
                                <option value="独龙族">独龙族</option>
                                <option value="鄂伦春族">鄂伦春族</option>
                                <option value="赫哲族">赫哲族</option>
                                <option value="门巴族">门巴族</option>
                                <option value="珞巴族">珞巴族</option>
                                <option value="基诺族">基诺族</option>
                            </datalist>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>学历</label>
                            <input type="text" id="changeEducationLevel" class="form-control" list="changeEducationLevel-list" placeholder="输入关键词搜索或选择学历" value="${archive.educationLevel || ''}" autocomplete="off">
                            <datalist id="changeEducationLevel-list">
                                <option value="小学">小学</option>
                                <option value="初中">初中</option>
                                <option value="高中">高中</option>
                                <option value="中专">中专</option>
                                <option value="大专">大专</option>
                                <option value="本科">本科</option>
                                <option value="硕士">硕士</option>
                                <option value="博士">博士</option>
                                <option value="其他">其他</option>
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label>职称</label>
                            <select id="changeJobTitle" class="form-control">
                                <option value="JUNIOR" ${archive.jobTitle === 'JUNIOR' ? 'selected' : ''}>初级</option>
                                <option value="INTERMEDIATE" ${archive.jobTitle === 'INTERMEDIATE' ? 'selected' : ''}>中级</option>
                                <option value="SENIOR" ${archive.jobTitle === 'SENIOR' ? 'selected' : ''}>高级</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>薪酬标准</label>
                            <select id="changeSalaryStandardId" class="form-control">
                                <option value="">选择薪酬标准</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-section" style="margin-top: 20px;">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">联系方式</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="changeEmail" class="form-control" value="${archive.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>电话</label>
                            <input type="text" id="changePhone" class="form-control" value="${archive.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label>手机</label>
                            <input type="text" id="changeMobile" class="form-control" value="${archive.mobile || ''}">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>QQ</label>
                            <input type="text" id="changeQq" class="form-control" value="${archive.qq || ''}">
                        </div>
                        <div class="form-group">
                            <label>住址</label>
                            <input type="text" id="changeAddress" class="form-control" value="${archive.address || ''}">
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <div class="form-group">
                            <label>邮编</label>
                            <input type="text" id="changePostalCode" class="form-control" value="${archive.postalCode || ''}">
                        </div>
                    </div>
                </div>

                <div class="form-section" style="margin-top: 20px;">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">其他信息</h3>
                    <div class="form-group">
                        <label>爱好</label>
                        <textarea id="changeHobby" class="form-control" rows="2">${archive.hobby || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>个人履历</label>
                        <textarea id="changePersonalResume" class="form-control" rows="4">${archive.personalResume || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>家庭关系</label>
                        <textarea id="changeFamilyRelationship" class="form-control" rows="4">${archive.familyRelationship || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>备注</label>
                        <textarea id="changeRemarks" class="form-control" rows="3">${archive.remarks || ''}</textarea>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: right;">
                    <button type="button" class="btn btn-secondary" onclick="closeChangeArchiveModal()" style="margin-right: 10px;">取消</button>
                    <button type="submit" class="btn btn-primary">提交变更</button>
                </div>
            </form>
        </div>
    `;
    
    const { modal, closeModal } = createModal('档案变更', modalContent);
    window.currentChangeArchiveModal = { modal, closeModal };
    
    // 设置出生日期变化监听
    const birthdayInput = document.getElementById('changeBirthday');
    const ageInput = document.getElementById('changeAge');
    if (birthdayInput && ageInput) {
        birthdayInput.addEventListener('change', () => {
            if (birthdayInput.value) {
                const birthDate = new Date(birthdayInput.value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                ageInput.value = age;
            }
        });
    }
    
    // 加载薪酬标准
    loadChangeArchiveSalaryStandard(archive.positionId, archive.jobTitle, archive.salaryStandardId);
}

async function loadChangeArchiveSalaryStandard(positionId, jobTitle, currentSalaryStandardId) {
    if (!positionId || !jobTitle) return;
    
    try {
        const response = await SalaryStandardAPI.getByPosition(parseInt(positionId), jobTitle);
        const salaryStandardSelect = document.getElementById('changeSalaryStandardId');
        if (salaryStandardSelect) {
            if (response && response.data) {
                salaryStandardSelect.innerHTML = `<option value="${response.data.standardId}">${response.data.standardName}</option>`;
                if (currentSalaryStandardId) {
                    salaryStandardSelect.value = currentSalaryStandardId;
                }
            } else {
                salaryStandardSelect.innerHTML = '<option value="">暂无薪酬标准</option>';
            }
        }
    } catch (error) {
        console.log('加载薪酬标准失败:', error);
    }
}

async function submitChangeArchive(event) {
    event.preventDefault();
    
    if (!currentChangeArchiveId) {
        showMessage('档案ID不存在', 'error');
        return;
    }
    
    const formData = {
        name: document.getElementById('changeName').value.trim(),
        gender: document.getElementById('changeGender').value,
        idNumber: document.getElementById('changeIdNumber').value.trim(),
        birthday: document.getElementById('changeBirthday').value || null,
        age: parseInt(document.getElementById('changeAge').value) || null,
        ethnicity: document.getElementById('changeEthnicity').value.trim(),
        educationLevel: document.getElementById('changeEducationLevel').value.trim(),
        jobTitle: document.getElementById('changeJobTitle').value,
        email: document.getElementById('changeEmail').value.trim(),
        phone: document.getElementById('changePhone').value.trim(),
        qq: document.getElementById('changeQq').value.trim(),
        mobile: document.getElementById('changeMobile').value.trim(),
        address: document.getElementById('changeAddress').value.trim(),
        postalCode: document.getElementById('changePostalCode').value.trim(),
        hobby: document.getElementById('changeHobby').value.trim(),
        personalResume: document.getElementById('changePersonalResume').value.trim(),
        familyRelationship: document.getElementById('changeFamilyRelationship').value.trim(),
        remarks: document.getElementById('changeRemarks').value.trim(),
        salaryStandardId: parseInt(document.getElementById('changeSalaryStandardId').value) || null,
    };
    
    // 验证必填字段
    if (!formData.name || !formData.gender) {
        showMessage('请填写姓名和性别', 'error');
        return;
    }
    
    try {
        const response = await EmployeeArchiveAPI.update(currentChangeArchiveId, formData);
        showMessage('档案变更成功，等待复核', 'success');
        if (window.currentChangeArchiveModal && window.currentChangeArchiveModal.closeModal) {
            window.currentChangeArchiveModal.closeModal();
        }
        // 触发自定义事件，通知复核页面刷新
        window.dispatchEvent(new CustomEvent('employeeArchiveUpdated', {
            detail: { archiveId: currentChangeArchiveId }
        }));
        // 刷新查询列表
        await executeQuery();
    } catch (error) {
        showMessage('变更失败: ' + error.message, 'error');
    }
}

function closeChangeArchiveModal() {
    if (window.currentChangeArchiveModal && window.currentChangeArchiveModal.closeModal) {
        window.currentChangeArchiveModal.closeModal();
    }
}

// 将函数暴露到全局
window.loadArchiveQueryPage = loadArchiveQueryPage;
window.doQuery = doQuery;
window.resetArchiveQuery = resetArchiveQuery;
window.changeQueryPage = changeQueryPage;
window.viewArchive = viewArchive;
window.changeArchive = changeArchive;
window.submitChangeArchive = submitChangeArchive;
window.closeChangeArchiveModal = closeChangeArchiveModal;

