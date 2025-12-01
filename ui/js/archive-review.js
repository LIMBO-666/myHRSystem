// 人力资源档案登记复核

(() => {
let currentPage = 1;
const pageSize = 10;

async function loadArchiveReviewPage() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <h2 class="page-title">人力资源档案登记复核</h2>
            
            <div class="form-section" style="background: #fafafa; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>档案编号</label>
                        <input type="text" id="reviewArchiveNumber" class="form-control" placeholder="支持模糊查询">
                    </div>
                    <div class="form-group">
                        <label>姓名</label>
                        <input type="text" id="reviewName" class="form-control" placeholder="支持模糊查询">
                    </div>
                    <div class="form-group">
                        <label>关键字</label>
                        <input type="text" id="reviewKeyword" class="form-control" placeholder="在姓名、机构、职位中搜索">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <div class="form-group">
                        <label>状态</label>
                        <select id="reviewStatus" class="form-control">
                            <option value="">全部</option>
                            <option value="PENDING_REVIEW">待复核</option>
                            <option value="NORMAL">已通过</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>提交起始日期</label>
                        <input type="date" id="reviewStartDate" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>提交结束日期</label>
                        <input type="date" id="reviewEndDate" class="form-control">
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-secondary" onclick="resetReviewQuery()" style="margin-right: 10px;">重置条件</button>
                    <button class="btn btn-primary" onclick="queryReviewArchives()">查询</button>
                </div>
            </div>
            
            <div class="list-section">
                <table class="table">
                    <thead>
                        <tr>
                            <th>档案编号</th>
                            <th>姓名</th>
                            <th>所属机构</th>
                            <th>职位</th>
                            <th>提交时间</th>
                            <th>登记人</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="reviewTableBody">
                        <tr>
                            <td colspan="8" style="text-align: center; color: #999; padding: 20px;">请输入查询条件并点击查询</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div id="pagination" style="margin-top: 20px; text-align: center;"></div>
        </div>
    `;
    
    // 默认加载列表
    await loadReviewList();
    
    // 监听档案创建和更新事件，自动刷新列表
    window.addEventListener('employeeArchiveCreated', async () => {
        await loadReviewList();
    });
    window.addEventListener('employeeArchiveUpdated', async () => {
        await loadReviewList();
    });
}

function queryReviewArchives() {
    currentPage = 1;
    loadReviewList();
}

function resetReviewQuery() {
    const archiveNumberEl = document.getElementById('reviewArchiveNumber');
    const nameEl = document.getElementById('reviewName');
    const keywordEl = document.getElementById('reviewKeyword');
    const statusEl = document.getElementById('reviewStatus');
    const startDateEl = document.getElementById('reviewStartDate');
    const endDateEl = document.getElementById('reviewEndDate');
    
    if (archiveNumberEl) archiveNumberEl.value = '';
    if (nameEl) nameEl.value = '';
    if (keywordEl) keywordEl.value = '';
    if (statusEl) statusEl.value = '';
    if (startDateEl) startDateEl.value = '';
    if (endDateEl) endDateEl.value = '';
    
    currentPage = 1;
    loadReviewList();
}

async function loadReviewList() {
    try {
        // 构建查询参数
        const params = {
            page: currentPage,
            size: pageSize
        };
        
        // 获取搜索条件
        const archiveNumberEl = document.getElementById('reviewArchiveNumber');
        const nameEl = document.getElementById('reviewName');
        const keywordEl = document.getElementById('reviewKeyword');
        const statusEl = document.getElementById('reviewStatus');
        const startDateEl = document.getElementById('reviewStartDate');
        const endDateEl = document.getElementById('reviewEndDate');
        
        if (archiveNumberEl && archiveNumberEl.value && archiveNumberEl.value.trim()) {
            params.archiveNumber = archiveNumberEl.value.trim();
        }
        if (nameEl && nameEl.value && nameEl.value.trim()) {
            params.name = nameEl.value.trim();
        }
        if (keywordEl && keywordEl.value && keywordEl.value.trim()) {
            params.keyword = keywordEl.value.trim();
        }
        if (statusEl && statusEl.value) {
            params.status = statusEl.value;
        }
        if (startDateEl && startDateEl.value) {
            params.startDate = startDateEl.value;
        }
        if (endDateEl && endDateEl.value) {
            params.endDate = endDateEl.value;
        }
        
        // 加载所有状态的档案（待复核和已通过的）
        const response = await EmployeeArchiveAPI.getPendingReviewList(params);
        const data = response.data || {};
        const archives = data.list || [];
        const total = data.total || 0;
        
        const tbody = document.getElementById('reviewTableBody');
        if (archives.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999; padding: 20px;">暂无档案记录</td></tr>';
            return;
        }
        
        tbody.innerHTML = archives.map(archive => {
            // 根据状态显示不同的标签和按钮
            const isPending = archive.status === 'PENDING_REVIEW';
            const statusBadge = isPending 
                ? '<span style="padding: 4px 8px; background: #fff7e6; color: #faad14; border-radius: 4px;">待复核</span>'
                : '<span style="padding: 4px 8px; background: #e6f7ff; color: #1890ff; border-radius: 4px;">已通过</span>';
            
            const actionButton = isPending
                ? `<button class="btn btn-primary" onclick="reviewArchive(${archive.archiveId})">复核</button>`
                : `<button class="btn btn-secondary" onclick="viewArchive(${archive.archiveId})">查看</button>`;
            
            // 显示更新时间（如果有）或登记时间
            const displayTime = archive.updateTime || archive.registrationTime;
            
            return `
            <tr>
                <td><a href="#" onclick="viewArchive(${archive.archiveId}); return false;" style="color: #1890ff;">${archive.archiveNumber}</a></td>
                <td>${archive.name}</td>
                <td>${archive.orgFullPath || '-'}</td>
                <td>${archive.positionName || '-'}</td>
                <td>${formatDateTime(displayTime)}</td>
                <td>${archive.registrarName || '-'}</td>
                <td>${statusBadge}</td>
                <td>${actionButton}</td>
            </tr>
        `;
        }).join('');
        
        // 分页
        renderPagination(total, currentPage, pageSize);
    } catch (error) {
        showMessage('加载档案列表失败: ' + error.message, 'error');
        const tbody = document.getElementById('reviewTableBody');
        if (tbody) {
            tbody.innerHTML = 
                '<tr><td colspan="8" style="text-align: center; color: #ff4d4f; padding: 20px;">加载失败</td></tr>';
        }
    }
}

function renderPagination(total, current, size) {
    const totalPages = Math.ceil(total / size);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<div style="display: flex; justify-content: center; gap: 10px; align-items: center;">';
    
    // 上一页
    if (current > 1) {
        html += `<button class="btn btn-secondary" onclick="changePage(${current - 1})">上一页</button>`;
    }
    
    // 页码
    for (let i = 1; i <= totalPages; i++) {
        if (i === current) {
            html += `<span style="padding: 8px 12px; background: #1890ff; color: white; border-radius: 4px;">${i}</span>`;
        } else {
            html += `<button class="btn btn-secondary" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // 下一页
    if (current < totalPages) {
        html += `<button class="btn btn-secondary" onclick="changePage(${current + 1})">下一页</button>`;
    }
    
    html += `</div><div style="text-align: center; margin-top: 10px; color: #999;">共 ${total} 条记录</div>`;
    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadReviewList();
}

async function reviewArchive(archiveId) {
    try {
        const response = await EmployeeArchiveAPI.getDetail(archiveId);
        const archive = response.data;
        
        // 显示复核表单模态框
        showReviewArchiveForm(archive);
    } catch (error) {
        showMessage('加载档案详情失败: ' + error.message, 'error');
    }
}

function showReviewArchiveForm(archive) {
    const modalContent = `
        <div style="max-height: 80vh; overflow-y: auto;">
            <form id="reviewArchiveForm" onsubmit="submitReviewArchive(event, ${archive.archiveId})">
                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">基本信息（不可修改）</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>档案编号</label>
                            <input type="text" class="form-control" value="${archive.archiveNumber}" readonly style="background: #f5f5f5;">
                        </div>
                        <div class="form-group">
                            <label>所属机构</label>
                            <input type="text" class="form-control" value="${archive.orgFullPath || '-'}" readonly style="background: #f5f5f5;">
                        </div>
                        <div class="form-group">
                            <label>职位</label>
                            <input type="text" class="form-control" value="${archive.positionName || '-'}" readonly style="background: #f5f5f5;">
                        </div>
                    </div>
                </div>

                <div class="form-section" style="margin-top: 20px;">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">可修改信息</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>姓名 <span style="color: red;">*</span></label>
                            <input type="text" id="reviewName" class="form-control" value="${archive.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>性别 <span style="color: red;">*</span></label>
                            <select id="reviewGender" class="form-control" required>
                                <option value="MALE" ${archive.gender === 'MALE' ? 'selected' : ''}>男</option>
                                <option value="FEMALE" ${archive.gender === 'FEMALE' ? 'selected' : ''}>女</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>身份证号码</label>
                            <input type="text" id="reviewIdNumber" class="form-control" value="${archive.idNumber || ''}">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>出生日期</label>
                            <input type="date" id="reviewBirthday" class="form-control" value="${archive.birthday || ''}">
                        </div>
                        <div class="form-group">
                            <label>年龄</label>
                            <input type="number" id="reviewAge" class="form-control" value="${archive.age || ''}" readonly style="background: #f5f5f5;">
                        </div>
                        <div class="form-group">
                            <label>民族</label>
                            <input type="text" id="reviewEthnicity" class="form-control" list="reviewEthnicity-list" placeholder="输入关键词搜索或选择民族" value="${archive.ethnicity || ''}" autocomplete="off">
                            <datalist id="reviewEthnicity-list">
                                <option value="汉族">汉族</option>
                                <option value="蒙古族">蒙古族</option>
                                <option value="回族">回族</option>
                                <option value="藏族">藏族</option>
                                <option value="维吾尔族">维吾尔族</option>
                                <option value="苗族">苗族</option>
                                <option value="彝族">彝族</option>
                                <option value="壮族">壮族</option>
                                <option value="布依族">布依族</option>
                                <option value="朝鲜族">朝鲜族</option>
                                <option value="满族">满族</option>
                                <option value="侗族">侗族</option>
                                <option value="瑶族">瑶族</option>
                                <option value="白族">白族</option>
                                <option value="土家族">土家族</option>
                                <option value="哈尼族">哈尼族</option>
                                <option value="哈萨克族">哈萨克族</option>
                                <option value="傣族">傣族</option>
                                <option value="黎族">黎族</option>
                                <option value="傈僳族">傈僳族</option>
                                <option value="佤族">佤族</option>
                                <option value="畲族">畲族</option>
                                <option value="高山族">高山族</option>
                                <option value="拉祜族">拉祜族</option>
                                <option value="水族">水族</option>
                                <option value="东乡族">东乡族</option>
                                <option value="纳西族">纳西族</option>
                                <option value="景颇族">景颇族</option>
                                <option value="柯尔克孜族">柯尔克孜族</option>
                                <option value="土族">土族</option>
                                <option value="达斡尔族">达斡尔族</option>
                                <option value="仫佬族">仫佬族</option>
                                <option value="羌族">羌族</option>
                                <option value="布朗族">布朗族</option>
                                <option value="撒拉族">撒拉族</option>
                                <option value="毛南族">毛南族</option>
                                <option value="仡佬族">仡佬族</option>
                                <option value="锡伯族">锡伯族</option>
                                <option value="阿昌族">阿昌族</option>
                                <option value="普米族">普米族</option>
                                <option value="塔吉克族">塔吉克族</option>
                                <option value="怒族">怒族</option>
                                <option value="乌孜别克族">乌孜别克族</option>
                                <option value="俄罗斯族">俄罗斯族</option>
                                <option value="鄂温克族">鄂温克族</option>
                                <option value="德昂族">德昂族</option>
                                <option value="保安族">保安族</option>
                                <option value="裕固族">裕固族</option>
                                <option value="京族">京族</option>
                                <option value="塔塔尔族">塔塔尔族</option>
                                <option value="独龙族">独龙族</option>
                                <option value="鄂伦春族">鄂伦春族</option>
                                <option value="赫哲族">赫哲族</option>
                                <option value="门巴族">门巴族</option>
                                <option value="珞巴族">珞巴族</option>
                                <option value="基诺族">基诺族</option>
                            </datalist>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>学历</label>
                            <input type="text" id="reviewEducationLevel" class="form-control" list="reviewEducationLevel-list" placeholder="输入关键词搜索或选择学历" value="${archive.educationLevel || ''}" autocomplete="off">
                            <datalist id="reviewEducationLevel-list">
                                <option value="小学">小学</option>
                                <option value="初中">初中</option>
                                <option value="高中">高中</option>
                                <option value="中专">中专</option>
                                <option value="大专">大专</option>
                                <option value="本科">本科</option>
                                <option value="硕士">硕士</option>
                                <option value="博士">博士</option>
                                <option value="其他">其他</option>
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label>学历专业</label>
                            <input type="text" id="reviewMajor" class="form-control" value="${archive.major || ''}">
                        </div>
                        <div class="form-group">
                            <label>职称</label>
                            <select id="reviewJobTitle" class="form-control">
                                <option value="JUNIOR" ${archive.jobTitle === 'JUNIOR' ? 'selected' : ''}>初级</option>
                                <option value="INTERMEDIATE" ${archive.jobTitle === 'INTERMEDIATE' ? 'selected' : ''}>中级</option>
                                <option value="SENIOR" ${archive.jobTitle === 'SENIOR' ? 'selected' : ''}>高级</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>国籍</label>
                            <input type="text" id="reviewNationality" class="form-control" value="${archive.nationality || '中国'}">
                        </div>
                        <div class="form-group">
                            <label>出生地</label>
                            <input type="text" id="reviewPlaceOfBirth" class="form-control" value="${archive.placeOfBirth || ''}">
                        </div>
                        <div class="form-group">
                            <label>宗教信仰</label>
                            <input type="text" id="reviewReligiousBelief" class="form-control" value="${archive.religiousBelief || ''}">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>政治面貌</label>
                            <input type="text" id="reviewPoliticalStatus" class="form-control" list="reviewPoliticalStatus-list" placeholder="输入关键词搜索或选择政治面貌" value="${archive.politicalStatus || ''}" autocomplete="off">
                            <datalist id="reviewPoliticalStatus-list">
                                <option value="群众">群众</option>
                                <option value="共青团员">共青团员</option>
                                <option value="中共党员">中共党员</option>
                                <option value="中共预备党员">中共预备党员</option>
                                <option value="民主党派">民主党派</option>
                                <option value="无党派人士">无党派人士</option>
                            </datalist>
                        </div>
                        <div class="form-group">
                            <label>薪酬标准</label>
                            <select id="reviewSalaryStandardId" class="form-control">
                                <option value="">选择薪酬标准</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-section" style="margin-top: 20px;">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">联系方式</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="reviewEmail" class="form-control" value="${archive.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>电话</label>
                            <input type="text" id="reviewPhone" class="form-control" value="${archive.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label>手机</label>
                            <input type="text" id="reviewMobile" class="form-control" value="${archive.mobile || ''}">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>QQ</label>
                            <input type="text" id="reviewQq" class="form-control" value="${archive.qq || ''}">
                        </div>
                        <div class="form-group">
                            <label>邮编</label>
                            <input type="text" id="reviewPostalCode" class="form-control" value="${archive.postalCode || ''}">
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <div class="form-group">
                            <label>住址</label>
                            <input type="text" id="reviewAddress" class="form-control" value="${archive.address || ''}">
                        </div>
                    </div>
                </div>

                <div class="form-section" style="margin-top: 20px;">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">其他信息</h3>
                    <div class="form-group">
                        <label>爱好</label>
                        <textarea id="reviewHobby" class="form-control" rows="2">${archive.hobby || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>个人履历</label>
                        <textarea id="reviewPersonalResume" class="form-control" rows="4">${archive.personalResume || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>家庭关系</label>
                        <textarea id="reviewFamilyRelationship" class="form-control" rows="4">${archive.familyRelationship || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>备注</label>
                        <textarea id="reviewRemarks" class="form-control" rows="3">${archive.remarks || ''}</textarea>
                    </div>
                </div>
                
                
                <div style="margin-top: 30px; text-align: right;">
                    <button type="button" class="btn btn-secondary" onclick="closeReviewModal()" style="margin-right: 10px;">取消</button>
                    <button type="submit" class="btn btn-primary">复核通过</button>
                </div>
            </form>
            </div>
    `;
    
    const { modal, closeModal } = createModal('复核档案', modalContent);
    window.currentReviewModal = { modal, closeModal };
    
    // 设置出生日期变化监听
    const birthdayInput = document.getElementById('reviewBirthday');
    const ageInput = document.getElementById('reviewAge');
    if (birthdayInput && ageInput) {
        birthdayInput.addEventListener('change', () => {
            if (birthdayInput.value) {
                const birthDate = new Date(birthdayInput.value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                ageInput.value = age;
            }
        });
    }
    
    // 加载薪酬标准
    loadReviewSalaryStandard(archive.positionId, archive.jobTitle, archive.salaryStandardId);
}

async function loadReviewSalaryStandard(positionId, jobTitle, currentSalaryStandardId) {
    if (!positionId || !jobTitle) return;
    
    try {
        const response = await SalaryStandardAPI.getByPosition(parseInt(positionId), jobTitle);
        const salaryStandardSelect = document.getElementById('reviewSalaryStandardId');
        if (salaryStandardSelect) {
            if (response && response.data) {
                salaryStandardSelect.innerHTML = `<option value="${response.data.standardId}">${response.data.standardName}</option>`;
                if (currentSalaryStandardId) {
                    salaryStandardSelect.value = currentSalaryStandardId;
                }
            } else {
                salaryStandardSelect.innerHTML = '<option value="">暂无薪酬标准</option>';
            }
        }
    } catch (error) {
        console.log('加载薪酬标准失败:', error);
    }
}

async function submitReviewArchive(event, archiveId) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('reviewName').value.trim(),
        gender: document.getElementById('reviewGender').value,
        idNumber: document.getElementById('reviewIdNumber').value.trim(),
        birthday: document.getElementById('reviewBirthday').value || null,
        age: parseInt(document.getElementById('reviewAge').value) || null,
        nationality: document.getElementById('reviewNationality').value.trim() || '中国',
        placeOfBirth: document.getElementById('reviewPlaceOfBirth').value.trim(),
        ethnicity: document.getElementById('reviewEthnicity').value.trim(),
        religiousBelief: document.getElementById('reviewReligiousBelief').value.trim(),
        politicalStatus: document.getElementById('reviewPoliticalStatus').value.trim(),
        educationLevel: document.getElementById('reviewEducationLevel').value.trim(),
        major: document.getElementById('reviewMajor').value.trim(),
        jobTitle: document.getElementById('reviewJobTitle').value,
        email: document.getElementById('reviewEmail').value.trim(),
        phone: document.getElementById('reviewPhone').value.trim(),
        qq: document.getElementById('reviewQq').value.trim(),
        mobile: document.getElementById('reviewMobile').value.trim(),
        address: document.getElementById('reviewAddress').value.trim(),
        postalCode: document.getElementById('reviewPostalCode').value.trim(),
        hobby: document.getElementById('reviewHobby').value.trim(),
        personalResume: document.getElementById('reviewPersonalResume').value.trim(),
        familyRelationship: document.getElementById('reviewFamilyRelationship').value.trim(),
        remarks: document.getElementById('reviewRemarks').value.trim(),
        salaryStandardId: parseInt(document.getElementById('reviewSalaryStandardId').value) || null
    };
    
    // 验证必填字段
    if (!formData.name || !formData.gender) {
        showMessage('请填写姓名和性别', 'error');
        return;
    }
    
    try {
        // 使用复核时修改接口
        await EmployeeArchiveAPI.reviewWithModify(archiveId, formData);
        showMessage('复核通过，档案已生效', 'success');
        if (window.currentReviewModal && window.currentReviewModal.closeModal) {
            window.currentReviewModal.closeModal();
        }
        // 触发自定义事件，通知查询页面刷新
        window.dispatchEvent(new CustomEvent('employeeArchiveReviewed', {
            detail: { archiveId: archiveId }
        }));
        // 重新加载列表
        await loadReviewList();
    } catch (error) {
        showMessage('复核失败: ' + error.message, 'error');
    }
}

function closeReviewModal() {
    if (window.currentReviewModal && window.currentReviewModal.closeModal) {
        window.currentReviewModal.closeModal();
    }
}

async function viewArchive(archiveId) {
    try {
        const response = await EmployeeArchiveAPI.getDetail(archiveId);
        const archive = response.data;
        
        // 显示档案详情模态框
        const reviewInfo = archive.reviewTime 
            ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e8e8e8;">
                <strong>复核人：</strong>${archive.reviewerName || '-'}<br>
                <strong>复核时间：</strong>${formatDateTime(archive.reviewTime)}
            </div>`
            : '';
        
        createModal('档案详情', `
            <div style="max-height: 70vh; overflow-y: auto;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div><strong>档案编号：</strong>${archive.archiveNumber}</div>
                    <div><strong>姓名：</strong>${archive.name}</div>
                    <div><strong>性别：</strong>${archive.gender === 'MALE' ? '男' : '女'}</div>
                    <div><strong>身份证号：</strong>${archive.idNumber || '-'}</div>
                    <div><strong>出生日期：</strong>${archive.birthday || '-'}</div>
                    <div><strong>年龄：</strong>${archive.age || '-'}</div>
                    <div><strong>所属机构：</strong>${archive.orgFullPath || '-'}</div>
                    <div><strong>职位：</strong>${archive.positionName || '-'}</div>
                    <div><strong>职称：</strong>${archive.jobTitle === 'JUNIOR' ? '初级' : archive.jobTitle === 'INTERMEDIATE' ? '中级' : '高级'}</div>
                    <div><strong>状态：</strong>${archive.status === 'NORMAL' ? '正常' : archive.status === 'PENDING_REVIEW' ? '待复核' : '已删除'}</div>
                    <div><strong>登记人：</strong>${archive.registrarName || '-'}</div>
                    <div><strong>登记时间：</strong>${formatDateTime(archive.registrationTime)}</div>
                </div>
                ${reviewInfo}
            </div>
        `);
    } catch (error) {
        showMessage('加载档案详情失败: ' + error.message, 'error');
    }
}

window.loadArchiveReviewPage = loadArchiveReviewPage;
window.changePage = changePage;
window.reviewArchive = reviewArchive;
window.viewArchive = viewArchive;
window.submitReviewArchive = submitReviewArchive;
window.closeReviewModal = closeReviewModal;
window.queryReviewArchives = queryReviewArchives;
window.resetReviewQuery = resetReviewQuery;
})();

