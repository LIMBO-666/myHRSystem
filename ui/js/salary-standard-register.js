// 薪酬标准登记页面

async function loadSalaryStandardRegisterPage() {
    try {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="page-header">
                <h2>薪酬标准登记</h2>
            </div>
            <div class="card">
                <form id="standardForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>薪酬标准编号 <span class="required">*</span></label>
                            <input type="text" id="standardCode" class="form-control" placeholder="系统自动生成" readonly>
                        </div>
                        <div class="form-group">
                            <label>薪酬标准名称 <span class="required">*</span></label>
                            <input type="text" id="standardName" class="form-control" placeholder="如：前端工程师-中级标准" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>制定人 <span class="required">*</span></label>
                            <input type="text" id="formulatorName" class="form-control" placeholder="当前用户" readonly>
                        </div>
                        <div class="form-group">
                            <label>登记人 <span class="required">*</span></label>
                            <input type="text" id="registrarName" class="form-control" placeholder="当前用户" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>适用职位 <span class="required">*</span></label>
                            <select id="positionId" class="form-control" required onchange="onPositionChange()">
                                <option value="">请选择职位</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>职称 <span class="required">*</span></label>
                            <select id="jobTitle" class="form-control" required onchange="onJobTitleChange()">
                                <option value="">请选择职称</option>
                                <option value="JUNIOR">初级</option>
                                <option value="INTERMEDIATE">中级</option>
                                <option value="SENIOR">高级</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>登记时间</label>
                            <input type="text" id="registrationTime" class="form-control" readonly>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>选择薪酬项目</h3>
                        <div id="salaryItemsCheckboxes" class="checkbox-group"></div>
                    </div>
                    
                    <div class="form-section">
                        <h3>薪酬项目明细</h3>
                        <div id="salaryItemsDetails"></div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="resetForm()">重置</button>
                        <button type="submit" class="btn btn-primary">提交</button>
                    </div>
                </form>
            </div>
        `;
        
        await loadPositions();
        await loadSalaryItems();
        setupFormHandlers();
        updateRegistrationTime();
    } catch (error) {
        console.error('加载薪酬标准登记页面失败:', error);
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
            const positionSelect = document.getElementById('positionId');
            if (positionSelect) {
                positionSelect.innerHTML = '<option value="">请选择职位</option>' + 
                    response.data.map(pos => `<option value="${pos.positionId}">${pos.positionName}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('加载职位列表失败:', error);
        showMessage('加载职位列表失败：' + (error.message || '未知错误'), 'error');
    }
}

async function loadSalaryItems() {
    try {
        const response = await SalaryItemAPI.getList();
        if (response && response.data) {
            window.salaryItems = response.data;
            renderSalaryItemsCheckboxes();
        } else {
            window.salaryItems = [];
            renderSalaryItemsCheckboxes();
        }
    } catch (error) {
        console.error('加载薪酬项目失败:', error);
        showMessage('加载薪酬项目失败：' + (error.message || '未知错误'), 'error');
        window.salaryItems = [];
        renderSalaryItemsCheckboxes();
    }
}

function renderSalaryItemsCheckboxes() {
    const container = document.getElementById('salaryItemsCheckboxes');
    if (!container || !window.salaryItems) return;
    
    container.innerHTML = window.salaryItems.map(item => `
        <label class="checkbox-label">
            <input type="checkbox" value="${item.itemId}" data-item-code="${item.itemCode}" 
                   data-item-name="${item.itemName}" data-item-type="${item.itemType}"
                   data-calculation-rule="${item.calculationRule || ''}"
                   onchange="onSalaryItemToggle(this)">
            ${item.itemName}
        </label>
    `).join('');
}

function onSalaryItemToggle(checkbox) {
    renderSalaryItemsDetails();
}

function renderSalaryItemsDetails() {
    const container = document.getElementById('salaryItemsDetails');
    if (!container) return;
    
    const checkedItems = Array.from(document.querySelectorAll('#salaryItemsCheckboxes input[type="checkbox"]:checked'));
    
    if (checkedItems.length === 0) {
        container.innerHTML = '<p class="text-muted">请先选择薪酬项目</p>';
        return;
    }
    
    container.innerHTML = checkedItems.map(checkbox => {
        const itemId = checkbox.value;
        const itemName = checkbox.dataset.itemName;
        const itemType = checkbox.dataset.itemType;
        const calculationRule = checkbox.dataset.calculationRule;
        const isCalculated = !!calculationRule;
        
        return `
            <div class="salary-item-detail">
                <div class="form-row">
                    <div class="form-group">
                        <label>${itemName}</label>
                        <input type="number" step="0.01" min="0" 
                               data-item-id="${itemId}" 
                               data-is-calculated="${isCalculated}"
                               class="form-control item-amount" 
                               placeholder="金额" 
                               ${isCalculated ? 'readonly' : ''}
                               onchange="updateCalculatedAmount(${itemId}, '${calculationRule}')">
                    </div>
                </div>
                ${isCalculated ? `<p class="calculation-rule">计算方式: ${calculationRule}</p>` : ''}
            </div>
        `;
    }).join('');
}

function updateCalculatedAmount(itemId, calculationRule) {
    if (!calculationRule) return;
    
    // 获取基本工资
    const basicSalaryInput = document.querySelector(`input[data-item-id="1"]`);
    if (!basicSalaryInput) return;
    
    const basicSalary = parseFloat(basicSalaryInput.value) || 0;
    
    // 解析计算规则并计算
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
    
    // 更新对应项目的金额
    const targetInput = document.querySelector(`input[data-item-id="${itemId}"]`);
    if (targetInput) {
        targetInput.value = calculatedAmount.toFixed(2);
    }
}

function onPositionChange() {
    // 职位改变时可以自动生成标准名称
    updateStandardName();
}

function onJobTitleChange() {
    updateStandardName();
}

function updateStandardName() {
    const positionSelect = document.getElementById('positionId');
    const jobTitleSelect = document.getElementById('jobTitle');
    const standardNameInput = document.getElementById('standardName');
    
    if (positionSelect.value && jobTitleSelect.value) {
        const positionName = positionSelect.options[positionSelect.selectedIndex].text;
        const jobTitleText = jobTitleSelect.options[jobTitleSelect.selectedIndex].text;
        standardNameInput.value = `${positionName}-${jobTitleText}标准`;
    }
}

function updateRegistrationTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('registrationTime').value = timeStr;
}

function setupFormHandlers() {
    const form = document.getElementById('standardForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitStandard();
    });
}

async function submitStandard() {
    const positionId = document.getElementById('positionId').value;
    const jobTitle = document.getElementById('jobTitle').value;
    const standardName = document.getElementById('standardName').value;
    
    if (!positionId || !jobTitle || !standardName) {
        showMessage('请填写完整信息', 'error');
        return;
    }
    
    // 获取当前用户信息
    let formulatorId = 1; // 默认值
    try {
        const userResponse = await UserAPI.getCurrentUser();
        if (userResponse && userResponse.data) {
            formulatorId = userResponse.data.userId;
        }
    } catch (error) {
        console.log('获取用户信息失败，使用默认值');
    }
    
    // 收集选中的薪酬项目
    const checkedItems = Array.from(document.querySelectorAll('#salaryItemsCheckboxes input[type="checkbox"]:checked'));
    const items = checkedItems.map(checkbox => {
        const itemId = parseInt(checkbox.value);
        const amountInput = document.querySelector(`input[data-item-id="${itemId}"]`);
        const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
        const isCalculated = amountInput ? amountInput.dataset.isCalculated === 'true' : false;
        
        return {
            itemId: itemId,
            amount: amount,
            isCalculated: isCalculated
        };
    });
    
    if (items.length === 0) {
        showMessage('请至少选择一个薪酬项目', 'error');
        return;
    }
    
    const data = {
        standardName: standardName,
        positionId: parseInt(positionId),
        jobTitle: jobTitle,
        formulatorId: formulatorId,
        items: items
    };
    
    try {
        const response = await SalaryStandardAPI.create(data);
        if (response && response.code === 200) {
            showMessage('薪酬标准登记成功', 'success');
            resetForm();
            // 触发自定义事件，通知查询页面刷新（如果已打开）
            window.dispatchEvent(new CustomEvent('salaryStandardCreated', { 
                detail: { standardId: response.data.standardId } 
            }));
        } else {
            showMessage(response.message || '登记失败', 'error');
        }
    } catch (error) {
        showMessage('登记失败：' + (error.message || '未知错误'), 'error');
    }
}

function resetForm() {
    document.getElementById('standardForm').reset();
    document.getElementById('salaryItemsDetails').innerHTML = '';
    updateRegistrationTime();
    renderSalaryItemsCheckboxes();
}

