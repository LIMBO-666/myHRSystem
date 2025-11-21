// 人力资源档案登记

(() => {
let level1Orgs = [];
let level2Orgs = [];
let level3Orgs = [];
let positions = [];
let salaryStandards = [];

async function loadArchiveRegisterPage() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="page-container">
            <h2 class="page-title">人力资源档案登记</h2>
            
            <form id="archiveForm" onsubmit="submitArchive(event)">
                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">基本信息</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>档案编号</label>
                            <input type="text" id="archiveNumber" class="form-control" placeholder="系统自动生成" readonly>
                        </div>
                        <div class="form-group">
                            <label>姓名 <span style="color: red;">*</span></label>
                            <input type="text" id="name" class="form-control" placeholder="输入员工姓名" required>
                        </div>
                        <div class="form-group">
                            <label>性别 <span style="color: red;">*</span></label>
                            <select id="gender" class="form-control" required>
                                <option value="">选择性别</option>
                                <option value="MALE">男</option>
                                <option value="FEMALE">女</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>身份证号码</label>
                            <input type="text" id="idNumber" class="form-control" placeholder="输入身份证号码">
                        </div>
                        <div class="form-group">
                            <label>出生日期</label>
                            <input type="date" id="birthday" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>年龄</label>
                            <input type="number" id="age" class="form-control" placeholder="自动计算" readonly>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">个人信息</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>民族</label>
                            <input type="text" id="ethnicity" class="form-control" list="ethnicity-list" placeholder="输入关键词搜索或选择民族" autocomplete="off">
                            <datalist id="ethnicity-list">
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
                        <div class="form-group">
                            <label>学历</label>
                            <input type="text" id="educationLevel" class="form-control" list="educationLevel-list" placeholder="输入关键词搜索或选择学历" autocomplete="off">
                            <datalist id="educationLevel-list">
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
                            <input type="text" id="major" class="form-control" placeholder="输入学历专业">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>国籍</label>
                            <input type="text" id="nationality" class="form-control" value="中国" placeholder="输入国籍">
                        </div>
                        <div class="form-group">
                            <label>出生地</label>
                            <input type="text" id="placeOfBirth" class="form-control" placeholder="输入出生地">
                        </div>
                        <div class="form-group">
                            <label>宗教信仰</label>
                            <input type="text" id="religiousBelief" class="form-control" placeholder="输入宗教信仰">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>政治面貌</label>
                            <input type="text" id="politicalStatus" class="form-control" list="politicalStatus-list" placeholder="输入关键词搜索或选择政治面貌" autocomplete="off">
                            <datalist id="politicalStatus-list">
                                <option value="群众">群众</option>
                                <option value="共青团员">共青团员</option>
                                <option value="中共党员">中共党员</option>
                                <option value="中共预备党员">中共预备党员</option>
                                <option value="民主党派">民主党派</option>
                                <option value="无党派人士">无党派人士</option>
                            </datalist>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">联系方式</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" class="form-control" placeholder="输入Email地址">
                        </div>
                        <div class="form-group">
                            <label>电话</label>
                            <input type="text" id="phone" class="form-control" placeholder="输入联系电话">
                        </div>
                        <div class="form-group">
                            <label>手机</label>
                            <input type="text" id="mobile" class="form-control" placeholder="输入手机号码">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>QQ</label>
                            <input type="text" id="qq" class="form-control" placeholder="输入QQ号">
                        </div>
                        <div class="form-group">
                            <label>邮编</label>
                            <input type="text" id="postalCode" class="form-control" placeholder="输入邮政编码">
                        </div>
                    </div>
                    <div class="form-group" style="margin-top: 20px;">
                        <label>住址</label>
                        <input type="text" id="address" class="form-control" placeholder="输入联系地址">
                    </div>
                </div>

                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">机构与职位信息</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>一级机构 <span style="color: red;">*</span></label>
                            <select id="firstOrgId" class="form-control" required onchange="onFirstOrgChange()">
                                <option value="">选择一级机构</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>二级机构 <span style="color: red;">*</span></label>
                            <select id="secondOrgId" class="form-control" required onchange="onSecondOrgChange()">
                                <option value="">选择二级机构</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>三级机构 <span style="color: red;">*</span></label>
                            <select id="thirdOrgId" class="form-control" required onchange="onThirdOrgChange()">
                                <option value="">选择三级机构</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div class="form-group">
                            <label>职位名称 <span style="color: red;">*</span></label>
                            <select id="positionId" class="form-control" required onchange="onPositionChange()">
                                <option value="">选择职位名称</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>职称 <span style="color: red;">*</span></label>
                            <select id="jobTitle" class="form-control" required onchange="onJobTitleChange()">
                                <option value="">选择职称</option>
                                <option value="JUNIOR">初级</option>
                                <option value="INTERMEDIATE">中级</option>
                                <option value="SENIOR">高级</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>薪酬标准 <span style="color: red;">*</span></label>
                            <select id="salaryStandardId" class="form-control" required>
                                <option value="">选择薪酬标准</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3 style="margin-bottom: 20px; color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">其他信息</h3>
                    <div class="form-group">
                        <label>爱好</label>
                        <textarea id="hobby" class="form-control" rows="2" placeholder="输入爱好"></textarea>
                    </div>
                    <div class="form-group">
                        <label>个人履历</label>
                        <textarea id="personalResume" class="form-control" rows="4" placeholder="输入个人履历"></textarea>
                    </div>
                    <div class="form-group">
                        <label>家庭关系</label>
                        <textarea id="familyRelationship" class="form-control" rows="4" placeholder="输入家庭关系信息"></textarea>
                    </div>
                    <div class="form-group">
                        <label>备注</label>
                        <textarea id="remarks" class="form-control" rows="3" placeholder="输入备注信息"></textarea>
                    </div>
                </div>

                <div style="margin-top: 30px; text-align: right;">
                    <button type="button" class="btn btn-secondary" onclick="resetForm()" style="margin-right: 10px;">重置</button>
                    <button type="submit" class="btn btn-primary">提交登记</button>
                </div>
            </form>
        </div>
    `;
    
    await loadOrgData();
    setupDateChangeListener();
}

// 存储可搜索下拉框实例
let firstOrgSearchable = null;
let secondOrgSearchable = null;
let thirdOrgSearchable = null;
let positionSearchable = null;

async function loadOrgData() {
    try {
        // 加载一级机构
        const level1Response = await OrgAPI.getLevel1List();
        level1Orgs = level1Response.data || [];
        
        // 创建一级机构可搜索下拉框
        const firstOrgOptions = level1Orgs.map(org => ({
            value: org.orgId,
            text: org.orgName
        }));
        
        firstOrgSearchable = createSearchableSelect('firstOrgId', firstOrgOptions, (value, text) => {
            // 直接使用传递的值，而不是再次获取
            onFirstOrgChangeWithId(value);
        }, '输入关键词搜索或选择一级机构');
        
    } catch (error) {
        showMessage('加载机构数据失败: ' + error.message, 'error');
    }
}

// 带ID参数的一级机构变化处理函数
async function onFirstOrgChangeWithId(firstOrgId) {
    console.log('一级机构选择变化，ID:', firstOrgId);
    
    if (!firstOrgId) {
        console.log('一级机构ID为空，不加载二级机构');
        return;
    }
    
    // 清空二级、三级机构和职位
    if (secondOrgSearchable) {
        secondOrgSearchable.clear();
        secondOrgSearchable.updateOptions([]);
    } else {
        const secondOrgSelect = document.getElementById('secondOrgId');
        if (secondOrgSelect) {
            secondOrgSelect.innerHTML = '<option value="">选择二级机构</option>';
        }
    }
    
    if (thirdOrgSearchable) {
        thirdOrgSearchable.clear();
        thirdOrgSearchable.updateOptions([]);
    } else {
        const thirdOrgSelect = document.getElementById('thirdOrgId');
        if (thirdOrgSelect) {
            thirdOrgSelect.innerHTML = '<option value="">选择三级机构</option>';
        }
    }
    
    if (positionSearchable) {
        positionSearchable.clear();
        positionSearchable.updateOptions([]);
    } else {
        const positionSelect = document.getElementById('positionId');
        if (positionSelect) {
            positionSelect.innerHTML = '<option value="">选择职位名称</option>';
        }
    }
    
    try {
        console.log('开始加载二级机构，一级机构ID:', firstOrgId);
        const response = await OrgAPI.getLevel2List(parseInt(firstOrgId));
        level2Orgs = response.data || [];
        console.log('加载到的二级机构:', level2Orgs);
        
        if (level2Orgs.length === 0) {
            console.log('该一级机构下没有二级机构');
            return;
        }
        
        // 更新二级机构可搜索下拉框
        const secondOrgOptions = level2Orgs.map(org => ({
            value: org.orgId,
            text: org.orgName
        }));
        
        console.log('二级机构选项:', secondOrgOptions);
        
        if (!secondOrgSearchable) {
            console.log('创建二级机构可搜索下拉框');
            secondOrgSearchable = createSearchableSelect('secondOrgId', secondOrgOptions, (value, text) => {
                onSecondOrgChangeWithId(value);
            }, '输入关键词搜索或选择二级机构');
        } else {
            console.log('更新二级机构可搜索下拉框选项');
            secondOrgSearchable.updateOptions(secondOrgOptions);
        }
    } catch (error) {
        console.error('加载二级机构失败:', error);
        showMessage('加载二级机构失败: ' + error.message, 'error');
    }
}

// 原始的一级机构变化处理函数（保留用于兼容，例如从HTML的onchange事件触发）
async function onFirstOrgChange() {
    // 获取一级机构ID，优先从可搜索下拉框获取
    let firstOrgId = '';
    if (firstOrgSearchable) {
        firstOrgId = firstOrgSearchable.getValue();
    } else {
        const firstOrgSelect = document.getElementById('firstOrgId');
        if (firstOrgSelect) {
            firstOrgId = firstOrgSelect.value;
        }
    }
    
    await onFirstOrgChangeWithId(firstOrgId);
}

// 带ID参数的二级机构变化处理函数
async function onSecondOrgChangeWithId(secondOrgId) {
    console.log('二级机构选择变化，ID:', secondOrgId);
    
    if (!secondOrgId) {
        return;
    }
    
    // 清空三级机构和职位
    if (thirdOrgSearchable) {
        thirdOrgSearchable.clear();
        thirdOrgSearchable.updateOptions([]);
    } else {
        const thirdOrgSelect = document.getElementById('thirdOrgId');
        if (thirdOrgSelect) {
            thirdOrgSelect.innerHTML = '<option value="">选择三级机构</option>';
        }
    }
    
    if (positionSearchable) {
        positionSearchable.clear();
        positionSearchable.updateOptions([]);
    } else {
        const positionSelect = document.getElementById('positionId');
        if (positionSelect) {
            positionSelect.innerHTML = '<option value="">选择职位名称</option>';
        }
    }
    
    try {
        const response = await OrgAPI.getLevel3List(parseInt(secondOrgId));
        level3Orgs = response.data || [];
        
        // 更新三级机构可搜索下拉框
        const thirdOrgOptions = level3Orgs.map(org => ({
            value: org.orgId,
            text: org.orgName
        }));
        
        if (!thirdOrgSearchable) {
            thirdOrgSearchable = createSearchableSelect('thirdOrgId', thirdOrgOptions, (value, text) => {
                onThirdOrgChangeWithId(value);
            }, '输入关键词搜索或选择三级机构');
        } else {
            thirdOrgSearchable.updateOptions(thirdOrgOptions);
        }
    } catch (error) {
        showMessage('加载三级机构失败: ' + error.message, 'error');
    }
}

// 原始的二级机构变化处理函数（保留用于兼容，例如从HTML的onchange事件触发）
async function onSecondOrgChange() {
    const secondOrgId = secondOrgSearchable ? secondOrgSearchable.getValue() : document.getElementById('secondOrgId').value;
    await onSecondOrgChangeWithId(secondOrgId);
}

// 带ID参数的三级机构变化处理函数
async function onThirdOrgChangeWithId(thirdOrgId) {
    console.log('三级机构选择变化，ID:', thirdOrgId);
    
    if (!thirdOrgId) {
        return;
    }
    
    // 清空职位
    if (positionSearchable) {
        positionSearchable.clear();
        positionSearchable.updateOptions([]);
    } else {
        const positionSelect = document.getElementById('positionId');
        if (positionSelect) {
            positionSelect.innerHTML = '<option value="">选择职位名称</option>';
        }
    }
    
    try {
        const response = await PositionAPI.getList(parseInt(thirdOrgId));
        positions = response.data || [];
        
        // 更新职位可搜索下拉框
        const positionOptions = positions.map(pos => ({
            value: pos.positionId,
            text: pos.positionName
        }));
        
        if (!positionSearchable) {
            positionSearchable = createSearchableSelect('positionId', positionOptions, (value, text) => {
                onPositionChange();
            }, '输入关键词搜索或选择职位名称');
        } else {
            positionSearchable.updateOptions(positionOptions);
        }
    } catch (error) {
        showMessage('加载职位失败: ' + error.message, 'error');
    }
}

// 原始的三级机构变化处理函数（保留用于兼容，例如从HTML的onchange事件触发）
async function onThirdOrgChange() {
    const thirdOrgId = thirdOrgSearchable ? thirdOrgSearchable.getValue() : document.getElementById('thirdOrgId').value;
    await onThirdOrgChangeWithId(thirdOrgId);
}

async function onPositionChange() {
    await onJobTitleChange();
}

async function onJobTitleChange() {
    const positionId = positionSearchable ? positionSearchable.getValue() : document.getElementById('positionId').value;
    const jobTitle = document.getElementById('jobTitle').value;
    const salaryStandardSelect = document.getElementById('salaryStandardId');
    
    salaryStandardSelect.innerHTML = '<option value="">选择薪酬标准</option>';
    
    if (!positionId || !jobTitle) return;
    
    try {
        const response = await SalaryStandardAPI.getByPosition(parseInt(positionId), jobTitle);
        if (response && response.data) {
            salaryStandards = [response.data];
            salaryStandardSelect.innerHTML = '<option value="">选择薪酬标准</option>' + 
                salaryStandards.map(std => `<option value="${std.standardId}">${std.standardName}</option>`).join('');
        }
    } catch (error) {
        console.log('加载薪酬标准失败:', error);
        // 如果没有找到薪酬标准，不显示错误，因为可能还没有创建
    }
}

function setupDateChangeListener() {
    const birthdayInput = document.getElementById('birthday');
    const ageInput = document.getElementById('age');
    
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

async function submitArchive(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        gender: document.getElementById('gender').value,
        idNumber: document.getElementById('idNumber').value.trim(),
        birthday: document.getElementById('birthday').value || null,
        age: parseInt(document.getElementById('age').value) || null,
        nationality: document.getElementById('nationality').value.trim() || '中国',
        placeOfBirth: document.getElementById('placeOfBirth').value.trim(),
        ethnicity: document.getElementById('ethnicity').value.trim(),
        religiousBelief: document.getElementById('religiousBelief').value.trim(),
        politicalStatus: document.getElementById('politicalStatus').value.trim(),
        educationLevel: document.getElementById('educationLevel').value.trim(),
        major: document.getElementById('major').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        qq: document.getElementById('qq').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        address: document.getElementById('address').value.trim(),
        postalCode: document.getElementById('postalCode').value.trim(),
        hobby: document.getElementById('hobby').value.trim(),
        personalResume: document.getElementById('personalResume').value.trim(),
        familyRelationship: document.getElementById('familyRelationship').value.trim(),
        remarks: document.getElementById('remarks').value.trim(),
        firstOrgId: parseInt(firstOrgSearchable ? firstOrgSearchable.getValue() : document.getElementById('firstOrgId').value),
        secondOrgId: parseInt(secondOrgSearchable ? secondOrgSearchable.getValue() : document.getElementById('secondOrgId').value),
        thirdOrgId: parseInt(thirdOrgSearchable ? thirdOrgSearchable.getValue() : document.getElementById('thirdOrgId').value),
        positionId: parseInt(positionSearchable ? positionSearchable.getValue() : document.getElementById('positionId').value),
        jobTitle: document.getElementById('jobTitle').value,
        salaryStandardId: parseInt(document.getElementById('salaryStandardId').value) || null,
    };
    
    // 验证必填字段
    if (!formData.name || !formData.gender || !formData.firstOrgId || !formData.secondOrgId || 
        !formData.thirdOrgId || !formData.positionId || !formData.jobTitle) {
        showMessage('请填写所有必填字段', 'error');
        return;
    }
    
    try {
        const response = await EmployeeArchiveAPI.create(formData);
        showMessage('登记成功！档案编号：' + response.data.archiveNumber);
        resetForm();
        // 触发自定义事件，通知查询和复核页面刷新
        window.dispatchEvent(new CustomEvent('employeeArchiveCreated', {
            detail: { archiveId: response.data.archiveId, archiveNumber: response.data.archiveNumber }
        }));
    } catch (error) {
        showMessage('登记失败: ' + error.message, 'error');
    }
}

function resetForm() {
    document.getElementById('archiveForm').reset();
    document.getElementById('nationality').value = '中国';
    document.getElementById('archiveNumber').value = '';
    document.getElementById('age').value = '';
    
    // 清空可搜索下拉框
    if (firstOrgSearchable) {
        firstOrgSearchable.clear();
    }
    if (secondOrgSearchable) {
        secondOrgSearchable.clear();
        secondOrgSearchable.updateOptions([]);
    }
    if (thirdOrgSearchable) {
        thirdOrgSearchable.clear();
        thirdOrgSearchable.updateOptions([]);
    }
    if (positionSearchable) {
        positionSearchable.clear();
        positionSearchable.updateOptions([]);
    }
    
    // 清空原始select（备用）
    const secondOrgSelect = document.getElementById('secondOrgId');
    const thirdOrgSelect = document.getElementById('thirdOrgId');
    const positionSelect = document.getElementById('positionId');
    if (secondOrgSelect) secondOrgSelect.innerHTML = '<option value="">选择二级机构</option>';
    if (thirdOrgSelect) thirdOrgSelect.innerHTML = '<option value="">选择三级机构</option>';
    if (positionSelect) positionSelect.innerHTML = '<option value="">选择职位名称</option>';
    document.getElementById('salaryStandardId').innerHTML = '<option value="">选择薪酬标准</option>';
}

// 将关键函数暴露到全局，供HTML和common.js调用
window.loadArchiveRegisterPage = loadArchiveRegisterPage;
window.onFirstOrgChange = onFirstOrgChange;
window.onSecondOrgChange = onSecondOrgChange;
window.onThirdOrgChange = onThirdOrgChange;
window.onPositionChange = onPositionChange;
window.onJobTitleChange = onJobTitleChange;
window.submitArchive = submitArchive;
window.resetForm = resetForm;
})();
