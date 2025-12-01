// 薪酬发放查询页面

(() => {
let currentPage = 1;
const pageSize = 10;

async function loadSalaryIssuanceQueryPage() {
    try {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="page-header">
                <h2>薪酬发放查询</h2>
            </div>
            <div class="card">
                <div class="search-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>薪酬单号</label>
                            <input type="text" id="querySalarySlipNumber" class="form-control" placeholder="输入薪酬单号">
                        </div>
                        <div class="form-group">
                            <label>关键字</label>
                            <input type="text" id="queryKeyword" class="form-control" placeholder="输入关键字">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>发放起始日期</label>
                            <input type="date" id="queryStartDate" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>发放结束日期</label>
                            <input type="date" id="queryEndDate" class="form-control">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>状态</label>
                            <select id="queryStatus" class="form-control">
                                <option value="">全部</option>
                                <option value="PENDING_REGISTRATION">待登记</option>
                                <option value="PENDING_REVIEW">待复核</option>
                                <option value="EXECUTED">已复核</option>
                                <option value="PAID">已付款</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>三级机构</label>
                            <select id="queryThirdOrgId" class="form-control">
                                <option value="">全部</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-primary" onclick="queryIssuances()">查询</button>
                        <button class="btn btn-secondary" onclick="resetSalaryIssuanceQuery()">重置条件</button>
                    </div>
                </div>
                
                <div class="table-container" style="margin-top: 20px;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>薪酬单号</th>
                                <th>机构名称</th>
                                <th>总人数</th>
                                <th>基本薪酬总额</th>
                                <th>实发薪酬总额</th>
                                <th>发放时间</th>
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
        
        // 确保 DOM 已经渲染完成
        await new Promise(resolve => setTimeout(resolve, 0));
        
        await loadThirdOrgs();
        await queryIssuances();
        
        // 监听薪酬发放单创建事件，自动刷新列表
        window.addEventListener('salaryIssuanceCreated', async () => {
            await queryIssuances();
        });
    } catch (error) {
        console.error('加载薪酬发放查询页面失败:', error);
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

async function loadThirdOrgs() {
    try {
        const response = await OrgAPI.getLevel1List();
        if (response && response.data) {
            const allOrgs = [];
            for (const org1 of response.data) {
                try {
                    const org2Response = await OrgAPI.getLevel2List(org1.orgId);
                    if (org2Response && org2Response.data) {
                        for (const org2 of org2Response.data) {
                            try {
                                const org3Response = await OrgAPI.getLevel3List(org2.orgId);
                                if (org3Response && org3Response.data) {
                                    for (const org3 of org3Response.data) {
                                        allOrgs.push({
                                            orgId: org3.orgId,
                                            orgName: `${org1.orgName}/${org2.orgName}/${org3.orgName}`
                                        });
                                    }
                                }
                            } catch (error) {
                                console.warn(`加载三级机构失败 (org2Id: ${org2.orgId}):`, error);
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`加载二级机构失败 (org1Id: ${org1.orgId}):`, error);
                }
            }
            
            const select = document.getElementById('queryThirdOrgId');
            if (select) {
                select.innerHTML = '<option value="">全部</option>' + 
                    allOrgs.map(org => `<option value="${org.orgId}">${org.orgName}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('加载机构列表失败:', error);
        showMessage('加载机构列表失败，请刷新页面重试', 'error');
    }
}

async function queryIssuances() {
    try {
        // 检查必要的DOM元素是否存在
        const queryList = document.getElementById('queryList');
        if (!queryList) {
            console.warn('queryList元素不存在，页面可能尚未加载完成');
            return;
        }
        
        const params = {};
        
        const salarySlipNumberEl = document.getElementById('querySalarySlipNumber');
        const keywordEl = document.getElementById('queryKeyword');
        const startDateEl = document.getElementById('queryStartDate');
        const endDateEl = document.getElementById('queryEndDate');
        const statusEl = document.getElementById('queryStatus');
        const thirdOrgIdEl = document.getElementById('queryThirdOrgId');
        
        if (salarySlipNumberEl && salarySlipNumberEl.value !== null && salarySlipNumberEl.value !== undefined) {
            const val = String(salarySlipNumberEl.value).trim();
            if (val) params.salarySlipNumber = val;
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
        if (statusEl && statusEl.value !== null && statusEl.value !== undefined && statusEl.value !== '') {
            params.status = statusEl.value;
        }
        if (thirdOrgIdEl && thirdOrgIdEl.value !== null && thirdOrgIdEl.value !== undefined && thirdOrgIdEl.value !== '') {
            params.thirdOrgId = parseInt(thirdOrgIdEl.value);
        }
        
        params.page = currentPage;
        params.size = pageSize;
        
        const response = await SalaryIssuanceAPI.query(params);
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
        console.error('找不到queryList元素');
        return;
    }
    
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(issuance => {
        const statusBadge = issuance.status === 'PENDING_REGISTRATION' ? 
            '<span class="badge badge-secondary">待登记</span>' :
            issuance.status === 'PENDING_REVIEW' ?
            '<span class="badge badge-warning">待复核</span>' :
            issuance.status === 'EXECUTED' ?
            '<span class="badge badge-success">已复核</span>' :
            issuance.status === 'PAID' ?
            '<span class="badge badge-success">已付款</span>' :
            '<span class="badge badge-secondary">' + (issuance.status || '未知') + '</span>';
        
        return `
            <tr style="cursor: pointer;" onclick="viewIssuance(${issuance.issuanceId})" title="点击查看明细">
                <td><a href="#" onclick="event.stopPropagation(); viewIssuance(${issuance.issuanceId}); return false;">${issuance.salarySlipNumber}</a></td>
                <td>${issuance.orgFullPath}</td>
                <td>${issuance.totalEmployees}</td>
                <td>¥${parseFloat(issuance.totalBasicSalary || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>¥${parseFloat(issuance.totalNetPay || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${issuance.issuanceTime ? formatDate(issuance.issuanceTime) : '-'}</td>
                <td>${statusBadge}</td>
                <td onclick="event.stopPropagation();">
                    <button class="btn btn-warning btn-sm" onclick="viewIssuance(${issuance.issuanceId})">查看明细</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPagination(total) {
    const pagination = document.getElementById('pagination');
    if (!pagination) {
        console.warn('找不到pagination元素');
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
    queryIssuances();
}

function resetSalaryIssuanceQuery() {
    console.log('重置薪酬发放查询条件被调用');
    
    try {
        // 检查页面是否已加载
        const queryList = document.getElementById('queryList');
        if (!queryList) {
            console.warn('页面尚未加载完成，无法重置查询条件');
            return;
        }
        
        // 重置薪酬单号
        const salarySlipNumberInput = document.getElementById('querySalarySlipNumber');
        if (salarySlipNumberInput) {
            salarySlipNumberInput.value = '';
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
        
        // 重置状态
        const statusSelect = document.getElementById('queryStatus');
        if (statusSelect) {
            statusSelect.value = '';
        }
        
        // 重置三级机构
        const thirdOrgSelect = document.getElementById('queryThirdOrgId');
        if (thirdOrgSelect) {
            thirdOrgSelect.value = '';
        }
        
        // 重置页码
        currentPage = 1;
        
        // 重新查询
        queryIssuances();
        
        console.log('重置完成');
    } catch (error) {
        console.error('重置查询条件时出错:', error);
        showMessage('重置失败: ' + error.message, 'error');
    }
}

async function viewIssuance(issuanceId) {
    try {
        const response = await SalaryIssuanceAPI.getDetail(issuanceId);
        if (response && response.data) {
            showIssuanceDetailModal(response.data);
        }
    } catch (error) {
        showMessage('获取详情失败', 'error');
    }
}

function showIssuanceDetailModal(issuance) {
    // 计算每个员工的工资构成
    const detailsHtml = issuance.details ? issuance.details.map(detail => {
        // 计算收入项总额
        const totalIncome = parseFloat(detail.totalIncome || 0) || (
            parseFloat(detail.basicSalary || 0) +
            parseFloat(detail.performanceBonus || 0) +
            parseFloat(detail.transportationAllowance || 0) +
            parseFloat(detail.mealAllowance || 0) +
            parseFloat(detail.awardAmount || 0)
        );
        
        // 计算扣除项总额
        const totalDeduction = parseFloat(detail.totalDeduction || 0) || (
            parseFloat(detail.pensionInsurance || 0) +
            parseFloat(detail.medicalInsurance || 0) +
            parseFloat(detail.unemploymentInsurance || 0) +
            parseFloat(detail.housingFund || 0) +
            parseFloat(detail.deductionAmount || 0)
        );
        
        // 实发金额
        const netPay = parseFloat(detail.netPay || 0) || (totalIncome - totalDeduction);
        
        return `
            <tr>
                <td>${detail.employeeNumber || '-'}</td>
                <td>${detail.employeeName}</td>
                <td>${detail.positionName || '-'}</td>
                <td>¥${parseFloat(detail.basicSalary || 0).toFixed(2)}</td>
                <td>¥${parseFloat(detail.performanceBonus || 0).toFixed(2)}</td>
                <td>¥${parseFloat(detail.transportationAllowance || 0).toFixed(2)}</td>
                <td>¥${parseFloat(detail.mealAllowance || 0).toFixed(2)}</td>
                <td>¥${parseFloat(detail.awardAmount || 0).toFixed(2)}</td>
                <td><strong>¥${totalIncome.toFixed(2)}</strong></td>
                <td>¥${parseFloat(detail.pensionInsurance || 0).toFixed(2)}</td>
                <td>¥${parseFloat(detail.medicalInsurance || 0).toFixed(2)}</td>
                <td>¥${parseFloat(detail.unemploymentInsurance || 0).toFixed(2)}</td>
                <td>¥${parseFloat(detail.housingFund || 0).toFixed(2)}</td>
                <td>¥${parseFloat(detail.deductionAmount || 0).toFixed(2)}</td>
                <td><strong>¥${totalDeduction.toFixed(2)}</strong></td>
                <td><strong style="color: #1890ff; font-size: 1.1em;">¥${netPay.toFixed(2)}</strong></td>
            </tr>
        `;
    }).join('') : '';
    
    // 计算总计
    const totals = issuance.details ? issuance.details.reduce((acc, d) => {
        const totalIncome = parseFloat(d.totalIncome || 0) || (
            parseFloat(d.basicSalary || 0) +
            parseFloat(d.performanceBonus || 0) +
            parseFloat(d.transportationAllowance || 0) +
            parseFloat(d.mealAllowance || 0) +
            parseFloat(d.awardAmount || 0)
        );
        const totalDeduction = parseFloat(d.totalDeduction || 0) || (
            parseFloat(d.pensionInsurance || 0) +
            parseFloat(d.medicalInsurance || 0) +
            parseFloat(d.unemploymentInsurance || 0) +
            parseFloat(d.housingFund || 0) +
            parseFloat(d.deductionAmount || 0)
        );
        const netPay = parseFloat(d.netPay || 0) || (totalIncome - totalDeduction);
        
        return {
            basicSalary: acc.basicSalary + parseFloat(d.basicSalary || 0),
            performanceBonus: acc.performanceBonus + parseFloat(d.performanceBonus || 0),
            transportationAllowance: acc.transportationAllowance + parseFloat(d.transportationAllowance || 0),
            mealAllowance: acc.mealAllowance + parseFloat(d.mealAllowance || 0),
            awardAmount: acc.awardAmount + parseFloat(d.awardAmount || 0),
            totalIncome: acc.totalIncome + totalIncome,
            pensionInsurance: acc.pensionInsurance + parseFloat(d.pensionInsurance || 0),
            medicalInsurance: acc.medicalInsurance + parseFloat(d.medicalInsurance || 0),
            unemploymentInsurance: acc.unemploymentInsurance + parseFloat(d.unemploymentInsurance || 0),
            housingFund: acc.housingFund + parseFloat(d.housingFund || 0),
            deductionAmount: acc.deductionAmount + parseFloat(d.deductionAmount || 0),
            totalDeduction: acc.totalDeduction + totalDeduction,
            totalNetPay: acc.totalNetPay + netPay
        };
    }, {
        basicSalary: 0, performanceBonus: 0, transportationAllowance: 0, mealAllowance: 0, awardAmount: 0, totalIncome: 0,
        pensionInsurance: 0, medicalInsurance: 0, unemploymentInsurance: 0, housingFund: 0, deductionAmount: 0, totalDeduction: 0,
        totalNetPay: 0
    }) : {
        basicSalary: 0, performanceBonus: 0, transportationAllowance: 0, mealAllowance: 0, awardAmount: 0, totalIncome: 0,
        pensionInsurance: 0, medicalInsurance: 0, unemploymentInsurance: 0, housingFund: 0, deductionAmount: 0, totalDeduction: 0,
        totalNetPay: 0
    };
    
    const statusText = issuance.status === 'PENDING_REGISTRATION' ? '待登记' :
                       issuance.status === 'PENDING_REVIEW' ? '待复核' :
                       issuance.status === 'EXECUTED' ? '已复核' :
                       issuance.status === 'PAID' ? '已付款' :
                       (issuance.status || '未知');
    
    const modal = createModal('薪酬发放明细', `
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
                    ${issuance.issuanceTime ? `<span><strong>发放时间：</strong>${formatDate(issuance.issuanceTime)}</span>` : ''}
                </div>
            </div>
            
            <div class="info-section">
                <h4>员工薪酬明细</h4>
                <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                    <table class="table table-sm" style="font-size: 12px;">
                        <thead>
                            <tr>
                                <th rowspan="2">员工编号</th>
                                <th rowspan="2">姓名</th>
                                <th rowspan="2">职位</th>
                                <th colspan="5" style="text-align: center; background-color: #e6f7ff;">收入项</th>
                                <th rowspan="2" style="background-color: #e6f7ff;">收入合计</th>
                                <th colspan="5" style="text-align: center; background-color: #fff7e6;">扣除项</th>
                                <th rowspan="2" style="background-color: #fff7e6;">扣除合计</th>
                                <th rowspan="2" style="background-color: #f6ffed;">实发金额</th>
                            </tr>
                            <tr>
                                <th style="background-color: #e6f7ff;">基本工资</th>
                                <th style="background-color: #e6f7ff;">绩效奖金</th>
                                <th style="background-color: #e6f7ff;">交通补贴</th>
                                <th style="background-color: #e6f7ff;">餐费补贴</th>
                                <th style="background-color: #e6f7ff;">奖励金额</th>
                                <th style="background-color: #fff7e6;">养老保险</th>
                                <th style="background-color: #fff7e6;">医疗保险</th>
                                <th style="background-color: #fff7e6;">失业保险</th>
                                <th style="background-color: #fff7e6;">住房公积金</th>
                                <th style="background-color: #fff7e6;">应扣金额</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${detailsHtml}
                            <tr class="total-row" style="background-color: #f5f5f5; font-weight: bold;">
                                <td colspan="3"><strong>总计</strong></td>
                                <td>¥${totals.basicSalary.toFixed(2)}</td>
                                <td>¥${totals.performanceBonus.toFixed(2)}</td>
                                <td>¥${totals.transportationAllowance.toFixed(2)}</td>
                                <td>¥${totals.mealAllowance.toFixed(2)}</td>
                                <td>¥${totals.awardAmount.toFixed(2)}</td>
                                <td style="color: #1890ff;">¥${totals.totalIncome.toFixed(2)}</td>
                                <td>¥${totals.pensionInsurance.toFixed(2)}</td>
                                <td>¥${totals.medicalInsurance.toFixed(2)}</td>
                                <td>¥${totals.unemploymentInsurance.toFixed(2)}</td>
                                <td>¥${totals.housingFund.toFixed(2)}</td>
                                <td>¥${totals.deductionAmount.toFixed(2)}</td>
                                <td style="color: #ff4d4f;">¥${totals.totalDeduction.toFixed(2)}</td>
                                <td style="color: #52c41a; font-size: 1.1em;">¥${totals.totalNetPay.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `);
}

window.loadSalaryIssuanceQueryPage = loadSalaryIssuanceQueryPage;
window.queryIssuances = queryIssuances;
window.resetSalaryIssuanceQuery = resetSalaryIssuanceQuery;
window.changePage = changePage;
window.viewIssuance = viewIssuance;
})();

