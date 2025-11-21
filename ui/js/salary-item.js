// 薪酬项目管理

async function loadSalaryItemPage() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <div class="actions-header">
                <h2 class="page-title">薪酬项目列表</h2>
                <button class="btn btn-primary" onclick="showAddSalaryItemModal()">
                    <span>+</span> 新增薪酬项目
                </button>
            </div>
            
            <div class="list-section">
                <table class="table">
                    <thead>
                        <tr>
                            <th>项目编号</th>
                            <th>项目名称</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="salaryItemTableBody">
                        <tr>
                            <td colspan="3" style="text-align: center; color: #999; padding: 20px;">加载中...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    loadSalaryItemList();
}

async function loadSalaryItemList() {
    try {
        const response = await SalaryItemAPI.getList();
        const items = response.data || [];
        
        const tbody = document.getElementById('salaryItemTableBody');
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999; padding: 20px;">暂无数据</td></tr>';
            return;
        }
        
        tbody.innerHTML = items.map(item => `
            <tr>
                <td>${item.itemCode}</td>
                <td>${item.itemName}</td>
                <td>
                    <button class="btn btn-warning" onclick="editSalaryItem(${item.itemId}, '${item.itemCode}', '${item.itemName}', '${item.itemType || ''}', '${(item.calculationRule || '').replace(/'/g, "\\'")}', ${item.sortOrder || 0})">编辑</button>
                    <button class="btn btn-danger" onclick="deleteSalaryItem(${item.itemId}, '${item.itemName}')">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showMessage('加载薪酬项目列表失败: ' + error.message, 'error');
        document.getElementById('salaryItemTableBody').innerHTML = 
            '<tr><td colspan="3" style="text-align: center; color: #ff4d4f; padding: 20px;">加载失败</td></tr>';
    }
}

function showAddSalaryItemModal() {
    const { modal, closeModal } = createModal('新增薪酬项目', `
        <div class="form-group">
            <label>项目编号</label>
            <input type="text" id="addItemCode" class="form-control" placeholder="输入项目编号（如：S001）">
        </div>
        <div class="form-group">
            <label>项目名称</label>
            <input type="text" id="addItemName" class="form-control" placeholder="输入项目名称">
        </div>
        <div class="form-group">
            <label>项目类型</label>
            <select id="addItemType" class="form-control">
                <option value="INCOME">收入项</option>
                <option value="DEDUCTION">扣除项</option>
            </select>
        </div>
        <div class="form-group">
            <label>计算规则</label>
            <input type="text" id="addCalculationRule" class="form-control" placeholder="输入计算规则（如：基本工资*8%），留空表示手动输入">
        </div>
        <div class="form-group">
            <label>排序顺序</label>
            <input type="number" id="addSortOrder" class="form-control" value="0" min="0">
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button class="btn btn-secondary" onclick="closeAddModal()" style="margin-right: 10px;">取消</button>
            <button class="btn btn-primary" onclick="saveAddSalaryItem()">保存</button>
        </div>
    `);
    
    window.closeAddModal = closeModal;
    window.saveAddSalaryItem = async () => {
        const itemCode = document.getElementById('addItemCode').value.trim();
        const itemName = document.getElementById('addItemName').value.trim();
        const itemType = document.getElementById('addItemType').value;
        const calculationRule = document.getElementById('addCalculationRule').value.trim();
        const sortOrder = parseInt(document.getElementById('addSortOrder').value) || 0;
        
        if (!itemCode) {
            showMessage('请输入项目编号', 'error');
            return;
        }
        
        if (!itemName) {
            showMessage('请输入项目名称', 'error');
            return;
        }
        
        try {
            await SalaryItemAPI.create({
                itemCode: itemCode,
                itemName: itemName,
                itemType: itemType,
                calculationRule: calculationRule || null,
                sortOrder: sortOrder
            });
            
            showMessage('添加成功');
            closeModal();
            loadSalaryItemList();
        } catch (error) {
            showMessage('添加失败: ' + error.message, 'error');
        }
    };
}

function editSalaryItem(itemId, itemCode, itemName, itemType, calculationRule, sortOrder) {
    const { modal, closeModal } = createModal('编辑薪酬项目', `
        <div class="form-group">
            <label>项目编号</label>
            <input type="text" id="editItemCode" class="form-control" value="${itemCode}" readonly>
            <small style="color: #999;">项目编号不可修改</small>
        </div>
        <div class="form-group">
            <label>项目名称</label>
            <input type="text" id="editItemName" class="form-control" value="${itemName}">
        </div>
        <div class="form-group">
            <label>项目类型</label>
            <select id="editItemType" class="form-control">
                <option value="INCOME" ${itemType === 'INCOME' ? 'selected' : ''}>收入项</option>
                <option value="DEDUCTION" ${itemType === 'DEDUCTION' ? 'selected' : ''}>扣除项</option>
            </select>
        </div>
        <div class="form-group">
            <label>计算规则</label>
            <input type="text" id="editCalculationRule" class="form-control" value="${calculationRule || ''}" placeholder="输入计算规则（如：基本工资*8%），留空表示手动输入">
        </div>
        <div class="form-group">
            <label>排序顺序</label>
            <input type="number" id="editSortOrder" class="form-control" value="${sortOrder}" min="0">
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button class="btn btn-secondary" onclick="closeEditModal()" style="margin-right: 10px;">取消</button>
            <button class="btn btn-primary" onclick="saveEditSalaryItem(${itemId})">保存</button>
        </div>
    `);
    
    window.closeEditModal = closeModal;
    window.saveEditSalaryItem = async (id) => {
        const itemName = document.getElementById('editItemName').value.trim();
        const itemType = document.getElementById('editItemType').value;
        const calculationRule = document.getElementById('editCalculationRule').value.trim();
        const sortOrder = parseInt(document.getElementById('editSortOrder').value) || 0;
        
        if (!itemName) {
            showMessage('请输入项目名称', 'error');
            return;
        }
        
        try {
            await SalaryItemAPI.update(id, {
                itemName: itemName,
                itemType: itemType,
                calculationRule: calculationRule || null,
                sortOrder: sortOrder
            });
            
            showMessage('更新成功');
            closeModal();
            loadSalaryItemList();
        } catch (error) {
            showMessage('更新失败: ' + error.message, 'error');
        }
    };
}

function deleteSalaryItem(itemId, itemName) {
    showConfirm(`确定要删除薪酬项目"${itemName}"吗？`, async () => {
        try {
            await SalaryItemAPI.delete(itemId);
            showMessage('删除成功');
            loadSalaryItemList();
        } catch (error) {
            showMessage('删除失败: ' + error.message, 'error');
        }
    });
}

