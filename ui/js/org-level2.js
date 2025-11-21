// 二级机构管理

(() => {
let level1Orgs = [];

async function loadOrgLevel2Page() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <h2 class="page-title">二级机构</h2>
            
            <div class="form-section">
                <div class="form-group">
                    <label>选择一级机构</label>
                    <select id="parentOrgSelect" class="form-control">
                        <option value="">请选择一级机构</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>输入二级机构名称</label>
                    <input type="text" id="orgNameInput" class="form-control" placeholder="输入二级机构名称">
                </div>
                <button class="btn btn-primary" onclick="addLevel2Org()">
                    <span>+</span> 添加二级机构
                </button>
            </div>
            
            <div class="list-section">
                <div id="orgList"></div>
            </div>
        </div>
    `;
    
    await loadLevel1Orgs();
    loadOrgLevel2List();
}

async function loadLevel1Orgs() {
    try {
        const response = await OrgAPI.getLevel1List();
        level1Orgs = response.data || [];
        
        const select = document.getElementById('parentOrgSelect');
        select.innerHTML = '<option value="">请选择一级机构</option>' + 
            level1Orgs.map(org => 
                `<option value="${org.orgId}">${org.orgName}</option>`
            ).join('');
    } catch (error) {
        showMessage('加载一级机构失败: ' + error.message, 'error');
    }
}

async function loadOrgLevel2List() {
    try {
        // 获取所有一级机构，然后获取每个一级机构的二级机构
        const allLevel2Orgs = [];
        
        for (const level1Org of level1Orgs) {
            try {
                const response = await OrgAPI.getLevel2List(level1Org.orgId);
                const level2Orgs = response.data || [];
                allLevel2Orgs.push(...level2Orgs.map(org => ({
                    ...org,
                    parentName: level1Org.orgName
                })));
            } catch (error) {
                console.error(`加载一级机构 ${level1Org.orgId} 的二级机构失败:`, error);
            }
        }
        
        const listContainer = document.getElementById('orgList');
        if (allLevel2Orgs.length === 0) {
            listContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无数据</p>';
            return;
        }
        
        listContainer.innerHTML = allLevel2Orgs.map(org => `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${org.orgName}</div>
                    <div class="list-item-subtitle">隶属于: ${org.parentName}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-warning" onclick="editLevel2Org(${org.orgId}, '${org.orgName}', ${org.parentId})">编辑</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showMessage('加载机构列表失败: ' + error.message, 'error');
    }
}

async function addLevel2Org() {
    const parentId = document.getElementById('parentOrgSelect').value;
    const orgNameInput = document.getElementById('orgNameInput');
    const orgName = orgNameInput.value.trim();
    
    if (!parentId) {
        showMessage('请选择一级机构', 'error');
        return;
    }
    
    if (!orgName) {
        showMessage('请输入机构名称', 'error');
        return;
    }
    
    try {
        const orgCode = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
        
        await OrgAPI.createLevel2({
            orgName: orgName,
            orgCode: orgCode,
            parentId: parseInt(parentId),
            description: ''
        });
        
        showMessage('添加成功');
        orgNameInput.value = '';
        loadOrgLevel2List();
    } catch (error) {
        showMessage('添加失败: ' + error.message, 'error');
    }
}

function editLevel2Org(orgId, orgName, parentId) {
    const { modal, closeModal } = createModal('编辑二级机构', `
        <div class="form-group">
            <label>一级机构</label>
            <select id="editParentOrgSelect" class="form-control">
                ${level1Orgs.map(org => 
                    `<option value="${org.orgId}" ${org.orgId === parentId ? 'selected' : ''}>${org.orgName}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>机构名称</label>
            <input type="text" id="editOrgName" class="form-control" value="${orgName}">
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button class="btn btn-secondary" onclick="closeEditModal()" style="margin-right: 10px;">取消</button>
            <button class="btn btn-primary" onclick="saveLevel2Org(${orgId})">保存</button>
        </div>
    `);
    
    window.closeEditModal = closeModal;
    window.saveLevel2Org = async (id) => {
        const newName = document.getElementById('editOrgName').value.trim();
        const newParentId = document.getElementById('editParentOrgSelect').value;
        
        if (!newName) {
            showMessage('请输入机构名称', 'error');
            return;
        }
        
        try {
            await OrgAPI.update(id, { orgName: newName });
            showMessage('更新成功');
            closeModal();
            loadOrgLevel2List();
        } catch (error) {
            showMessage('更新失败: ' + error.message, 'error');
        }
    };
}

window.loadOrgLevel2Page = loadOrgLevel2Page;
window.addLevel2Org = addLevel2Org;
window.editLevel2Org = editLevel2Org;
})();

