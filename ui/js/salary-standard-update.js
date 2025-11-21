// 薪酬标准变更页面

let currentStandardId = null;

async function loadSalaryStandardUpdatePage() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-header">
            <h2>薪酬标准变更</h2>
        </div>
        <div class="card">
            <div class="search-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>选择薪酬标准</label>
                        <select id="selectStandard" class="form-control" onchange="loadStandardForUpdate()">
                            <option value="">请选择要变更的薪酬标准</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div id="updateFormContainer" style="display: none;">
                <form id="updateForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>薪酬标准编号</label>
                            <input type="text" id="updateStandardCode" class="form-control" readonly>
                        </div>
                        <div class="form-group">
                            <label>薪酬标准名称 <span class="required">*</span></label>
                            <input type="text" id="updateStandardName" class="form-control" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>适用职位</label>
                            <input type="text" id="updatePositionName" class="form-control" readonly>
                        </div>
                        <div class="form-group">
                            <label>职称</label>
                            <input type="text" id="updateJobTitle" class="form-control" readonly>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>薪酬项目明细</h3>
                        <div id="updateItemsDetails"></div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="resetUpdateForm()">重置</button>
                        <button type="submit" class="btn btn-primary">提交变更</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    await loadStandardsForSelect();
    setupUpdateFormHandler();
}

async function loadStandardsForSelect() {
    try {
        const response = await SalaryStandardAPI.query({ size: 1000 });
        if (response && response.data) {
            const select = document.getElementById('selectStandard');
            select.innerHTML = '<option value="">请选择要变更的薪酬标准</option>' + 
                response.data.list.map(std => 
                    `<option value="${std.standardId}">${std.standardCode} - ${std.standardName}</option>`
                ).join('');
        }
    } catch (error) {
        showMessage('加载薪酬标准列表失败', 'error');
    }
}

async function loadStandardForUpdate() {
    const standardId = document.getElementById('selectStandard').value;
    if (!standardId) {
        document.getElementById('updateFormContainer').style.display = 'none';
        return;
    }
    
    try {
        const response = await SalaryStandardAPI.getDetail(standardId);
        if (response && response.data) {
            currentStandardId = standardId;
            populateUpdateForm(response.data);
            document.getElementById('updateFormContainer').style.display = 'block';
        }
    } catch (error) {
        showMessage('加载薪酬标准详情失败', 'error');
    }
}

function populateUpdateForm(standard) {
    document.getElementById('updateStandardCode').value = standard.standardCode;
    document.getElementById('updateStandardName').value = standard.standardName;
    document.getElementById('updatePositionName').value = standard.positionName || '-';
    document.getElementById('updateJobTitle').value = 
        standard.jobTitle === 'JUNIOR' ? '初级' : 
        standard.jobTitle === 'INTERMEDIATE' ? '中级' : '高级';
    
    // 渲染薪酬项目明细
    const container = document.getElementById('updateItemsDetails');
    if (standard.items && standard.items.length > 0) {
        container.innerHTML = standard.items.map(item => {
            const isCalculated = item.isCalculated;
            return `
                <div class="salary-item-detail">
                    <div class="form-row">
                        <div class="form-group">
                            <label>${item.itemName} ${item.isCalculated ? '(自动计算)' : ''}</label>
                            <input type="number" step="0.01" min="0" 
                                   data-item-id="${item.itemId}" 
                                   data-is-calculated="${isCalculated}"
                                   class="form-control item-amount" 
                                   value="${item.amount || 0}"
                                   ${isCalculated ? 'readonly' : ''}
                                   onchange="updateCalculatedAmountForUpdate(${item.itemId}, '${item.calculationRule || ''}')">
                        </div>
                    </div>
                    ${item.calculationRule ? `<p class="calculation-rule">计算方式: ${item.calculationRule}</p>` : ''}
                </div>
            `;
        }).join('');
    } else {
        container.innerHTML = '<p class="text-muted">暂无薪酬项目</p>';
    }
}

function updateCalculatedAmountForUpdate(itemId, calculationRule) {
    if (!calculationRule) return;
    
    const basicSalaryInput = document.querySelector(`#updateItemsDetails input[data-item-id="1"]`);
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
    
    const targetInput = document.querySelector(`#updateItemsDetails input[data-item-id="${itemId}"]`);
    if (targetInput) {
        targetInput.value = calculatedAmount.toFixed(2);
    }
}

function setupUpdateFormHandler() {
    const form = document.getElementById('updateForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitUpdate();
    });
}

async function submitUpdate() {
    if (!currentStandardId) {
        showMessage('请先选择要变更的薪酬标准', 'error');
        return;
    }
    
    const standardName = document.getElementById('updateStandardName').value.trim();
    if (!standardName) {
        showMessage('请输入薪酬标准名称', 'error');
        return;
    }
    
    // 收集薪酬项目
    const itemInputs = document.querySelectorAll('#updateItemsDetails input.item-amount');
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
        const response = await SalaryStandardAPI.update(currentStandardId, data);
        if (response && response.code === 200) {
            showMessage('薪酬标准变更成功，等待复核', 'success');
            resetUpdateForm();
            await loadStandardsForSelect();
        } else {
            showMessage(response.message || '变更失败', 'error');
        }
    } catch (error) {
        showMessage('变更失败：' + (error.message || '未知错误'), 'error');
    }
}

function resetUpdateForm() {
    document.getElementById('selectStandard').value = '';
    document.getElementById('updateFormContainer').style.display = 'none';
    currentStandardId = null;
}

