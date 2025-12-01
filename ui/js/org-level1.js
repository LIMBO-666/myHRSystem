// 一级机构管理

function loadOrgLevel1Page() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <h2 class="page-title">一级机构</h2>
            
            <div class="form-section">
                <div class="form-group">
                    <label>输入一级机构名称</label>
                    <input type="text" id="orgNameInput" class="form-control" placeholder="输入一级机构名称">
                </div>
                <button class="btn btn-primary" onclick="addLevel1Org()">
                    <span>+</span> 添加一级机构
                </button>
            </div>
            
            <div class="list-section">
                <div id="orgList"></div>
            </div>
        </div>
    `;
    
    loadOrgLevel1List();
}

async function loadOrgLevel1List() {
    try {
        const response = await OrgAPI.getLevel1List();
        const orgs = response.data || [];
        
        const listContainer = document.getElementById('orgList');
        if (orgs.length === 0) {
            listContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无数据</p>';
            return;
        }
        
        listContainer.innerHTML = orgs.map(org => `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${org.orgName}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-warning" onclick="editLevel1Org(${org.orgId}, '${org.orgName}')">编辑</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showMessage('加载机构列表失败: ' + error.message, 'error');
    }
}

async function addLevel1Org() {
    const orgNameInput = document.getElementById('orgNameInput');
    const orgName = orgNameInput.value.trim();
    
    if (!orgName) {
        showMessage('请输入机构名称', 'error');
        return;
    }
    
    try {
        // 生成机构编号（简单处理，实际应该由后端生成）
        const orgCode = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
        
        await OrgAPI.createLevel1({
            orgName: orgName,
            orgCode: orgCode,
            description: ''
        });
        
        showMessage('添加成功');
        orgNameInput.value = '';
        loadOrgLevel1List();
    } catch (error) {
        showMessage('添加失败: ' + error.message, 'error');
    }
}

function editLevel1Org(orgId, orgName) {
    const { modal, closeModal } = createModal('编辑一级机构', `
        <div class="form-group">
            <label>机构名称</label>
            <input type="text" id="editOrgName" class="form-control" value="${orgName}">
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button class="btn btn-secondary" onclick="closeEditModal()" style="margin-right: 10px;">取消</button>
            <button class="btn btn-primary" onclick="saveLevel1Org(${orgId})">保存</button>
        </div>
    `);
    
    window.closeEditModal = closeModal;
    window.saveLevel1Org = async (id) => {
        const newName = document.getElementById('editOrgName').value.trim();
        if (!newName) {
            showMessage('请输入机构名称', 'error');
            return;
        }
        
        try {
            await OrgAPI.update(id, { orgName: newName });
            showMessage('更新成功');
            closeModal();
            loadOrgLevel1List();
        } catch (error) {
            showMessage('更新失败: ' + error.message, 'error');
        }
    };
}

