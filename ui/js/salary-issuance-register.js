// 薪酬发放登记页面

(() => {
let currentPage = 1;
const pageSize = 10;

async function loadSalaryIssuanceRegisterPage() {
    try {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="page-header">
                <h2>薪酬发放登记</h2>
            </div>
            <div class="card">
                <div class="search-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>发放月份</label>
                            <input type="month" id="issuanceMonth" class="form-control" value="${getCurrentMonth()}">
                        </div>
                        <div class="form-group">
                            <label>三级机构</label>
                            <select id="thirdOrgId" class="form-control">
                                <option value="">全部</option>
                            </select>
                        </div>
                        <div class="form-actions" style="margin-top: 25px;">
                            <button class="btn btn-primary" onclick="loadPendingList()">查询</button>
                        </div>
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
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="pendingList"></tbody>
                    </table>
                </div>
            </div>
        `;
        
        // 确保 DOM 已经渲染完成
        await new Promise(resolve => setTimeout(resolve, 0));
        
        await loadThirdOrgs();
        await loadPendingList();
    } catch (error) {
        console.error('加载薪酬发放登记页面失败:', error);
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

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function loadThirdOrgs() {
    try {
        const response = await OrgAPI.getLevel1List();
        if (response && response.data) {
            // 加载所有三级机构
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
            
            const select = document.getElementById('thirdOrgId');
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

async function loadPendingList() {
    try {
        const params = {};
        const issuanceMonthEl = document.getElementById('issuanceMonth');
        const thirdOrgIdEl = document.getElementById('thirdOrgId');
        
        if (issuanceMonthEl && issuanceMonthEl.value !== null && issuanceMonthEl.value !== undefined && issuanceMonthEl.value !== '') {
            params.issuanceMonth = issuanceMonthEl.value;
        }
        if (thirdOrgIdEl && thirdOrgIdEl.value !== null && thirdOrgIdEl.value !== undefined && thirdOrgIdEl.value !== '') {
            params.thirdOrgId = parseInt(thirdOrgIdEl.value);
        }
        
        // 获取待登记和已提交的列表（合并显示）
        const [pendingResponse, submittedResponse] = await Promise.all([
            SalaryIssuanceAPI.getPendingRegistration(params),
            SalaryIssuanceAPI.query({ 
                ...params, 
                status: 'PENDING_REVIEW',
                size: 1000 
            })
        ]);
        
        // 合并数据：待登记的 + 已提交的
        const pendingList = pendingResponse?.data || [];
        const submittedList = submittedResponse?.data?.list || [];
        
        // 将已提交的记录转换为与待登记相同的格式
        const allList = [
            ...pendingList.map(item => ({
                ...item,
                status: 'PENDING_REGISTRATION',
                issuanceId: null
            })),
            ...submittedList.map(item => ({
                thirdOrgId: item.thirdOrgId,
                thirdOrgName: item.thirdOrgName,
                orgFullPath: item.orgFullPath || `${item.firstOrgName || ''}/${item.secondOrgName || ''}/${item.thirdOrgName || ''}`,
                totalEmployees: item.totalEmployees,
                totalBasicSalary: item.totalBasicSalary,
                totalNetPay: item.totalNetPay,
                salarySlipNumber: item.salarySlipNumber,
                issuanceId: item.issuanceId,
                status: 'PENDING_REVIEW',
                registrationTime: item.registrationTime
            }))
        ];
        
        // 去重：如果同一个机构在已提交列表中存在，则移除待登记列表中的对应项
        const uniqueList = [];
        const submittedOrgIds = new Set(submittedList.map(s => s.thirdOrgId));
        
        for (const item of allList) {
            if (item.status === 'PENDING_REGISTRATION' && submittedOrgIds.has(item.thirdOrgId)) {
                // 如果已提交，跳过待登记项
                continue;
            }
            uniqueList.push(item);
        }
        
        renderPendingList(uniqueList);
    } catch (error) {
        console.error('加载列表失败:', error);
        showMessage('加载列表失败：' + (error.message || '未知错误'), 'error');
        const tbody = document.getElementById('pendingList');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ff4d4f; padding: 20px;">加载失败，请刷新页面重试</td></tr>';
        }
    }
}

function renderPendingList(list) {
    const tbody = document.getElementById('pendingList');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(item => {
        // 根据是否有issuanceId判断：有issuanceId表示已提交，显示"查看"；否则显示"登记"
        const actionButton = item.issuanceId ?
            `<button class="btn btn-warning btn-sm" onclick="viewIssuance(${item.issuanceId})">查看</button>` :
            `<button class="btn btn-primary btn-sm" onclick="registerIssuance(${item.thirdOrgId}, '${item.orgFullPath}')">登记</button>`;
        
        return `
            <tr>
                <td>${item.salarySlipNumber || '-'}</td>
                <td>${item.orgFullPath}</td>
                <td>${item.totalEmployees}</td>
                <td>¥${parseFloat(item.totalBasicSalary || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>¥${parseFloat(item.totalNetPay || item.totalBasicSalary || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    }).join('');
}

async function registerIssuance(thirdOrgId, orgFullPath) {
    const issuanceMonth = document.getElementById('issuanceMonth').value;
    if (!issuanceMonth) {
        showMessage('请选择发放月份', 'error');
        return;
    }
    
    // 获取该机构下的所有员工
    try {
        const archiveResponse = await EmployeeArchiveAPI.query({
            thirdOrgId: thirdOrgId,
            status: 'NORMAL'
        });
        
        if (!archiveResponse || !archiveResponse.data || archiveResponse.data.list.length === 0) {
            showMessage('该机构下没有正常状态的员工', 'error');
            return;
        }
        
        const employees = archiveResponse.data.list;
        showRegisterDetailModal(thirdOrgId, orgFullPath, issuanceMonth, employees);
    } catch (error) {
        showMessage('获取员工列表失败', 'error');
    }
}

function showRegisterDetailModal(thirdOrgId, orgFullPath, issuanceMonth, employees) {
    // 为每个员工计算薪酬明细
    const details = employees.map(employee => {
        // 这里应该根据员工的薪酬标准计算，暂时使用默认值
        return {
            employeeId: employee.archiveId,
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
            awardAmount: 0,
            deductionAmount: 0,
            totalIncome: 12800,
            totalDeduction: 1853,
            netPay: 10947
        };
    });
    
    const detailsHtml = details.map((detail, index) => `
        <tr>
            <td>${detail.employeeNumber}</td>
            <td>${detail.employeeName}</td>
            <td>${detail.positionName}</td>
            <td>¥${detail.basicSalary.toFixed(2)}</td>
            <td>¥${detail.performanceBonus.toFixed(2)}</td>
            <td>¥${detail.transportationAllowance.toFixed(2)}</td>
            <td>¥${detail.mealAllowance.toFixed(2)}</td>
            <td>¥${detail.pensionInsurance.toFixed(2)}</td>
            <td>¥${detail.medicalInsurance.toFixed(2)}</td>
            <td>¥${detail.unemploymentInsurance.toFixed(2)}</td>
            <td>¥${detail.housingFund.toFixed(2)}</td>
            <td><input type="number" step="0.01" min="0" class="form-control form-control-sm" 
                       data-employee-id="${detail.employeeId}" data-field="awardAmount" 
                       value="${detail.awardAmount}" onchange="updateNetPay(${index})"></td>
            <td><input type="number" step="0.01" min="0" class="form-control form-control-sm" 
                       data-employee-id="${detail.employeeId}" data-field="deductionAmount" 
                       value="${detail.deductionAmount}" onchange="updateNetPay(${index})"></td>
            <td class="net-pay" data-index="${index}">¥${detail.netPay.toFixed(2)}</td>
        </tr>
    `).join('');
    
    const totalBasicSalary = details.reduce((sum, d) => sum + d.basicSalary, 0);
    const totalNetPay = details.reduce((sum, d) => sum + d.netPay, 0);
    
    const modal = createModal('薪酬发放登记', `
        <div class="issuance-detail">
            <div class="info-section">
                <p><strong>机构名称：</strong>${orgFullPath}</p>
                <p><strong>发放月份：</strong>${issuanceMonth}</p>
                <p><strong>总人数：</strong>${employees.length}</p>
            </div>
            
            <div class="table-container" style="max-height: 500px; overflow-y: auto;">
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
            
            <div class="form-actions" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="document.querySelector('.modal').remove()">返回列表</button>
                <button class="btn btn-success" onclick="submitIssuance(${thirdOrgId}, '${issuanceMonth}', ${JSON.stringify(details).replace(/"/g, '&quot;')})">提交薪酬发放登记</button>
            </div>
        </div>
    `);
    
    window.currentIssuanceDetails = details;
}

function updateNetPay(index) {
    const detail = window.currentIssuanceDetails[index];
    const awardInput = document.querySelector(`input[data-employee-id="${detail.employeeId}"][data-field="awardAmount"]`);
    const deductionInput = document.querySelector(`input[data-employee-id="${detail.employeeId}"][data-field="deductionAmount"]`);
    
    if (awardInput) detail.awardAmount = parseFloat(awardInput.value) || 0;
    if (deductionInput) detail.deductionAmount = parseFloat(deductionInput.value) || 0;
    
    detail.netPay = detail.totalIncome + detail.awardAmount - detail.totalDeduction - detail.deductionAmount;
    
    const netPayCell = document.querySelector(`.net-pay[data-index="${index}"]`);
    if (netPayCell) {
        netPayCell.textContent = `¥${detail.netPay.toFixed(2)}`;
    }
}

async function submitIssuance(thirdOrgId, issuanceMonth, detailsJson) {
    const details = typeof detailsJson === 'string' ? JSON.parse(detailsJson.replace(/&quot;/g, '"')) : detailsJson;
    
    const data = {
        thirdOrgId: thirdOrgId,
        issuanceMonth: issuanceMonth,
        details: details.map(d => ({
            employeeId: d.employeeId,
            awardAmount: d.awardAmount || 0,
            deductionAmount: d.deductionAmount || 0
        }))
    };
    
    try {
        const response = await SalaryIssuanceAPI.create(data);
        if (response && response.code === 200) {
            showMessage('薪酬发放登记成功', 'success');
            document.querySelector('.modal').remove();
            // 刷新列表，显示已提交状态
            await loadPendingList();
            // 触发自定义事件，通知其他页面刷新（如果已打开）
            window.dispatchEvent(new CustomEvent('salaryIssuanceCreated', { 
                detail: { issuanceId: response.data.issuanceId } 
            }));
        } else {
            showMessage(response.message || '登记失败', 'error');
        }
    } catch (error) {
        showMessage('登记失败：' + (error.message || '未知错误'), 'error');
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
            netPay: acc.netPay + netPay
        };
    }, {
        basicSalary: 0, performanceBonus: 0, transportationAllowance: 0, mealAllowance: 0,
        awardAmount: 0, totalIncome: 0,
        pensionInsurance: 0, medicalInsurance: 0, unemploymentInsurance: 0,
        housingFund: 0, deductionAmount: 0, totalDeduction: 0, netPay: 0
    }) : {
        basicSalary: 0, performanceBonus: 0, transportationAllowance: 0, mealAllowance: 0,
        awardAmount: 0, totalIncome: 0,
        pensionInsurance: 0, medicalInsurance: 0, unemploymentInsurance: 0,
        housingFund: 0, deductionAmount: 0, totalDeduction: 0, netPay: 0
    };
    
    const statusText = issuance.status === 'PENDING_REVIEW' ? '待复核' :
                       issuance.status === 'EXECUTED' ? '已复核' :
                       issuance.status === 'PAID' ? '已付款' : '待登记';
    
    const modal = createModal('薪酬发放单详情', `
        <div class="issuance-detail">
            <div class="info-section">
                <h4>基本信息</h4>
                <div class="info-row">
                    <span><strong>薪酬单号：</strong>${issuance.salarySlipNumber || '-'}</span>
                    <span><strong>机构名称：</strong>${issuance.orgFullPath || issuance.thirdOrgName || '-'}</span>
                </div>
                <div class="info-row">
                    <span><strong>发放月份：</strong>${formatDateTime(issuance.issuanceMonth)}</span>
                    <span><strong>状态：</strong>${statusText}</span>
                </div>
                <div class="info-row">
                    <span><strong>总人数：</strong>${issuance.totalEmployees || 0}</span>
                    <span><strong>基本薪酬总额：</strong>¥${parseFloat(issuance.totalBasicSalary || 0).toFixed(2)}</span>
                </div>
                <div class="info-row">
                    <span><strong>实发薪酬总额：</strong>¥${parseFloat(issuance.totalNetPay || 0).toFixed(2)}</span>
                    ${issuance.registrationTime ? `<span><strong>登记时间：</strong>${formatDateTime(issuance.registrationTime)}</span>` : ''}
                </div>
            </div>
            
            <div class="info-section">
                <h4>员工明细</h4>
                <div class="table-container" style="max-height: 500px; overflow-y: auto;">
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
                                <th>奖励金额</th>
                                <th>总收入</th>
                                <th>养老保险</th>
                                <th>医疗保险</th>
                                <th>失业保险</th>
                                <th>住房公积金</th>
                                <th>应扣金额</th>
                                <th>总扣除</th>
                                <th>实发金额</th>
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
                                <td><strong>¥${totals.totalIncome.toFixed(2)}</strong></td>
                                <td>¥${totals.pensionInsurance.toFixed(2)}</td>
                                <td>¥${totals.medicalInsurance.toFixed(2)}</td>
                                <td>¥${totals.unemploymentInsurance.toFixed(2)}</td>
                                <td>¥${totals.housingFund.toFixed(2)}</td>
                                <td>¥${totals.deductionAmount.toFixed(2)}</td>
                                <td><strong>¥${totals.totalDeduction.toFixed(2)}</strong></td>
                                <td><strong style="color: #1890ff; font-size: 1.1em;">¥${totals.netPay.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `);
}

window.loadSalaryIssuanceRegisterPage = loadSalaryIssuanceRegisterPage;
window.loadPendingList = loadPendingList;
window.registerIssuance = registerIssuance;
window.updateNetPay = updateNetPay;
window.submitIssuance = submitIssuance;
window.viewIssuance = viewIssuance;
})();

