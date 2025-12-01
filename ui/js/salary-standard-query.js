// 薪酬标准查询页面

(() => {
let currentPage = 1;
const pageSize = 10;

async function loadSalaryStandardQueryPage() {
    try {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="page-header">
                <h2>薪酬标准查询</h2>
            </div>
            <div class="card">
                <div class="search-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>薪酬标准编号</label>
                            <input type="text" id="queryStandardCode" class="form-control" placeholder="支持模糊查询">
                        </div>
                        <div class="form-group">
                            <label>关键字</label>
                            <input type="text" id="queryKeyword" class="form-control" placeholder="在标准名称、制定人、变更人、复核人中搜索">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>登记起始日期</label>
                            <input type="date" id="queryStartDate" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>登记结束日期</label>
                            <input type="date" id="queryEndDate" class="form-control">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick="queryStandards()">查询</button>
                        <button class="btn btn-secondary" onclick="resetSalaryStandardQuery()">重置条件</button>
                    </div>
                </div>
                
                <div class="table-container" style="margin-top: 20px;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>薪酬标准编号</th>
                                <th>薪酬标准名称</th>
                                <th>适用职位</th>
                                <th>职称</th>
                                <th>制定人</th>
                                <th>登记时间</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="queryList"></tbody>
                    </table>
                </div>
                <div class="pagination" id="pagination"></div>
            </div>
        `;
        
        // 确保 DOM 已经渲染完成 - 使用 requestAnimationFrame 确保浏览器完成渲染
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 轮询检查 DOM 元素是否存在，最多等待 1 秒
        let retries = 0;
        while (retries < 20) {
            const queryListEl = document.getElementById('queryList');
            if (queryListEl) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            retries++;
        }
        
        const queryListEl = document.getElementById('queryList');
        if (!queryListEl) {
            console.error('DOM 元素 queryList 未找到，页面可能加载失败');
            showMessage('页面加载失败，请刷新页面重试', 'error');
            return;
        }
        
        await queryStandards();
        
        // 监听薪酬标准创建事件，自动刷新列表
        window.addEventListener('salaryStandardCreated', async () => {
            await queryStandards();
        });
    } catch (error) {
        console.error('加载薪酬标准查询页面失败:', error);
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="welcome">
                <h2 style="color: #ff4d4f;">加载页面失败</h2>
                <p style="color: #ff4d4f;">${error.message || '未知错误'}</p>
                <p style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="location.reload(true)">刷新页面</button>
                </p>
            </div>
        `;
        showMessage('加载页面失败：' + (error.message || '未知错误'), 'error');
    }
}


async function queryStandards() {
    try {
        const params = {};
        
        const standardCodeEl = document.getElementById('queryStandardCode');
        const keywordEl = document.getElementById('queryKeyword');
        const startDateEl = document.getElementById('queryStartDate');
        const endDateEl = document.getElementById('queryEndDate');
        
        // 薪酬标准编号（模糊查询）
        if (standardCodeEl && standardCodeEl.value !== null && standardCodeEl.value !== undefined) {
            const val = String(standardCodeEl.value).trim();
            if (val) params.standardCode = val;
        }
        // 关键字（在标准名称、制定人、变更人、复核人中搜索）
        if (keywordEl && keywordEl.value !== null && keywordEl.value !== undefined) {
            const val = String(keywordEl.value).trim();
            if (val) params.keyword = val;
        }
        // 登记起始日期
        if (startDateEl && startDateEl.value !== null && startDateEl.value !== undefined && startDateEl.value !== '') {
            params.startDate = startDateEl.value;
        }
        // 登记结束日期
        if (endDateEl && endDateEl.value !== null && endDateEl.value !== undefined && endDateEl.value !== '') {
            params.endDate = endDateEl.value;
        }
        
        params.page = currentPage;
        params.size = pageSize;
        
        const response = await SalaryStandardAPI.query(params);
        if (response && response.data) {
            renderQueryList(response.data.list || []);
            renderPagination(response.data.total || 0);
        } else {
            renderQueryList([]);
            renderPagination(0);
        }
    } catch (error) {
        console.error('查询失败:', error);
        showMessage('查询失败：' + (error.message || '未知错误'), 'error');
        const tbody = document.getElementById('queryList');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #ff4d4f; padding: 20px;">查询失败，请刷新页面重试</td></tr>';
        }
    }
}

function renderQueryList(list) {
    const tbody = document.getElementById('queryList');
    if (!tbody) {
        console.error('找不到 queryList 元素');
        return;
    }
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(standard => {
        const statusBadge = standard.status === 'PENDING_REVIEW' ? 
            '<span class="badge badge-warning">待复核</span>' :
            standard.status === 'APPROVED' ?
            '<span class="badge badge-success">已通过</span>' :
            '<span class="badge badge-danger">已驳回</span>';
        
        const jobTitleText = standard.jobTitle === 'JUNIOR' ? '初级' : 
                            standard.jobTitle === 'INTERMEDIATE' ? '中级' : '高级';
        
        // 根据状态显示不同的操作按钮
        // 待复核状态：显示"查看"和"更改"按钮
        // 已通过状态：只显示"查看"按钮
        const actionButtons = standard.status === 'PENDING_REVIEW' ?
            `<button class="btn btn-warning btn-sm" onclick="viewStandard(${standard.standardId})" style="margin-right: 5px;">查看</button>
             <button class="btn btn-primary btn-sm" onclick="updateStandard(${standard.standardId})">更改</button>` :
            `<button class="btn btn-warning btn-sm" onclick="viewStandard(${standard.standardId})">查看</button>`;
        
        return `
            <tr>
                <td>${standard.standardCode}</td>
                <td>${standard.standardName}</td>
                <td>${standard.positionName || '-'}</td>
                <td>${jobTitleText}</td>
                <td>${standard.formulatorName || '-'}</td>
                <td>${formatDateTime(standard.registrationTime)}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join('');
}

function renderPagination(total) {
    const pagination = document.getElementById('pagination');
    if (!pagination) {
        console.error('找不到 pagination 元素');
        return;
    }
    const totalPages = Math.ceil(total / pageSize);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination-controls">';
    html += `<button class="btn btn-sm" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
    html += `<span>第 ${currentPage} 页，共 ${totalPages} 页</span>`;
    html += `<button class="btn btn-sm" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
    html += '</div>';
    
    pagination.innerHTML = html;
}

function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    queryStandards();
}

function resetSalaryStandardQuery() {
    console.log('重置薪酬标准查询条件被调用');
    
    try {
        // 重置薪酬标准编号
        const standardCodeInput = document.getElementById('queryStandardCode');
        if (standardCodeInput) {
            standardCodeInput.value = '';
        }
        
        // 重置关键字
        const keywordInput = document.getElementById('queryKeyword');
        if (keywordInput) {
            keywordInput.value = '';
        }
        
        // 重置起始日期
        const startDateInput = document.getElementById('queryStartDate');
        if (startDateInput) {
            startDateInput.value = '';
        }
        
        // 重置结束日期
        const endDateInput = document.getElementById('queryEndDate');
        if (endDateInput) {
            endDateInput.value = '';
        }
        
        // 重置页码
        currentPage = 1;
        
        // 重新查询
        queryStandards();
        
        console.log('重置完成');
    } catch (error) {
        console.error('重置查询条件时出错:', error);
        showMessage('重置失败: ' + error.message, 'error');
    }
}

async function viewStandard(standardId) {
    try {
        const response = await SalaryStandardAPI.getDetail(standardId);
        if (response && response.data) {
            showStandardDetailModal(response.data);
        }
    } catch (error) {
        showMessage('获取详情失败', 'error');
    }
}

function showStandardDetailModal(standard) {
    const itemsHtml = standard.items ? standard.items.map(item => `
        <tr>
            <td>${item.itemCode}</td>
            <td>${item.itemName}</td>
            <td>${item.itemType === 'INCOME' ? '收入项' : '扣除项'}</td>
            <td>¥${parseFloat(item.amount || 0).toFixed(2)}</td>
            <td>${item.isCalculated ? '是' : '否'}</td>
            ${item.calculationRule ? `<td>${item.calculationRule}</td>` : '<td>-</td>'}
        </tr>
    `).join('') : '';
    
    const statusText = standard.status === 'PENDING_REVIEW' ? '待复核' :
                       standard.status === 'APPROVED' ? '已通过' : '已驳回';
    
    const modal = createModal('薪酬标准详情', `
        <div class="review-detail">
            <div class="info-section">
                <h4>基本信息</h4>
                <div class="info-row">
                    <span><strong>薪酬标准编号：</strong>${standard.standardCode}</span>
                    <span><strong>薪酬标准名称：</strong>${standard.standardName}</span>
                </div>
                <div class="info-row">
                    <span><strong>适用职位：</strong>${standard.positionName || '-'}</span>
                    <span><strong>职称：</strong>${standard.jobTitle === 'JUNIOR' ? '初级' : standard.jobTitle === 'INTERMEDIATE' ? '中级' : '高级'}</span>
                </div>
                <div class="info-row">
                    <span><strong>制定人：</strong>${standard.formulatorName || '-'}</span>
                    <span><strong>登记人：</strong>${standard.registrarName || '-'}</span>
                </div>
                <div class="info-row">
                    <span><strong>登记时间：</strong>${formatDateTime(standard.registrationTime)}</span>
                    <span><strong>状态：</strong>${statusText}</span>
                </div>
                ${standard.reviewTime ? `
                <div class="info-row">
                    <span><strong>复核人：</strong>${standard.reviewerName || '-'}</span>
                    <span><strong>复核时间：</strong>${formatDateTime(standard.reviewTime)}</span>
                </div>
                <div class="info-row">
                    <span><strong>复核意见：</strong>${standard.reviewComments || '-'}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="info-section">
                <h4>薪酬项目明细</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>项目编号</th>
                            <th>项目名称</th>
                            <th>项目类型</th>
                            <th>金额</th>
                            <th>自动计算</th>
                            <th>计算规则</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `);
}

// 变更相关变量和函数
let currentUpdateStandardId = null;

async function updateStandard(standardId) {
    try {
        const response = await SalaryStandardAPI.getDetail(standardId);
        if (response && response.data) {
            currentUpdateStandardId = standardId;
            await showUpdateModal(response.data);
        }
    } catch (error) {
        showMessage('获取薪酬标准详情失败', 'error');
    }
}

async function showUpdateModal(standard) {
    // 获取薪酬项目列表
    let salaryItems = [];
    try {
        const response = await SalaryItemAPI.getList();
        if (response && response.data) {
            salaryItems = response.data;
        }
    } catch (error) {
        console.error('获取薪酬项目列表失败:', error);
        showMessage('获取薪酬项目列表失败', 'error');
        return;
    }
    
    // 构建薪酬项目明细HTML
    const itemsHtml = salaryItems.map(item => {
        // 查找标准中是否已有该项目
        const existingItem = standard.items?.find(i => i.itemId === item.itemId);
        const amount = existingItem ? existingItem.amount : 0;
        const isCalculated = existingItem ? existingItem.isCalculated : (item.calculationRule ? true : false);
        
        return `
            <div class="salary-item-detail" style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 4px;">
                <div class="form-row">
                    <div class="form-group">
                        <label>${item.itemName} ${isCalculated ? '<span style="color: #999;">(自动计算)</span>' : ''}</label>
                        <input type="number" step="0.01" min="0" 
                               data-item-id="${item.itemId}" 
                               data-is-calculated="${isCalculated}"
                               data-calculation-rule="${item.calculationRule || ''}"
                               class="form-control item-amount-input" 
                               value="${amount}"
                               ${isCalculated ? 'readonly style="background-color: #f5f5f5;"' : ''}
                               onchange="updateCalculatedAmount(${item.itemId}, '${item.calculationRule || ''}')">
                    </div>
                </div>
                ${item.calculationRule ? `<p class="calculation-rule" style="margin: 5px 0; color: #666; font-size: 12px;">计算方式: ${item.calculationRule}</p>` : ''}
            </div>
        `;
    }).join('');
    
    const modal = createModal('薪酬标准变更', `
        <form id="updateStandardForm">
            <div class="form-row">
                <div class="form-group">
                    <label>薪酬标准编号</label>
                    <input type="text" id="updateModalStandardCode" class="form-control" value="${standard.standardCode}" readonly>
                </div>
                <div class="form-group">
                    <label>薪酬标准名称 <span class="required">*</span></label>
                    <input type="text" id="updateModalStandardName" class="form-control" value="${standard.standardName}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>适用职位</label>
                    <input type="text" class="form-control" value="${standard.positionName || '-'}" readonly>
                </div>
                <div class="form-group">
                    <label>职称</label>
                    <input type="text" class="form-control" value="${standard.jobTitle === 'JUNIOR' ? '初级' : standard.jobTitle === 'INTERMEDIATE' ? '中级' : '高级'}" readonly>
                </div>
            </div>
            
            <div class="form-section" style="margin-top: 20px;">
                <h4>薪酬项目明细</h4>
                <div id="updateModalItemsDetails" style="max-height: 400px; overflow-y: auto;">
                    ${itemsHtml}
                </div>
            </div>
            
            <div class="form-actions" style="margin-top: 20px; text-align: right;">
                <button type="button" class="btn btn-secondary" onclick="closeUpdateModal()">取消</button>
                <button type="submit" class="btn btn-primary">提交变更</button>
            </div>
        </form>
    `);
    
    // 设置表单提交事件
    const form = document.getElementById('updateStandardForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitUpdateStandard();
    });
}

function updateCalculatedAmount(itemId, calculationRule) {
    if (!calculationRule) return;
    
    const basicSalaryInput = document.querySelector(`#updateModalItemsDetails input[data-item-id="1"]`);
    if (!basicSalaryInput) return;
    
    const basicSalary = parseFloat(basicSalaryInput.value) || 0;
    
    let calculatedAmount = 0;
    if (calculationRule.includes('*')) {
        const parts = calculationRule.split('*');
        const percentage = parseFloat(parts[1].replace('%', '')) / 100;
        calculatedAmount = basicSalary * percentage;
    } else if (calculationRule.includes('+')) {
        const parts = calculationRule.split('+');
        const base = parseFloat(parts[0].replace('基本工资', basicSalary.toString()));
        const add = parseFloat(parts[1]) || 0;
        calculatedAmount = base + add;
    }
    
    const targetInput = document.querySelector(`#updateModalItemsDetails input[data-item-id="${itemId}"]`);
    if (targetInput) {
        targetInput.value = calculatedAmount.toFixed(2);
    }
}

async function submitUpdateStandard() {
    if (!currentUpdateStandardId) {
        showMessage('请先选择要变更的薪酬标准', 'error');
        return;
    }
    
    const standardName = document.getElementById('updateModalStandardName').value.trim();
    if (!standardName) {
        showMessage('请输入薪酬标准名称', 'error');
        return;
    }
    
    // 收集薪酬项目
    const itemInputs = document.querySelectorAll('#updateModalItemsDetails input.item-amount-input');
    const items = Array.from(itemInputs).map(input => {
        const itemId = parseInt(input.dataset.itemId);
        const amount = parseFloat(input.value) || 0;
        const isCalculated = input.dataset.isCalculated === 'true';
        
        return {
            itemId: itemId,
            amount: amount,
            isCalculated: isCalculated
        };
    });
    
    const data = {
        standardName: standardName,
        items: items
    };
    
    try {
        const response = await SalaryStandardAPI.update(currentUpdateStandardId, data);
        if (response && response.code === 200) {
            showMessage('薪酬标准变更成功，等待复核', 'success');
            closeUpdateModal();
            // 刷新查询列表
            await queryStandards();
        } else {
            showMessage(response.message || '变更失败', 'error');
        }
    } catch (error) {
        showMessage('变更失败：' + (error.message || '未知错误'), 'error');
    }
}

function closeUpdateModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    currentUpdateStandardId = null;
}

window.loadSalaryStandardQueryPage = loadSalaryStandardQueryPage;
window.queryStandards = queryStandards;
window.resetSalaryStandardQuery = resetSalaryStandardQuery;
window.changePage = changePage;
window.viewStandard = viewStandard;
window.updateStandard = updateStandard;
window.updateCalculatedAmount = updateCalculatedAmount;
window.closeUpdateModal = closeUpdateModal;
})();

