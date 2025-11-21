// 人力资源档案删除管理

let deletePage = 1;
const deletePageSize = 10;

let deleteSearchKeyword = ''; // 搜索关键字

async function loadArchiveDeletePage() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <h2 class="page-title">人力资源档案删除管理</h2>
            
            <div class="form-section" style="background: #fafafa; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                <div style="display: flex; gap: 10px; align-items: flex-end;">
                    <div class="form-group" style="flex: 1;">
                        <label>搜索关键字（姓名或档案编号）</label>
                        <input type="text" id="deleteSearchKeyword" class="form-control" placeholder="请输入姓名或档案编号" value="${deleteSearchKeyword}" 
                               onkeypress="if(event.key === 'Enter') doDeleteSearch()">
                    </div>
                    <div class="form-group" style="margin-top: 25px;">
                        <button class="btn btn-primary" onclick="doDeleteSearch()">搜索</button>
                        <button class="btn btn-secondary" onclick="resetDeleteSearch()" style="margin-left: 10px;">重置</button>
                    </div>
                </div>
            </div>
            
            <div class="list-section">
                <table class="table">
                    <thead>
                        <tr>
                            <th>档案编号</th>
                            <th>姓名</th>
                            <th>删除时间</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="deleteTableBody">
                        <tr>
                            <td colspan="5" style="text-align: center; color: #999; padding: 20px;">加载中...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div id="deletePagination" style="margin-top: 20px; text-align: center;"></div>
        </div>
    `;
    
    loadDeletedList();
}

function doDeleteSearch() {
    const keyword = document.getElementById('deleteSearchKeyword').value.trim();
    deleteSearchKeyword = keyword;
    deletePage = 1; // 重置到第一页
    loadDeletedList();
}

function resetDeleteSearch() {
    deleteSearchKeyword = '';
    deletePage = 1;
    document.getElementById('deleteSearchKeyword').value = '';
    loadDeletedList();
}

async function loadDeletedList() {
    try {
        // 传递搜索关键字参数
        const params = {};
        if (deleteSearchKeyword) {
            params.keyword = deleteSearchKeyword;
        }
        const response = await EmployeeArchiveAPI.getDeletedList(deletePage, deletePageSize, params);
        const data = response.data || {};
        const archives = data.list || [];
        const total = data.total || 0;
        
        const tbody = document.getElementById('deleteTableBody');
        if (archives.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999; padding: 20px;">暂无员工档案</td></tr>';
            document.getElementById('deletePagination').innerHTML = '';
            return;
        }
        
        tbody.innerHTML = archives.map(archive => {
            // 根据状态显示不同的标签和操作按钮
            // 删除管理页面只显示正常和已删除状态的员工
            const isDeleted = archive.status === 'DELETED';
            
            let statusBadge = '';
            if (isDeleted) {
                statusBadge = '<span style="padding: 4px 8px; background: #fff2f0; color: #ff4d4f; border-radius: 4px;">已删除</span>';
            } else {
                // 正常状态
                statusBadge = '<span style="padding: 4px 8px; background: #f6ffed; color: #52c41a; border-radius: 4px;">正常</span>';
            }
            
            // 操作按钮：已删除的显示恢复，正常的显示删除
            let actionButton = '';
            if (isDeleted) {
                actionButton = `<button class="btn btn-primary" onclick="restoreArchive(${archive.archiveId}, '${archive.name}')">恢复</button>`;
            } else {
                // 正常状态显示删除按钮
                actionButton = `<button class="btn btn-danger" onclick="deleteArchive(${archive.archiveId}, '${archive.name}')">删除</button>`;
            }
            
            return `
            <tr>
                <td>${archive.archiveNumber}</td>
                <td>${archive.name}</td>
                <td>${archive.deleteTime ? formatDateTime(archive.deleteTime) : '-'}</td>
                <td>${statusBadge}</td>
                <td>${actionButton}</td>
            </tr>
        `;
        }).join('');
        
        // 分页
        renderDeletePagination(total, deletePage, deletePageSize);
    } catch (error) {
        showMessage('加载列表失败: ' + error.message, 'error');
        document.getElementById('deleteTableBody').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: #ff4d4f; padding: 20px;">加载失败</td></tr>';
    }
}

function renderDeletePagination(total, current, size) {
    const totalPages = Math.ceil(total / size);
    const pagination = document.getElementById('deletePagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = `<div style="text-align: center; margin-top: 10px; color: #999;">共 ${total} 条记录</div>`;
        return;
    }
    
    let html = '<div style="display: flex; justify-content: center; gap: 10px; align-items: center;">';
    
    if (current > 1) {
        html += `<button class="btn btn-secondary" onclick="changeDeletePage(${current - 1})">上一页</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === current) {
            html += `<span style="padding: 8px 12px; background: #1890ff; color: white; border-radius: 4px;">${i}</span>`;
        } else {
            html += `<button class="btn btn-secondary" onclick="changeDeletePage(${i})">${i}</button>`;
        }
    }
    
    if (current < totalPages) {
        html += `<button class="btn btn-secondary" onclick="changeDeletePage(${current + 1})">下一页</button>`;
    }
    
    html += `</div><div style="text-align: center; margin-top: 10px; color: #999;">共 ${total} 条记录</div>`;
    pagination.innerHTML = html;
}

function changeDeletePage(page) {
    deletePage = page;
    loadDeletedList();
}

function deleteArchive(archiveId, name) {
    showConfirm(`确定要删除档案"${name}"吗？`, async () => {
        try {
            await EmployeeArchiveAPI.delete(archiveId, '');
            showMessage('删除成功');
            loadDeletedList(); // 刷新列表，记录仍然显示，只是状态变为已删除
        } catch (error) {
            showMessage('删除失败: ' + error.message, 'error');
        }
    });
}

function restoreArchive(archiveId, name) {
    showConfirm(`确定要恢复档案"${name}"吗？`, async () => {
        try {
            await EmployeeArchiveAPI.restore(archiveId);
            showMessage('恢复成功');
            loadDeletedList(); // 刷新列表，记录仍然显示，只是状态变为正常
        } catch (error) {
            showMessage('恢复失败: ' + error.message, 'error');
        }
    });
}

// 导出函数供全局使用
window.deleteArchive = deleteArchive;
window.restoreArchive = restoreArchive;
window.doDeleteSearch = doDeleteSearch;
window.resetDeleteSearch = resetDeleteSearch;

