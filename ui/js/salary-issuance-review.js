// 薪酬发放复核页面

(() => {
let currentPage = 1;
const pageSize = 10;

async function loadSalaryIssuanceReviewPage() {
    try {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="page-header">
                <h2>薪酬发放复核</h2>
            </div>
            <div class="card">
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>薪酬单号</th>
                                <th>机构名称</th>
                                <th>总人数</th>
                                <th>基本薪酬总额</th>
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
        
        await loadReviewList();
    } catch (error) {
        console.error('加载薪酬发放复核页面失败:', error);
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

async function loadReviewList() {
    try {
        // 查询待复核和已复核的记录
        const response = await SalaryIssuanceAPI.query({
            status: 'PENDING_REVIEW,EXECUTED', // 查询待复核和已复核的记录
            page: currentPage,
            size: pageSize
        });
        
        if (response && response.data) {
            renderReviewList(response.data.list || []);
            renderPagination(response.data.total || 0);
        } else {
            renderReviewList([]);
            renderPagination(0);
        }
    } catch (error) {
        console.error('加载复核列表失败:', error);
        showMessage('加载复核列表失败：' + (error.message || '未知错误'), 'error');
        const tbody = document.getElementById('reviewList');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ff4d4f; padding: 20px;">加载失败，请刷新页面重试</td></tr>';
        }
    }
}

function renderReviewList(list) {
    const tbody = document.getElementById('reviewList');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">暂无薪酬发放单</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(issuance => {
        const isPendingReview = issuance.status === 'PENDING_REVIEW';
        const statusBadge = isPendingReview 
            ? '<span class="badge badge-warning">待复核</span>'
            : '<span class="badge badge-success">已复核</span>';
        const actionButton = isPendingReview
            ? `<button class="btn btn-primary btn-sm" onclick="reviewIssuance(${issuance.issuanceId})">复核</button>`
            : `<button class="btn btn-warning btn-sm" onclick="viewIssuance(${issuance.issuanceId})">查看</button>`;
        
        return `
        <tr>
            <td><a href="#" onclick="${isPendingReview ? `reviewIssuance(${issuance.issuanceId})` : `viewIssuance(${issuance.issuanceId})`}; return false;">${issuance.salarySlipNumber}</a></td>
            <td>${issuance.orgFullPath}</td>
            <td>${issuance.totalEmployees}</td>
            <td>¥${parseFloat(issuance.totalBasicSalary || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${formatDateTime(issuance.registrationTime)}</td>
            <td>${statusBadge}</td>
            <td>${actionButton}</td>
        </tr>
        `;
    }).join('');
}

function renderPagination(total) {
    const pagination = document.getElementById('pagination');
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
    loadReviewList();
}

async function reviewIssuance(issuanceId) {
    try {
        const response = await SalaryIssuanceAPI.getDetail(issuanceId);
        if (response && response.data) {
            showReviewModal(response.data);
        }
    } catch (error) {
        showMessage('获取薪酬发放单详情失败', 'error');
    }
}

function showReviewModal(issuance) {
    const detailsHtml = issuance.details ? issuance.details.map((detail, index) => `
        <tr>
            <td>${detail.employeeNumber || '-'}</td>
            <td>${detail.employeeName}</td>
            <td>${detail.positionName || '-'}</td>
            <td>¥${parseFloat(detail.basicSalary || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.performanceBonus || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.transportationAllowance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.mealAllowance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.pensionInsurance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.medicalInsurance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.unemploymentInsurance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.housingFund || 0).toFixed(2)}</td>
            <td><input type="number" step="0.01" min="0" class="form-control form-control-sm" 
                       data-detail-id="${detail.detailId}" data-field="awardAmount" 
                       value="${detail.awardAmount || 0}" onchange="updateIssuanceNetPay(${index})"></td>
            <td><input type="number" step="0.01" min="0" class="form-control form-control-sm" 
                       data-detail-id="${detail.detailId}" data-field="deductionAmount" 
                       value="${detail.deductionAmount || 0}" onchange="updateIssuanceNetPay(${index})"></td>
            <td class="net-pay" data-index="${index}">¥${parseFloat(detail.netPay || 0).toFixed(2)}</td>
        </tr>
    `).join('') : '';
    
    const totalBasicSalary = issuance.details ? issuance.details.reduce((sum, d) => sum + parseFloat(d.basicSalary || 0), 0) : 0;
    const totalNetPay = issuance.details ? issuance.details.reduce((sum, d) => sum + parseFloat(d.netPay || 0), 0) : 0;
    
    const modal = createModal('薪酬发放复核', `
        <div class="issuance-detail">
            <div class="info-section">
                <h4>基本信息</h4>
                <div class="info-row">
                    <span><strong>薪酬单号：</strong>${issuance.salarySlipNumber}</span>
                    <span><strong>机构名称：</strong>${issuance.orgFullPath}</span>
                </div>
                <div class="info-row">
                    <span><strong>发放月份：</strong>${issuance.issuanceMonth}</span>
                    <span><strong>总人数：</strong>${issuance.totalEmployees}</span>
                </div>
                <div class="info-row">
                    <span><strong>登记人：</strong>${issuance.registrarName || '-'}</span>
                    <span><strong>登记时间：</strong>${formatDateTime(issuance.registrationTime)}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h4>员工薪酬明细</h4>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>员工编号</th>
                                <th>姓名</th>
                                <th>职位</th>
                                <th>基本工资</th>
                                <th>绩效奖金</th>
                                <th>交通补贴</th>
                                <th>餐费补贴</th>
                                <th>养老保险</th>
                                <th>医疗保险</th>
                                <th>失业保险</th>
                                <th>住房公积金</th>
                                <th>奖励金额</th>
                                <th>应扣金额</th>
                                <th>实发金额</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${detailsHtml}
                            <tr class="total-row">
                                <td colspan="3"><strong>总计</strong></td>
                                <td><strong>¥${totalBasicSalary.toFixed(2)}</strong></td>
                                <td colspan="6"></td>
                                <td colspan="2"></td>
                                <td><strong>¥${totalNetPay.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="form-actions" style="margin-top: 20px; text-align: right;">
                <button class="btn btn-success" onclick="approveIssuance(${issuance.issuanceId})">复核通过</button>
            </div>
        </div>
    `);
    
    window.currentIssuanceDetails = issuance.details || [];
    window.currentIssuanceId = issuance.issuanceId;
}

function updateIssuanceNetPay(index) {
    const detail = window.currentIssuanceDetails[index];
    const awardInput = document.querySelector(`input[data-detail-id="${detail.detailId}"][data-field="awardAmount"]`);
    const deductionInput = document.querySelector(`input[data-detail-id="${detail.detailId}"][data-field="deductionAmount"]`);
    
    if (awardInput) detail.awardAmount = parseFloat(awardInput.value) || 0;
    if (deductionInput) detail.deductionAmount = parseFloat(deductionInput.value) || 0;
    
    const totalIncome = parseFloat(detail.totalIncome || 0);
    const totalDeduction = parseFloat(detail.totalDeduction || 0);
    detail.netPay = totalIncome + detail.awardAmount - totalDeduction - detail.deductionAmount;
    
    const netPayCell = document.querySelector(`.net-pay[data-index="${index}"]`);
    if (netPayCell) {
        netPayCell.textContent = `¥${detail.netPay.toFixed(2)}`;
    }
}

async function approveIssuance(issuanceId) {
    const details = window.currentIssuanceDetails.map(d => ({
        detailId: d.detailId,
        awardAmount: d.awardAmount || 0,
        deductionAmount: d.deductionAmount || 0
    }));
    
    try {
        const response = await SalaryIssuanceAPI.approve(issuanceId, { details });
        if (response && response.code === 200) {
            showMessage('复核通过', 'success');
            document.querySelector('.modal').remove();
            loadReviewList();
        } else {
            showMessage(response.message || '复核失败', 'error');
        }
    } catch (error) {
        showMessage('复核失败：' + (error.message || '未知错误'), 'error');
    }
}

async function viewIssuance(issuanceId) {
    try {
        const response = await SalaryIssuanceAPI.getDetail(issuanceId);
        if (response && response.data) {
            showIssuanceDetailModal(response.data);
        }
    } catch (error) {
        showMessage('获取薪酬发放单详情失败', 'error');
    }
}

function showIssuanceDetailModal(issuance) {
    const detailsHtml = issuance.details ? issuance.details.map(detail => `
        <tr>
            <td>${detail.employeeNumber || '-'}</td>
            <td>${detail.employeeName}</td>
            <td>${detail.positionName || '-'}</td>
            <td>¥${parseFloat(detail.basicSalary || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.performanceBonus || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.transportationAllowance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.mealAllowance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.pensionInsurance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.medicalInsurance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.unemploymentInsurance || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.housingFund || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.awardAmount || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.deductionAmount || 0).toFixed(2)}</td>
            <td>¥${parseFloat(detail.netPay || 0).toFixed(2)}</td>
        </tr>
    `).join('') : '';
    
    const totalBasicSalary = issuance.details ? issuance.details.reduce((sum, d) => sum + parseFloat(d.basicSalary || 0), 0) : 0;
    const totalNetPay = issuance.details ? issuance.details.reduce((sum, d) => sum + parseFloat(d.netPay || 0), 0) : 0;
    
    const statusText = issuance.status === 'PENDING_REVIEW' ? '待复核' :
                       issuance.status === 'EXECUTED' ? '已复核' :
                       issuance.status === 'PAID' ? '已付款' :
                       (issuance.status || '未知');
    
    const modal = createModal('薪酬发放单详情', `
        <div class="issuance-detail">
            <div class="info-section">
                <h4>基本信息</h4>
                <div class="info-row">
                    <span><strong>薪酬单号：</strong>${issuance.salarySlipNumber}</span>
                    <span><strong>机构名称：</strong>${issuance.orgFullPath}</span>
                </div>
                <div class="info-row">
                    <span><strong>发放月份：</strong>${issuance.issuanceMonth}</span>
                    <span><strong>总人数：</strong>${issuance.totalEmployees}</span>
                </div>
                <div class="info-row">
                    <span><strong>登记人：</strong>${issuance.registrarName || '-'}</span>
                    <span><strong>登记时间：</strong>${formatDateTime(issuance.registrationTime)}</span>
                </div>
                <div class="info-row">
                    <span><strong>状态：</strong>${statusText}</span>
                    ${issuance.reviewTime ? `<span><strong>复核时间：</strong>${formatDateTime(issuance.reviewTime)}</span>` : ''}
                </div>
            </div>
            
            <div class="info-section">
                <h4>员工薪酬明细</h4>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>员工编号</th>
                                <th>姓名</th>
                                <th>职位</th>
                                <th>基本工资</th>
                                <th>绩效奖金</th>
                                <th>交通补贴</th>
                                <th>餐费补贴</th>
                                <th>养老保险</th>
                                <th>医疗保险</th>
                                <th>失业保险</th>
                                <th>住房公积金</th>
                                <th>奖励金额</th>
                                <th>应扣金额</th>
                                <th>实发金额</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${detailsHtml}
                            <tr class="total-row">
                                <td colspan="3"><strong>总计</strong></td>
                                <td><strong>¥${totalBasicSalary.toFixed(2)}</strong></td>
                                <td colspan="6"></td>
                                <td colspan="2"></td>
                                <td><strong>¥${totalNetPay.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `);
}

window.loadSalaryIssuanceReviewPage = loadSalaryIssuanceReviewPage;
window.changePage = changePage;
window.reviewIssuance = reviewIssuance;
window.updateIssuanceNetPay = updateIssuanceNetPay;
window.approveIssuance = approveIssuance;
window.viewIssuance = viewIssuance;
})();

