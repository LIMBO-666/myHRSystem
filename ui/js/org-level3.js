// 三级机构管理

let level2Orgs = [];

async function loadOrgLevel3Page() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <h2 class="page-title">三级机构</h2>
            
            <div class="form-section">
                <div class="form-group">
                    <label>选择二级机构</label>
                    <select id="parentOrgSelect" class="form-control">
                        <option value="">请选择二级机构</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>输入三级机构名称</label>
                    <input type="text" id="orgNameInput" class="form-control" placeholder="输入三级机构名称">
                </div>
                <button class="btn btn-primary" onclick="addLevel3Org()">
                    <span>+</span> 添加三级机构
                </button>
            </div>
            
            <div class="list-section">
                <div id="orgList"></div>
            </div>
        </div>
    `;
    
    await loadLevel2Orgs();
    loadOrgLevel3List();
}

async function loadLevel2Orgs() {
    try {
        // 先获取所有一级机构
        const level1Response = await OrgAPI.getLevel1List();
        const level1Orgs = level1Response.data || [];
        
        // 获取每个一级机构下的二级机构
        level2Orgs = [];
        for (const level1Org of level1Orgs) {
            try {
                const level2Response = await OrgAPI.getLevel2List(level1Org.orgId);
                const level2List = level2Response.data || [];
                level2Orgs.push(...level2List.map(org => ({
                    ...org,
                    level1Name: level1Org.orgName,
                    level1Id: level1Org.orgId
                })));
            } catch (error) {
                console.error(`加载一级机构 ${level1Org.orgId} 的二级机构失败:`, error);
            }
        }
        
        const select = document.getElementById('parentOrgSelect');
        select.innerHTML = '<option value="">请选择二级机构</option>' + 
            level2Orgs.map(org => 
                `<option value="${org.orgId}">${org.level1Name} / ${org.orgName}</option>`
            ).join('');
    } catch (error) {
        showMessage('加载二级机构失败: ' + error.message, 'error');
    }
}

async function loadOrgLevel3List() {
    try {
        const allLevel3Orgs = [];
        
        for (const level2Org of level2Orgs) {
            try {
                const response = await OrgAPI.getLevel3List(level2Org.orgId);
                const level3Orgs = response.data || [];
                allLevel3Orgs.push(...level3Orgs.map(org => ({
                    ...org,
                    parentPath: `${level2Org.level1Name}/${level2Org.orgName}`
                })));
            } catch (error) {
                console.error(`加载二级机构 ${level2Org.orgId} 的三级机构失败:`, error);
            }
        }
        
        const listContainer = document.getElementById('orgList');
        if (allLevel3Orgs.length === 0) {
            listContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无数据</p>';
            return;
        }
        
        listContainer.innerHTML = allLevel3Orgs.map(org => `
            <div class="list-item">
                <div class="list-item-content">
                    <div class="list-item-title">${org.orgName}</div>
                    <div class="list-item-subtitle">隶属于: ${org.parentPath}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-warning" onclick="editLevel3Org(${org.orgId}, '${org.orgName}', ${org.parentId})">编辑</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showMessage('加载机构列表失败: ' + error.message, 'error');
    }
}

async function addLevel3Org() {
    const parentId = document.getElementById('parentOrgSelect').value;
    const orgNameInput = document.getElementById('orgNameInput');
    const orgName = orgNameInput.value.trim();
    
    if (!parentId) {
        showMessage('请选择二级机构', 'error');
        return;
    }
    
    if (!orgName) {
        showMessage('请输入机构名称', 'error');
        return;
    }
    
    try {
        const orgCode = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
        
        await OrgAPI.createLevel3({
            orgName: orgName,
            orgCode: orgCode,
            parentId: parseInt(parentId),
            description: ''
        });
        
        showMessage('添加成功');
        orgNameInput.value = '';
        loadOrgLevel3List();
    } catch (error) {
        showMessage('添加失败: ' + error.message, 'error');
    }
}

function editLevel3Org(orgId, orgName, parentId) {
    const { modal, closeModal } = createModal('编辑三级机构', `
        <div class="form-group">
            <label>二级机构</label>
            <select id="editParentOrgSelect" class="form-control">
                ${level2Orgs.map(org => 
                    `<option value="${org.orgId}" ${org.orgId === parentId ? 'selected' : ''}>${org.level1Name} / ${org.orgName}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>机构名称</label>
            <input type="text" id="editOrgName" class="form-control" value="${orgName}">
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button class="btn btn-secondary" onclick="closeEditModal()" style="margin-right: 10px;">取消</button>
            <button class="btn btn-primary" onclick="saveLevel3Org(${orgId})">保存</button>
        </div>
    `);
    
    window.closeEditModal = closeModal;
    window.saveLevel3Org = async (id) => {
        const newName = document.getElementById('editOrgName').value.trim();
        
        if (!newName) {
            showMessage('请输入机构名称', 'error');
            return;
        }
        
        try {
            await OrgAPI.update(id, { orgName: newName });
            showMessage('更新成功');
            closeModal();
            loadOrgLevel3List();
        } catch (error) {
            showMessage('更新失败: ' + error.message, 'error');
        }
    };
}

