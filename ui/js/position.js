// 职位管理

let level3Orgs = [];

async function loadPositionPage() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <div class="actions-header">
                <h2 class="page-title">职位设置</h2>
                <button class="btn btn-primary" onclick="showAddPositionModal()">
                    <span>+</span> 新增职位
                </button>
            </div>
            
            <div class="list-section">
                <table class="table">
                    <thead>
                        <tr>
                            <th>职位名称</th>
                            <th>所属机构</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="positionTableBody">
                        <tr>
                            <td colspan="3" style="text-align: center; color: #999; padding: 20px;">加载中...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    await loadLevel3Orgs();
    loadPositionList();
}

async function loadLevel3Orgs() {
    try {
        // 获取所有三级机构
        const level1Response = await OrgAPI.getLevel1List();
        const level1Orgs = level1Response.data || [];
        
        level3Orgs = [];
        for (const level1Org of level1Orgs) {
            try {
                const level2Response = await OrgAPI.getLevel2List(level1Org.orgId);
                const level2List = level2Response.data || [];
                
                for (const level2Org of level2List) {
                    try {
                        const level3Response = await OrgAPI.getLevel3List(level2Org.orgId);
                        const level3List = level3Response.data || [];
                        level3Orgs.push(...level3List.map(org => ({
                            ...org,
                            fullPath: `${level1Org.orgName} / ${level2Org.orgName} / ${org.orgName}`,
                            level1Name: level1Org.orgName,
                            level2Name: level2Org.orgName
                        })));
                    } catch (error) {
                        console.error(`加载二级机构 ${level2Org.orgId} 的三级机构失败:`, error);
                    }
                }
            } catch (error) {
                console.error(`加载一级机构 ${level1Org.orgId} 的二级机构失败:`, error);
            }
        }
    } catch (error) {
        showMessage('加载三级机构失败: ' + error.message, 'error');
    }
}

async function loadPositionList() {
    try {
        const response = await PositionAPI.getList();
        const positions = response.data || [];
        
        const tbody = document.getElementById('positionTableBody');
        if (positions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999; padding: 20px;">暂无数据</td></tr>';
            return;
        }
        
        // 获取每个职位所属机构的完整路径
        const positionsWithPath = await Promise.all(positions.map(async (position) => {
            // 从三级机构列表中查找
            const org = level3Orgs.find(o => o.orgId === position.thirdOrgId);
            return {
                ...position,
                orgFullPath: org ? org.fullPath : '未知机构'
            };
        }));
        
        tbody.innerHTML = positionsWithPath.map(pos => `
            <tr>
                <td>${pos.positionName}</td>
                <td>${pos.orgFullPath}</td>
                <td>
                    <button class="btn btn-warning" onclick="editPosition(${pos.positionId}, '${pos.positionName}', ${pos.thirdOrgId})">编辑</button>
                    <button class="btn btn-danger" onclick="deletePosition(${pos.positionId}, '${pos.positionName}')">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showMessage('加载职位列表失败: ' + error.message, 'error');
        document.getElementById('positionTableBody').innerHTML = 
            '<tr><td colspan="3" style="text-align: center; color: #ff4d4f; padding: 20px;">加载失败</td></tr>';
    }
}

function showAddPositionModal() {
    const { modal, closeModal } = createModal('新增职位', `
        <div class="form-group">
            <label>所属三级机构</label>
            <select id="addThirdOrgId" class="form-control">
                <option value="">请选择三级机构</option>
                ${level3Orgs.map(org => 
                    `<option value="${org.orgId}">${org.fullPath}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>职位名称</label>
            <input type="text" id="addPositionName" class="form-control" placeholder="输入职位名称">
        </div>
        <div class="form-group">
            <label>职位描述</label>
            <textarea id="addPositionDesc" class="form-control" rows="3" placeholder="输入职位描述（可选）"></textarea>
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button class="btn btn-secondary" onclick="closeAddModal()" style="margin-right: 10px;">取消</button>
            <button class="btn btn-primary" onclick="saveAddPosition()">保存</button>
        </div>
    `);
    
    window.closeAddModal = closeModal;
    window.saveAddPosition = async () => {
        const thirdOrgId = document.getElementById('addThirdOrgId').value;
        const positionName = document.getElementById('addPositionName').value.trim();
        const description = document.getElementById('addPositionDesc').value.trim();
        
        if (!thirdOrgId) {
            showMessage('请选择三级机构', 'error');
            return;
        }
        
        if (!positionName) {
            showMessage('请输入职位名称', 'error');
            return;
        }
        
        try {
            await PositionAPI.create({
                positionName: positionName,
                thirdOrgId: parseInt(thirdOrgId),
                description: description
            });
            
            showMessage('添加成功');
            closeModal();
            loadPositionList();
        } catch (error) {
            showMessage('添加失败: ' + error.message, 'error');
        }
    };
}

function editPosition(positionId, positionName, thirdOrgId) {
    const { modal, closeModal } = createModal('编辑职位', `
        <div class="form-group">
            <label>所属三级机构</label>
            <select id="editThirdOrgId" class="form-control">
                ${level3Orgs.map(org => 
                    `<option value="${org.orgId}" ${org.orgId === thirdOrgId ? 'selected' : ''}>${org.fullPath}</option>`
                ).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>职位名称</label>
            <input type="text" id="editPositionName" class="form-control" value="${positionName}">
        </div>
        <div class="form-group">
            <label>职位描述</label>
            <textarea id="editPositionDesc" class="form-control" rows="3" placeholder="输入职位描述（可选）"></textarea>
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button class="btn btn-secondary" onclick="closeEditModal()" style="margin-right: 10px;">取消</button>
            <button class="btn btn-primary" onclick="saveEditPosition(${positionId})">保存</button>
        </div>
    `);
    
    // 加载职位详情获取描述
    PositionAPI.getDetail(positionId).then(response => {
        if (response && response.data) {
            document.getElementById('editPositionDesc').value = response.data.description || '';
        }
    }).catch(error => {
        console.error('加载职位详情失败:', error);
    });
    
    window.closeEditModal = closeModal;
    window.saveEditPosition = async (id) => {
        const positionName = document.getElementById('editPositionName').value.trim();
        const description = document.getElementById('editPositionDesc').value.trim();
        
        if (!positionName) {
            showMessage('请输入职位名称', 'error');
            return;
        }
        
        try {
            await PositionAPI.update(id, {
                positionName: positionName,
                description: description
            });
            
            showMessage('更新成功');
            closeModal();
            loadPositionList();
        } catch (error) {
            showMessage('更新失败: ' + error.message, 'error');
        }
    };
}

function deletePosition(positionId, positionName) {
    showConfirm(`确定要删除职位"${positionName}"吗？`, async () => {
        try {
            await PositionAPI.delete(positionId);
            showMessage('删除成功');
            loadPositionList();
        } catch (error) {
            showMessage('删除失败: ' + error.message, 'error');
        }
    });
}

