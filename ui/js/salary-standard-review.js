// 薪酬标准复核页面

(() => {
let currentPage = 1;
const pageSize = 10;

async function loadSalaryStandardReviewPage() {
    try {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="page-header">
                <h2>薪酬标准复核</h2>
            </div>
            <div class="card">
                <div class="search-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>薪酬标准编号</label>
                            <input type="text" id="queryStandardCode" class="form-control" placeholder="输入薪酬标准编号">
                        </div>
                        <div class="form-group">
                            <label>关键字</label>
                            <input type="text" id="queryKeyword" class="form-control" placeholder="输入关键字">
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
                        <div class="form-row">
                            <div class="form-group">
                                <label>状态</label>
                                <select id="queryStatus" class="form-control">
                                    <option value="">全部</option>
                                    <option value="PENDING_REVIEW" selected>待复核</option>
                                    <option value="APPROVED">已通过</option>
                                </select>
                            </div>
                        <div class="form-group">
                            <label>职位</label>
                            <select id="queryPositionId" class="form-control">
                                <option value="">全部</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>职称</label>
                            <select id="queryJobTitle" class="form-control">
                                <option value="">全部</option>
                                <option value="JUNIOR">初级</option>
                                <option value="INTERMEDIATE">中级</option>
                                <option value="SENIOR">高级</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick="queryReviewStandards()">查询</button>
                        <button class="btn btn-secondary" onclick="resetReviewQuery()">重置条件</button>
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
                        <tbody id="reviewList"></tbody>
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
            const reviewListEl = document.getElementById('reviewList');
            if (reviewListEl) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            retries++;
        }
        
        const reviewListEl = document.getElementById('reviewList');
        if (!reviewListEl) {
            console.error('DOM 元素 reviewList 未找到，页面可能加载失败');
            showMessage('页面加载失败，请刷新页面重试', 'error');
            return;
        }
        
        await loadPositions();
        await queryReviewStandards();
    } catch (error) {
        console.error('加载薪酬标准复核页面失败:', error);
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

async function loadPositions() {
    try {
        const response = await PositionAPI.getList();
        if (response && response.data) {
            const positionSelect = document.getElementById('queryPositionId');
            if (positionSelect) {
                positionSelect.innerHTML = '<option value="">全部</option>' + 
                    response.data.map(pos => `<option value="${pos.positionId}">${pos.positionName}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('加载职位列表失败:', error);
    }
}

async function queryReviewStandards() {
    try {
        const params = {};
        
        const standardCodeEl = document.getElementById('queryStandardCode');
        const keywordEl = document.getElementById('queryKeyword');
        const startDateEl = document.getElementById('queryStartDate');
        const endDateEl = document.getElementById('queryEndDate');
        const statusEl = document.getElementById('queryStatus');
        const positionIdEl = document.getElementById('queryPositionId');
        const jobTitleEl = document.getElementById('queryJobTitle');
        
        if (standardCodeEl && standardCodeEl.value !== null && standardCodeEl.value !== undefined) {
            const val = String(standardCodeEl.value).trim();
            if (val) params.standardCode = val;
        }
        if (keywordEl && keywordEl.value !== null && keywordEl.value !== undefined) {
            const val = String(keywordEl.value).trim();
            if (val) params.keyword = val;
        }
        if (startDateEl && startDateEl.value !== null && startDateEl.value !== undefined && startDateEl.value !== '') {
            params.startDate = startDateEl.value;
        }
        if (endDateEl && endDateEl.value !== null && endDateEl.value !== undefined && endDateEl.value !== '') {
            params.endDate = endDateEl.value;
        }
        // 状态查询：如果用户选择了"全部"（空值），则默认查询待复核；如果选择了具体状态，则使用选择的状态
        if (statusEl && statusEl.value !== null && statusEl.value !== undefined && statusEl.value !== '') {
            params.status = statusEl.value;
        } else {
            // 默认只查询待复核的薪酬标准
            params.status = 'PENDING_REVIEW';
        }
        if (positionIdEl && positionIdEl.value !== null && positionIdEl.value !== undefined && positionIdEl.value !== '') {
            params.positionId = parseInt(positionIdEl.value);
        }
        if (jobTitleEl && jobTitleEl.value !== null && jobTitleEl.value !== undefined && jobTitleEl.value !== '') {
            params.jobTitle = jobTitleEl.value;
        }
        
        params.page = currentPage;
        params.size = pageSize;
        
        const response = await SalaryStandardAPI.query(params);
        if (response && response.data) {
            renderReviewList(response.data.list || []);
            renderPagination(response.data.total || 0);
        } else {
            renderReviewList([]);
            renderPagination(0);
        }
    } catch (error) {
        console.error('查询失败:', error);
        showMessage('查询失败：' + (error.message || '未知错误'), 'error');
        const tbody = document.getElementById('reviewList');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #ff4d4f; padding: 20px;">查询失败，请刷新页面重试</td></tr>';
        }
    }
}

function resetReviewQuery() {
    try {
        const standardCodeInput = document.getElementById('queryStandardCode');
        if (standardCodeInput) standardCodeInput.value = '';
        
        const keywordInput = document.getElementById('queryKeyword');
        if (keywordInput) keywordInput.value = '';
        
        const startDateInput = document.getElementById('queryStartDate');
        if (startDateInput) startDateInput.value = '';
        
        const endDateInput = document.getElementById('queryEndDate');
        if (endDateInput) endDateInput.value = '';
        
        const statusSelect = document.getElementById('queryStatus');
        if (statusSelect) statusSelect.value = 'PENDING_REVIEW'; // 重置为待复核
        
        const positionSelect = document.getElementById('queryPositionId');
        if (positionSelect) positionSelect.value = '';
        
        const jobTitleSelect = document.getElementById('queryJobTitle');
        if (jobTitleSelect) jobTitleSelect.value = '';
        
        currentPage = 1;
        queryReviewStandards();
    } catch (error) {
        console.error('重置查询条件时出错:', error);
        showMessage('重置失败: ' + error.message, 'error');
    }
}

function renderReviewList(list) {
    const tbody = document.getElementById('reviewList');
    if (!tbody) {
        console.error('找不到 reviewList 元素');
        return;
    }
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(standard => {
        const statusBadge = standard.status === 'PENDING_REVIEW' ? 
            '<span class="badge badge-warning">待复核</span>' :
            '<span class="badge badge-success">已通过</span>';
        
        const jobTitleText = standard.jobTitle === 'JUNIOR' ? '初级' : 
                            standard.jobTitle === 'INTERMEDIATE' ? '中级' : '高级';
        
        // 只有待复核状态才显示复核按钮
        const actionButton = standard.status === 'PENDING_REVIEW' ?
            `<button class="btn btn-primary btn-sm" onclick="reviewStandard(${standard.standardId})">复核</button>` :
            `<button class="btn btn-warning btn-sm" onclick="viewReviewStandard(${standard.standardId})">查看</button>`;
        
        return `
            <tr>
                <td>${standard.standardCode}</td>
                <td>${standard.standardName}</td>
                <td>${standard.positionName || '-'}</td>
                <td>${jobTitleText}</td>
                <td>${standard.formulatorName || '-'}</td>
                <td>${formatDateTime(standard.registrationTime)}</td>
                <td>${statusBadge}</td>
                <td>${actionButton}</td>
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
    html += `<button class="btn btn-sm" onclick="changeReviewPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
    html += `<span>第 ${currentPage} 页，共 ${totalPages} 页</span>`;
    html += `<button class="btn btn-sm" onclick="changeReviewPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
    html += '</div>';
    
    pagination.innerHTML = html;
}

function changeReviewPage(page) {
    if (page < 1) return;
    currentPage = page;
    queryReviewStandards();
}

async function reviewStandard(standardId) {
    try {
        const response = await SalaryStandardAPI.getDetail(standardId);
        if (response && response.data) {
            showReviewModal(response.data);
        }
    } catch (error) {
        showMessage('获取薪酬标准详情失败', 'error');
    }
}

function showReviewModal(standard) {
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
    
    const modal = createModal('薪酬标准复核', `
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
                    <span><strong>登记时间：</strong>${formatDateTime(standard.registrationTime)}</span>
                </div>
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
            
            <div class="form-group">
                <label>复核意见 <span class="required">*</span></label>
                <textarea id="reviewComments" class="form-control" rows="8" placeholder="请输入复核意见（支持大段文本）" style="resize: vertical; min-height: 150px;"></textarea>
            </div>
            
            <div class="form-actions">
                <button class="btn btn-danger" onclick="rejectStandard(${standard.standardId})">驳回</button>
                <button class="btn btn-success" onclick="approveStandard(${standard.standardId})">通过</button>
            </div>
        </div>
    `);
}

async function approveStandard(standardId) {
    const reviewComments = document.getElementById('reviewComments').value.trim();
    if (!reviewComments) {
        showMessage('请输入复核意见', 'error');
        return;
    }
    
    try {
        const response = await SalaryStandardAPI.approve(standardId, reviewComments);
        if (response && response.code === 200) {
            showMessage('复核通过', 'success');
            document.querySelector('.modal').remove();
            queryReviewStandards();
        } else {
            showMessage(response.message || '复核失败', 'error');
        }
    } catch (error) {
        showMessage('复核失败：' + (error.message || '未知错误'), 'error');
    }
}

async function rejectStandard(standardId) {
    const reviewComments = document.getElementById('reviewComments').value.trim();
    if (!reviewComments) {
        showMessage('请输入复核意见', 'error');
        return;
    }
    
    if (!confirm('确定要驳回该薪酬标准吗？')) {
        return;
    }
    
    try {
        const response = await SalaryStandardAPI.reject(standardId, reviewComments);
        if (response && response.code === 200) {
            showMessage('复核不通过，已退回待复核', 'success');
            document.querySelector('.modal').remove();
            queryReviewStandards();
        } else {
            showMessage(response.message || '驳回失败', 'error');
        }
    } catch (error) {
        showMessage('驳回失败：' + (error.message || '未知错误'), 'error');
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
    
    const statusText = standard.status === 'PENDING_REVIEW' ? '待复核' : '已通过';
    
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

window.loadSalaryStandardReviewPage = loadSalaryStandardReviewPage;
window.changeReviewPage = changeReviewPage;
window.reviewStandard = reviewStandard;
window.approveStandard = approveStandard;
window.rejectStandard = rejectStandard;
window.queryReviewStandards = queryReviewStandards;
window.resetReviewQuery = resetReviewQuery;
window.viewReviewStandard = viewStandard;
})();

