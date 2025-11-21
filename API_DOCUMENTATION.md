# 人力资源管理系统 API 文档

## 目录

1. [通用说明](#通用说明)
2. [认证授权](#认证授权)
3. [系统管理](#系统管理)
4. [人力资源档案管理](#人力资源档案管理)
5. [薪酬管理](#薪酬管理)

---

## 通用说明

### 基础信息

- **Base URL**: `http://localhost:8080/api`
- **Content-Type**: `application/json`
- **认证方式**: JWT Token (Bearer Token)
- **请求头**: `Authorization: Bearer {token}`

### 统一响应格式

所有API接口使用统一的响应格式 `ApiResponse<T>`：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1699000000000
}
```

**响应字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 响应码，200表示成功，其他表示失败 |
| message | String | 响应消息 |
| data | T | 响应数据，泛型类型 |
| timestamp | Long | 时间戳（毫秒） |

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或Token过期） |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 角色说明

| 角色代码 | 角色名称 | 说明 |
|---------|---------|------|
| HR_SPECIALIST | 人事专员 | 可进行档案登记、查询、变更 |
| HR_MANAGER | 人事经理 | 可进行档案复核、删除管理 |
| SALARY_SPECIALIST | 薪酬专员 | 可进行薪酬标准登记、薪酬发放登记 |
| SALARY_MANAGER | 薪酬经理 | 可进行薪酬标准复核、薪酬发放复核 |

---

## 认证授权

### 1. 用户登录

**接口地址**: `POST /api/auth/login`

**接口说明**: 用户登录，获取JWT Token

**请求参数**:

```json
{
  "username": "hr01",
  "password": "password123"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 1,
      "username": "hr01",
      "realName": "人事专员",
      "role": "HR_SPECIALIST",
      "email": "hr01@example.com",
      "phone": "13800138001",
      "status": "ACTIVE"
    }
  },
  "timestamp": 1699000000000
}
```

### 2. 用户退出登录

**接口地址**: `POST /api/auth/logout`

**接口说明**: 用户退出登录，清除Token

**权限要求**: 需要登录

**请求头**: 
- `Authorization: Bearer {token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "退出成功",
  "data": null,
  "timestamp": 1699000000000
}
```

### 3. 获取当前用户信息

**接口地址**: `GET /api/users/me`

**接口说明**: 获取当前登录用户的信息

**权限要求**: 需要登录

**请求头**: 
- `Authorization: Bearer {token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userId": 1,
    "username": "hr01",
    "realName": "人事专员",
    "role": "HR_SPECIALIST",
    "email": "hr01@example.com",
    "phone": "13800138001",
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

---

## 系统管理

**接口地址**: `POST /api/auth/logout`

**接口说明**: 用户登出，使Token失效

**请求头**: 
- `Authorization: Bearer {token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "登出成功",
  "data": null,
  "timestamp": 1699000000000
}
```

### 3. 刷新Token

**接口地址**: `POST /api/auth/refresh`

**接口说明**: 刷新Token

**请求头**: 
- `Authorization: Bearer {refreshToken}`

**响应示例**:

```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "timestamp": 1699000000000
}
```

### 4. 验证Token

**接口地址**: `GET /api/auth/validate`

**接口说明**: 验证Token是否有效

**请求头**: 
- `Authorization: Bearer {token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "Token有效",
  "data": true,
  "timestamp": 1699000000000
}
```

### 5. 获取当前用户信息

**接口地址**: `GET /api/users/me`

**接口说明**: 获取当前登录用户信息

**请求头**: 
- `Authorization: Bearer {token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userId": 2,
    "username": "hr01",
    "realName": "王管理员",
    "role": "HR_SPECIALIST",
    "email": "hr01@example.com",
    "phone": "13800138001",
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

### 6. 根据角色查询用户列表

**接口地址**: `GET /api/users/by-role`

**接口说明**: 根据角色查询用户列表

**权限要求**: HR_MANAGER, SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `role` (String, 必填): 角色代码，如 HR_SPECIALIST, HR_MANAGER, SALARY_SPECIALIST, SALARY_MANAGER

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "userId": 2,
      "username": "hr01",
      "realName": "人事专员",
      "role": "HR_SPECIALIST",
      "email": "hr01@example.com",
      "phone": "13800138001",
      "status": "ACTIVE"
    },
    {
      "userId": 3,
      "username": "hr02",
      "realName": "人事专员2",
      "role": "HR_SPECIALIST",
      "email": "hr02@example.com",
      "phone": "13800138002",
      "status": "ACTIVE"
    }
  ],
  "timestamp": 1699000000000
}
```

### 7. 根据状态查询用户列表

**接口地址**: `GET /api/users/by-status`

**接口说明**: 根据状态查询用户列表

**权限要求**: HR_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `status` (String, 必填): 用户状态，ACTIVE(激活) 或 INACTIVE(禁用)

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "userId": 1,
      "username": "admin",
      "realName": "系统管理员",
      "role": "HR_MANAGER",
      "email": "admin@example.com",
      "phone": "13800000001",
      "status": "ACTIVE"
    }
  ],
  "timestamp": 1699000000000
}
```

---

## 系统管理

### 机构关系设置

#### 1. 获取一级机构列表

**接口地址**: `GET /api/organizations/level1`

**接口说明**: 获取所有一级机构列表

**请求头**: 
- `Authorization: Bearer {token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "orgId": 1,
      "orgCode": "01",
      "orgName": "技术中心",
      "orgLevel": 1,
      "parentId": null,
      "status": "ACTIVE"
    }
  ],
  "timestamp": 1699000000000
}
```

#### 2. 获取二级机构列表

**接口地址**: `GET /api/organizations/level2`

**接口说明**: 根据一级机构ID获取二级机构列表

**请求参数**:
- `parentId` (Long, 必填): 一级机构ID

**请求头**: 
- `Authorization: Bearer {token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "orgId": 3,
      "orgCode": "01",
      "orgName": "产品研发部",
      "orgLevel": 2,
      "parentId": 1,
      "status": "ACTIVE"
    }
  ],
  "timestamp": 1699000000000
}
```

#### 3. 获取三级机构列表

**接口地址**: `GET /api/organizations/level3`

**接口说明**: 根据二级机构ID获取三级机构列表

**请求参数**:
- `parentId` (Long, 必填): 二级机构ID

**请求头**: 
- `Authorization: Bearer {token}`

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "orgId": 6,
      "orgCode": "01",
      "orgName": "前端组",
      "orgLevel": 3,
      "parentId": 3,
      "status": "ACTIVE"
    }
  ],
  "timestamp": 1699000000000
}
```

#### 4. 创建一级机构

**接口地址**: `POST /api/organizations/level1`

**接口说明**: 创建一级机构

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:

```json
{
  "orgName": "技术中心",
  "orgCode": "01",
  "description": "技术中心描述"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "orgId": 1,
    "orgCode": "01",
    "orgName": "技术中心",
    "orgLevel": 1,
    "parentId": null,
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 5. 创建二级机构

**接口地址**: `POST /api/organizations/level2`

**接口说明**: 创建二级机构

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:

```json
{
  "orgName": "产品研发部",
  "orgCode": "01",
  "parentId": 1,
  "description": "产品研发部描述"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "orgId": 3,
    "orgCode": "01",
    "orgName": "产品研发部",
    "orgLevel": 2,
    "parentId": 1,
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 6. 创建三级机构

**接口地址**: `POST /api/organizations/level3`

**接口说明**: 创建三级机构

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:

```json
{
  "orgName": "前端组",
  "orgCode": "01",
  "parentId": 3,
  "description": "前端组描述"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "orgId": 6,
    "orgCode": "01",
    "orgName": "前端组",
    "orgLevel": 3,
    "parentId": 3,
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 7. 更新机构信息

**接口地址**: `PUT /api/organizations/{orgId}`

**接口说明**: 更新机构信息

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `orgId` (Long): 机构ID

**请求参数**:

```json
{
  "orgName": "技术中心（更新）",
  "description": "更新后的描述"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "orgId": 1,
    "orgCode": "01",
    "orgName": "技术中心（更新）",
    "orgLevel": 1,
    "parentId": null,
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 8. 删除机构

**接口地址**: `DELETE /api/organizations/{orgId}`

**接口说明**: 删除机构（软删除，设置状态为INACTIVE）

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `orgId` (Long): 机构ID

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null,
  "timestamp": 1699000000000
}
```

### 职位设置

#### 1. 获取职位列表

**接口地址**: `GET /api/positions`

**接口说明**: 获取职位列表，支持按三级机构筛选

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `thirdOrgId` (Long, 可选): 三级机构ID，用于筛选

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "positionId": 1,
      "positionName": "前端工程师",
      "thirdOrgId": 6,
      "thirdOrgName": "前端组",
      "orgFullPath": "技术中心/产品研发部/前端组",
      "description": "前端工程师职位描述",
      "status": "ACTIVE"
    }
  ],
  "timestamp": 1699000000000
}
```

#### 2. 获取职位详情

**接口地址**: `GET /api/positions/{positionId}`

**接口说明**: 根据ID获取职位详情

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `positionId` (Long): 职位ID

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "positionId": 1,
    "positionName": "前端工程师",
    "thirdOrgId": 6,
    "thirdOrgName": "前端组",
    "orgFullPath": "技术中心/产品研发部/前端组",
    "description": "前端工程师职位描述",
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 3. 创建职位

**接口地址**: `POST /api/positions`

**接口说明**: 创建职位

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:

```json
{
  "positionName": "前端工程师",
  "thirdOrgId": 6,
  "description": "前端工程师职位描述"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "positionId": 1,
    "positionName": "前端工程师",
    "thirdOrgId": 6,
    "description": "前端工程师职位描述",
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 4. 更新职位

**接口地址**: `PUT /api/positions/{positionId}`

**接口说明**: 更新职位信息

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `positionId` (Long): 职位ID

**请求参数**:

```json
{
  "positionName": "高级前端工程师",
  "description": "更新后的职位描述"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "positionId": 1,
    "positionName": "高级前端工程师",
    "thirdOrgId": 6,
    "description": "更新后的职位描述",
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 5. 删除职位

**接口地址**: `DELETE /api/positions/{positionId}`

**接口说明**: 删除职位（软删除）

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `positionId` (Long): 职位ID

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null,
  "timestamp": 1699000000000
}
```

### 薪酬项目设置

#### 1. 获取薪酬项目列表

**接口地址**: `GET /api/salary-items`

**接口说明**: 获取薪酬项目列表

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `itemType` (String, 可选): 项目类型，INCOME(收入项) 或 DEDUCTION(扣除项)
- `status` (String, 可选): 状态，ACTIVE(激活) 或 INACTIVE(禁用)

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "itemId": 1,
      "itemCode": "S001",
      "itemName": "基本工资",
      "itemType": "INCOME",
      "calculationRule": null,
      "sortOrder": 1,
      "status": "ACTIVE"
    },
    {
      "itemId": 6,
      "itemCode": "S006",
      "itemName": "养老保险",
      "itemType": "DEDUCTION",
      "calculationRule": "基本工资*8%",
      "sortOrder": 6,
      "status": "ACTIVE"
    }
  ],
  "timestamp": 1699000000000
}
```

#### 2. 获取薪酬项目详情

**接口地址**: `GET /api/salary-items/{itemId}`

**接口说明**: 根据ID获取薪酬项目详情

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `itemId` (Long): 薪酬项目ID

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "itemId": 1,
    "itemCode": "S001",
    "itemName": "基本工资",
    "itemType": "INCOME",
    "calculationRule": null,
    "sortOrder": 1,
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 3. 创建薪酬项目

**接口地址**: `POST /api/salary-items`

**接口说明**: 创建薪酬项目

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:

```json
{
  "itemCode": "S010",
  "itemName": "通信补助",
  "itemType": "INCOME",
  "calculationRule": null,
  "sortOrder": 10
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "itemId": 10,
    "itemCode": "S010",
    "itemName": "通信补助",
    "itemType": "INCOME",
    "calculationRule": null,
    "sortOrder": 10,
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 4. 更新薪酬项目

**接口地址**: `PUT /api/salary-items/{itemId}`

**接口说明**: 更新薪酬项目信息

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `itemId` (Long): 薪酬项目ID

**请求参数**:

```json
{
  "itemName": "基本工资（更新）",
  "calculationRule": null,
  "sortOrder": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "itemId": 1,
    "itemCode": "S001",
    "itemName": "基本工资（更新）",
    "itemType": "INCOME",
    "calculationRule": null,
    "sortOrder": 1,
    "status": "ACTIVE"
  },
  "timestamp": 1699000000000
}
```

#### 5. 删除薪酬项目

**接口地址**: `DELETE /api/salary-items/{itemId}`

**接口说明**: 删除薪酬项目（软删除）

**权限要求**: 需要管理员权限

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `itemId` (Long): 薪酬项目ID

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null,
  "timestamp": 1699000000000
}
```

---

## 人力资源档案管理

### 人力资源档案登记

#### 1. 创建员工档案

**接口地址**: `POST /api/employee-archives`

**接口说明**: 人事专员登记新员工档案

**权限要求**: HR_SPECIALIST

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:

```json
{
  "name": "张明",
  "gender": "MALE",
  "idNumber": "110101199001011234",
  "birthday": "1990-01-01",
  "age": 33,
  "nationality": "中国",
  "placeOfBirth": "北京",
  "ethnicity": "汉族",
  "religiousBelief": "无",
  "politicalStatus": "群众",
  "educationLevel": "本科",
  "major": "计算机科学与技术",
  "email": "zhangming@example.com",
  "phone": "010-12345678",
  "qq": "123456789",
  "mobile": "13800138000",
  "address": "北京市朝阳区xxx",
  "postalCode": "100000",
  "hobby": "阅读、编程",
  "personalResume": "2010-2014 就读于XX大学...",
  "familyRelationship": "父亲：XXX，母亲：XXX",
  "remarks": "备注信息",
  "firstOrgId": 1,
  "secondOrgId": 3,
  "thirdOrgId": 6,
  "positionId": 1,
  "jobTitle": "INTERMEDIATE",
  "salaryStandardId": 1,
  "photoUrl": "https://example.com/photo.jpg"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登记成功",
  "data": {
    "archiveId": 1,
    "archiveNumber": "20230101010101",
    "name": "张明",
    "status": "PENDING_REVIEW",
    "registrationTime": "2023-07-15T09:30:00"
  },
  "timestamp": 1699000000000
}
```

#### 2. 上传员工照片

**接口地址**: `POST /api/employee-archives/{archiveId}/photo`

**接口说明**: 上传员工照片

**权限要求**: HR_SPECIALIST

**请求头**: 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**路径参数**:
- `archiveId` (Long): 档案ID

**请求参数**:
- `file` (File, 必填): 照片文件

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "photoUrl": "https://example.com/photos/20230101010101.jpg"
  },
  "timestamp": 1699000000000
}
```

### 人力资源档案登记复核

#### 1. 获取待复核档案列表

**接口地址**: `GET /api/employee-archives/pending-review`

**接口说明**: 获取所有待复核的员工档案列表

**权限要求**: HR_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `page` (Integer, 可选): 页码，默认1
- `size` (Integer, 可选): 每页数量，默认10

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 2,
    "list": [
      {
        "archiveId": 1,
        "archiveNumber": "20230101010101",
        "name": "张明",
        "orgFullPath": "技术中心/产品研发部/前端组",
        "positionName": "前端工程师",
        "registrationTime": "2023-07-15T09:30:00",
        "registrarName": "王管理员",
        "status": "PENDING_REVIEW"
      }
    ]
  },
  "timestamp": 1699000000000
}
```

#### 2. 获取档案详情

**接口地址**: `GET /api/employee-archives/{archiveId}`

**接口说明**: 获取员工档案详情

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `archiveId` (Long): 档案ID

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "archiveId": 1,
    "archiveNumber": "20230101010101",
    "name": "张明",
    "gender": "MALE",
    "idNumber": "110101199001011234",
    "birthday": "1990-01-01",
    "age": 33,
    "nationality": "中国",
    "placeOfBirth": "北京",
    "ethnicity": "汉族",
    "religiousBelief": "无",
    "politicalStatus": "群众",
    "educationLevel": "本科",
    "major": "计算机科学与技术",
    "email": "zhangming@example.com",
    "phone": "010-12345678",
    "qq": "123456789",
    "mobile": "13800138000",
    "address": "北京市朝阳区xxx",
    "postalCode": "100000",
    "hobby": "阅读、编程",
    "personalResume": "2010-2014 就读于XX大学...",
    "familyRelationship": "父亲：XXX，母亲：XXX",
    "remarks": "备注信息",
    "firstOrgId": 1,
    "firstOrgName": "技术中心",
    "secondOrgId": 3,
    "secondOrgName": "产品研发部",
    "thirdOrgId": 6,
    "thirdOrgName": "前端组",
    "orgFullPath": "技术中心/产品研发部/前端组",
    "positionId": 1,
    "positionName": "前端工程师",
    "jobTitle": "INTERMEDIATE",
    "salaryStandardId": 1,
    "photoUrl": "https://example.com/photo.jpg",
    "registrarId": 2,
    "registrarName": "王管理员",
    "registrationTime": "2023-07-15T09:30:00",
    "status": "PENDING_REVIEW"
  },
  "timestamp": 1699000000000
}
```

#### 3. 复核档案（通过）

**接口地址**: `POST /api/employee-archives/{archiveId}/review/approve`

**接口说明**: 人事经理复核档案，通过审核

**权限要求**: HR_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `archiveId` (Long): 档案ID

**请求参数**:

```json
{
  "reviewComments": "审核通过，信息无误"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "复核通过",
  "data": {
    "archiveId": 1,
    "status": "NORMAL",
    "reviewTime": "2023-07-15T10:00:00"
  },
  "timestamp": 1699000000000
}
```

#### 4. 复核档案（修改后通过）

**接口地址**: `PUT /api/employee-archives/{archiveId}/review`

**接口说明**: 人事经理复核档案时修改信息（档案编号、所属机构、职位不能修改）

**权限要求**: HR_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `archiveId` (Long): 档案ID

**请求参数**:

```json
{
  "name": "张明（修正）",
  "email": "zhangming_new@example.com",
  "reviewComments": "已修正邮箱信息",
  "approve": true
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "复核通过",
  "data": {
    "archiveId": 1,
    "status": "NORMAL",
    "reviewTime": "2023-07-15T10:00:00"
  },
  "timestamp": 1699000000000
}
```

### 人力资源档案查询

#### 1. 查询员工档案

**接口地址**: `GET /api/employee-archives`

**接口说明**: 根据条件查询员工档案

**权限要求**: HR_SPECIALIST, HR_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `firstOrgId` (Long, 可选): 一级机构ID
- `secondOrgId` (Long, 可选): 二级机构ID
- `thirdOrgId` (Long, 可选): 三级机构ID
- `positionId` (Long, 可选): 职位ID
- `startDate` (String, 可选): 建档起始日期，格式：yyyy-MM-dd
- `endDate` (String, 可选): 建档结束日期，格式：yyyy-MM-dd
- `status` (String, 可选): 状态，PENDING_REVIEW(待复核), NORMAL(正常), DELETED(已删除)
- `page` (Integer, 可选): 页码，默认1
- `size` (Integer, 可选): 每页数量，默认10

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 10,
    "list": [
      {
        "archiveId": 1,
        "archiveNumber": "20230101010101",
        "name": "张明",
        "orgFullPath": "技术中心/产品研发部/前端组",
        "positionName": "前端工程师",
        "registrationTime": "2023-07-15T09:30:00",
        "status": "NORMAL"
      }
    ]
  },
  "timestamp": 1699000000000
}
```

### 人力资源档案变更

#### 1. 更新员工档案

**接口地址**: `PUT /api/employee-archives/{archiveId}`

**接口说明**: 人事专员更新员工档案。档案编号、所属机构、职位不能修改，其他信息均可修改。变更后档案状态变为"待复核"，需要人事经理复核后才能生效。

**权限要求**: HR_SPECIALIST

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `archiveId` (Long): 档案ID

**请求参数**:

**注意**: 以下字段不能修改（即使传入也会被忽略）：
- `archiveNumber` - 档案编号
- `firstOrgId`, `secondOrgId`, `thirdOrgId` - 所属机构
- `positionId` - 职位

**可修改字段**:

```json
{
  "name": "张明",
  "gender": "MALE",
  "idNumber": "110101199001011234",
  "birthday": "1990-01-01",
  "age": 33,
  "nationality": "中国",
  "placeOfBirth": "北京",
  "ethnicity": "汉族",
  "religiousBelief": "无",
  "politicalStatus": "群众",
  "educationLevel": "本科",
  "major": "计算机科学与技术",
  "email": "zhangming_new@example.com",
  "phone": "010-12345678",
  "qq": "123456789",
  "mobile": "13900139000",
  "address": "北京市朝阳区xxx（更新）",
  "postalCode": "100000",
  "hobby": "阅读、编程、旅游",
  "personalResume": "2010-2014 就读于XX大学...",
  "familyRelationship": "父亲：XXX，母亲：XXX",
  "remarks": "备注信息（更新）",
  "jobTitle": "INTERMEDIATE",
  "salaryStandardId": 2
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 姓名 |
| gender | String | 是 | 性别，MALE(男) 或 FEMALE(女) |
| idNumber | String | 否 | 身份证号码 |
| birthday | String | 否 | 出生日期，格式：yyyy-MM-dd |
| age | Integer | 否 | 年龄，根据出生日期自动计算 |
| nationality | String | 否 | 国籍 |
| placeOfBirth | String | 否 | 出生地 |
| ethnicity | String | 否 | 民族 |
| religiousBelief | String | 否 | 宗教信仰 |
| politicalStatus | String | 否 | 政治面貌 |
| educationLevel | String | 否 | 学历 |
| major | String | 否 | 专业 |
| email | String | 否 | 邮箱 |
| phone | String | 否 | 电话 |
| qq | String | 否 | QQ号 |
| mobile | String | 否 | 手机号 |
| address | String | 否 | 住址 |
| postalCode | String | 否 | 邮编 |
| hobby | String | 否 | 爱好 |
| personalResume | String | 否 | 个人履历 |
| familyRelationship | String | 否 | 家庭关系信息 |
| remarks | String | 否 | 备注 |
| jobTitle | String | 否 | 职称，JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级) |
| salaryStandardId | Long | 否 | 薪酬标准ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功，等待复核",
  "data": {
    "archiveId": 1,
    "archiveNumber": "20230101010101",
    "status": "PENDING_REVIEW",
    "updateTime": "2023-07-20T14:30:00"
  },
  "timestamp": 1699000000000
}
```

**业务规则**:

1. 只有状态为"正常"（NORMAL）的档案才能进行变更
2. 档案编号、所属机构、职位在变更时不能修改，如需修改应在调动管理模块中进行
3. 变更后档案状态自动变为"待复核"（PENDING_REVIEW）
4. 需要人事经理复核后，变更才能生效
5. 如果修改了职称或薪酬标准，系统会自动更新关联的薪酬标准

### 人力资源档案删除管理

#### 1. 删除员工档案

**接口地址**: `DELETE /api/employee-archives/{archiveId}`

**接口说明**: 删除员工档案（软删除，设置状态为DELETED）

**权限要求**: HR_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `archiveId` (Long): 档案ID

**请求参数**:

```json
{
  "deleteReason": "员工离职"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "archiveId": 1,
    "status": "DELETED",
    "deleteTime": "2023-05-20T16:45:00",
    "deleteReason": "员工离职"
  },
  "timestamp": 1699000000000
}
```

#### 2. 获取已删除档案列表

**接口地址**: `GET /api/employee-archives/deleted`

**接口说明**: 获取所有已删除的员工档案列表

**权限要求**: HR_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `page` (Integer, 可选): 页码，默认1
- `size` (Integer, 可选): 每页数量，默认10

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 2,
    "list": [
      {
        "archiveId": 1,
        "archiveNumber": "20200101010101",
        "name": "王强",
        "deleteTime": "2023-05-20T16:45:00",
        "deleteReason": "员工离职",
        "status": "DELETED"
      }
    ]
  },
  "timestamp": 1699000000000
}
```

#### 3. 恢复员工档案

**接口地址**: `POST /api/employee-archives/{archiveId}/restore`

**接口说明**: 恢复已删除的员工档案

**权限要求**: HR_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `archiveId` (Long): 档案ID

**响应示例**:

```json
{
  "code": 200,
  "message": "恢复成功",
  "data": {
    "archiveId": 1,
    "status": "NORMAL"
  },
  "timestamp": 1699000000000
}
```

---

## 薪酬管理

### 薪酬标准管理

#### 1. 创建薪酬标准

**接口地址**: `POST /api/salary-standards`

**接口说明**: 薪酬专员登记薪酬标准

**权限要求**: SALARY_SPECIALIST, SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:

```json
{
  "standardName": "前端工程师-中级标准",
  "positionId": 1,
  "jobTitle": "INTERMEDIATE",
  "formulatorId": 4,
  "items": [
    {
      "itemId": 1,
      "amount": 12000.00
    },
    {
      "itemId": 2,
      "amount": 2000.00
    },
    {
      "itemId": 3,
      "amount": 500.00
    },
    {
      "itemId": 6,
      "amount": 0.00,
      "isCalculated": true
    }
  ]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登记成功",
  "data": {
    "standardId": 1,
    "standardCode": "SAL202307001",
    "standardName": "前端工程师-中级标准",
    "positionId": 1,
    "jobTitle": "INTERMEDIATE",
    "status": "PENDING_REVIEW"
  },
  "timestamp": 1699000000000
}
```

#### 2. 获取待复核薪酬标准列表

**接口地址**: `GET /api/salary-standards/pending-review`

**接口说明**: 获取所有待复核的薪酬标准列表

**权限要求**: SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `page` (Integer, 可选): 页码，默认1
- `size` (Integer, 可选): 每页数量，默认10

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 2,
    "list": [
      {
        "standardId": 1,
        "standardCode": "SAL202307001",
        "standardName": "前端工程师-中级标准",
        "positionName": "前端工程师",
        "formulatorName": "张经理",
        "registrationTime": "2023-07-15T09:30:00",
        "status": "PENDING_REVIEW"
      }
    ]
  },
  "timestamp": 1699000000000
}
```

#### 3. 获取薪酬标准详情

**接口地址**: `GET /api/salary-standards/{standardId}`

**接口说明**: 获取薪酬标准详情，包含所有薪酬项目明细

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `standardId` (Long): 薪酬标准ID

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "standardId": 1,
    "standardCode": "SAL202307001",
    "standardName": "前端工程师-中级标准",
    "positionId": 1,
    "positionName": "前端工程师",
    "jobTitle": "INTERMEDIATE",
    "formulatorId": 4,
    "formulatorName": "张经理",
    "registrarId": 4,
    "registrarName": "张经理",
    "registrationTime": "2023-07-15T09:30:00",
    "status": "PENDING_REVIEW",
    "items": [
      {
        "itemId": 1,
        "itemCode": "S001",
        "itemName": "基本工资",
        "itemType": "INCOME",
        "amount": 12000.00,
        "isCalculated": false
      },
      {
        "itemId": 2,
        "itemCode": "S002",
        "itemName": "绩效奖金",
        "itemType": "INCOME",
        "amount": 2000.00,
        "isCalculated": false
      },
      {
        "itemId": 6,
        "itemCode": "S006",
        "itemName": "养老保险",
        "itemType": "DEDUCTION",
        "amount": 960.00,
        "isCalculated": true,
        "calculationRule": "基本工资*8%"
      }
    ]
  },
  "timestamp": 1699000000000
}
```

#### 4. 复核薪酬标准（通过）

**接口地址**: `POST /api/salary-standards/{standardId}/review/approve`

**接口说明**: 薪酬经理复核薪酬标准，通过审核

**权限要求**: SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `standardId` (Long): 薪酬标准ID

**请求参数**:

```json
{
  "reviewComments": "审核通过，标准合理"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "复核通过",
  "data": {
    "standardId": 1,
    "status": "APPROVED",
    "reviewTime": "2023-07-15T10:00:00"
  },
  "timestamp": 1699000000000
}
```

#### 5. 复核薪酬标准（驳回）

**接口地址**: `POST /api/salary-standards/{standardId}/review/reject`

**接口说明**: 薪酬经理复核薪酬标准，驳回

**权限要求**: SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `standardId` (Long): 薪酬标准ID

**请求参数**:

```json
{
  "reviewComments": "标准金额过高，需要调整"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "已驳回",
  "data": {
    "standardId": 1,
    "status": "REJECTED",
    "reviewTime": "2023-07-15T10:00:00"
  },
  "timestamp": 1699000000000
}
```

#### 6. 查询薪酬标准

**接口地址**: `GET /api/salary-standards`

**接口说明**: 根据条件查询薪酬标准

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `standardCode` (String, 可选): 薪酬标准编号，支持模糊查询
- `keyword` (String, 可选): 关键字，在标准名称、制定人、变更人、复核人字段中匹配
- `startDate` (String, 可选): 登记起始日期，格式：yyyy-MM-dd
- `endDate` (String, 可选): 登记结束日期，格式：yyyy-MM-dd
- `status` (String, 可选): 状态，PENDING_REVIEW(待复核), APPROVED(已通过), REJECTED(已驳回)
- `positionId` (Long, 可选): 职位ID
- `jobTitle` (String, 可选): 职称，JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级)
- `page` (Integer, 可选): 页码，默认1
- `size` (Integer, 可选): 每页数量，默认10

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 5,
    "list": [
      {
        "standardId": 1,
        "standardCode": "SAL202307001",
        "standardName": "前端工程师-中级标准",
        "positionName": "前端工程师",
        "jobTitle": "INTERMEDIATE",
        "formulatorName": "张经理",
        "registrationTime": "2023-07-15T09:30:00",
        "status": "APPROVED"
      }
    ]
  },
  "timestamp": 1699000000000
}
```

#### 7. 更新薪酬标准

**接口地址**: `PUT /api/salary-standards/{standardId}`

**接口说明**: 更新薪酬标准（变更后需要重新复核）

**权限要求**: SALARY_SPECIALIST, SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `standardId` (Long): 薪酬标准ID

**请求参数**:

```json
{
  "standardName": "前端工程师-中级标准（更新）",
  "items": [
    {
      "itemId": 1,
      "amount": 13000.00
    }
  ]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功，等待复核",
  "data": {
    "standardId": 1,
    "status": "PENDING_REVIEW"
  },
  "timestamp": 1699000000000
}
```

#### 8. 根据职位和职称获取薪酬标准

**接口地址**: `GET /api/salary-standards/by-position`

**接口说明**: 根据职位ID和职称获取已通过的薪酬标准（用于员工档案登记时选择）

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `positionId` (Long, 必填): 职位ID
- `jobTitle` (String, 必填): 职称，JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级)

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "standardId": 1,
    "standardCode": "SAL202307001",
    "standardName": "前端工程师-中级标准",
    "positionId": 1,
    "jobTitle": "INTERMEDIATE",
    "status": "APPROVED"
  },
  "timestamp": 1699000000000
}
```

### 薪酬发放管理

#### 1. 获取待登记薪酬发放单列表

**接口地址**: `GET /api/salary-issuances/pending-registration`

**接口说明**: 按三级机构列出需要进行发放登记的薪酬发放单

**权限要求**: SALARY_SPECIALIST

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `issuanceMonth` (String, 可选): 发放月份，格式：yyyy-MM，默认当前月份
- `thirdOrgId` (Long, 可选): 三级机构ID

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "thirdOrgId": 6,
      "thirdOrgName": "前端组",
      "orgFullPath": "技术中心/产品研发部/前端组",
      "totalEmployees": 15,
      "totalBasicSalary": 180000.00,
      "salarySlipNumber": null,
      "status": "PENDING_REGISTRATION"
    }
  ],
  "timestamp": 1699000000000
}
```

#### 2. 登记薪酬发放单

**接口地址**: `POST /api/salary-issuances`

**接口说明**: 薪酬专员登记薪酬发放单

**权限要求**: SALARY_SPECIALIST

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:

```json
{
  "thirdOrgId": 6,
  "issuanceMonth": "2023-07",
  "details": [
    {
      "employeeId": 1,
      "awardAmount": 0.00,
      "deductionAmount": 0.00
    },
    {
      "employeeId": 2,
      "awardAmount": 500.00,
      "deductionAmount": 0.00
    }
  ]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登记成功",
  "data": {
    "issuanceId": 1,
    "salarySlipNumber": "PAY202307001",
    "thirdOrgId": 6,
    "totalEmployees": 15,
    "totalBasicSalary": 180000.00,
    "totalNetPay": 180000.00,
    "issuanceMonth": "2023-07-01",
    "status": "PENDING_REVIEW"
  },
  "timestamp": 1699000000000
}
```

#### 3. 获取薪酬发放单详情

**接口地址**: `GET /api/salary-issuances/{issuanceId}`

**接口说明**: 获取薪酬发放单详情，包含所有员工明细

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `issuanceId` (Long): 薪酬发放单ID

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "issuanceId": 1,
    "salarySlipNumber": "PAY202307001",
    "thirdOrgId": 6,
    "thirdOrgName": "前端组",
    "orgFullPath": "技术中心/产品研发部/前端组",
    "totalEmployees": 15,
    "totalBasicSalary": 180000.00,
    "totalNetPay": 180000.00,
    "issuanceMonth": "2023-07-01",
    "registrarName": "张经理",
    "registrationTime": "2023-07-15T09:30:00",
    "status": "PENDING_REVIEW",
    "details": [
      {
        "detailId": 1,
        "employeeId": 1,
        "employeeNumber": "EMP001",
        "employeeName": "张明",
        "positionName": "前端工程师",
        "basicSalary": 12000.00,
        "performanceBonus": 2000.00,
        "transportationAllowance": 0.00,
        "mealAllowance": 300.00,
        "pensionInsurance": 960.00,
        "medicalInsurance": 243.00,
        "unemploymentInsurance": 60.00,
        "housingFund": 960.00,
        "awardAmount": 0.00,
        "deductionAmount": 0.00,
        "totalIncome": 14300.00,
        "totalDeduction": 2223.00,
        "netPay": 12077.00
      }
    ]
  },
  "timestamp": 1699000000000
}
```

#### 4. 获取待复核薪酬发放单列表

**接口地址**: `GET /api/salary-issuances/pending-review`

**接口说明**: 获取所有待复核的薪酬发放单列表

**权限要求**: SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `page` (Integer, 可选): 页码，默认1
- `size` (Integer, 可选): 每页数量，默认10

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 2,
    "list": [
      {
        "issuanceId": 1,
        "salarySlipNumber": "PAY202307001",
        "orgFullPath": "技术中心/产品研发部/前端组",
        "totalEmployees": 15,
        "totalBasicSalary": 180000.00,
        "registrationTime": "2023-07-15T09:30:00",
        "status": "PENDING_REVIEW"
      }
    ]
  },
  "timestamp": 1699000000000
}
```

#### 5. 复核薪酬发放单（通过）

**接口地址**: `POST /api/salary-issuances/{issuanceId}/review/approve`

**接口说明**: 薪酬经理复核薪酬发放单，通过审核（可修改奖励金额和应扣金额）

**权限要求**: SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `issuanceId` (Long): 薪酬发放单ID

**请求参数**:

```json
{
  "details": [
    {
      "detailId": 1,
      "awardAmount": 500.00,
      "deductionAmount": 0.00
    }
  ]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "复核通过",
  "data": {
    "issuanceId": 1,
    "status": "EXECUTED",
    "reviewTime": "2023-07-15T10:00:00"
  },
  "timestamp": 1699000000000
}
```

#### 6. 复核薪酬发放单（驳回）

**接口地址**: `POST /api/salary-issuances/{issuanceId}/review/reject`

**接口说明**: 薪酬经理复核薪酬发放单，驳回

**权限要求**: SALARY_MANAGER

**请求头**: 
- `Authorization: Bearer {token}`

**路径参数**:
- `issuanceId` (Long): 薪酬发放单ID

**请求参数**:

```json
{
  "rejectReason": "金额计算有误，需要重新计算"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "已驳回",
  "data": {
    "issuanceId": 1,
    "status": "REJECTED"
  },
  "timestamp": 1699000000000
}
```

#### 7. 查询薪酬发放单

**接口地址**: `GET /api/salary-issuances`

**接口说明**: 根据条件查询薪酬发放单

**请求头**: 
- `Authorization: Bearer {token}`

**请求参数**:
- `salarySlipNumber` (String, 可选): 薪酬单号，支持模糊查询
- `keyword` (String, 可选): 关键字，在机构名称等字段中匹配
- `startDate` (String, 可选): 发放起始日期，格式：yyyy-MM-dd
- `endDate` (String, 可选): 发放结束日期，格式：yyyy-MM-dd
- `status` (String, 可选): 状态，PENDING_REGISTRATION(待登记), PENDING_REVIEW(待复核), EXECUTED(执行), PAID(已付款)
- `thirdOrgId` (Long, 可选): 三级机构ID
- `page` (Integer, 可选): 页码，默认1
- `size` (Integer, 可选): 每页数量，默认10

**响应示例**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 5,
    "list": [
      {
        "issuanceId": 1,
        "salarySlipNumber": "PAY202307001",
        "orgFullPath": "技术中心/产品研发部/前端组",
        "totalEmployees": 15,
        "totalBasicSalary": 180000.00,
        "totalNetPay": 180000.00,
        "issuanceMonth": "2023-07-01",
        "issuanceTime": "2023-07-15",
        "status": "EXECUTED",
        "paymentStatus": "PAID"
      }
    ]
  },
  "timestamp": 1699000000000
}
```

---

## 附录

### 枚举值说明

#### 性别 (Gender)
- `MALE`: 男
- `FEMALE`: 女

#### 职称 (JobTitle)
- `JUNIOR`: 初级
- `INTERMEDIATE`: 中级
- `SENIOR`: 高级

#### 档案状态 (ArchiveStatus)
- `PENDING_REVIEW`: 待复核
- `NORMAL`: 正常
- `DELETED`: 已删除

#### 薪酬标准状态 (SalaryStandardStatus)
- `PENDING_REVIEW`: 待复核
- `APPROVED`: 已通过
- `REJECTED`: 已驳回

#### 薪酬发放状态 (SalaryIssuanceStatus)
- `PENDING_REGISTRATION`: 待登记
- `PENDING_REVIEW`: 待复核
- `EXECUTED`: 执行
- `PAID`: 已付款
- `REJECTED`: 已驳回

#### 付款状态 (PaymentStatus)
- `PENDING`: 待付款
- `PAID`: 已付款

#### 机构状态 (OrgStatus)
- `ACTIVE`: 激活
- `INACTIVE`: 禁用

#### 用户状态 (UserStatus)
- `ACTIVE`: 激活
- `INACTIVE`: 禁用

#### 薪酬项目类型 (SalaryItemType)
- `INCOME`: 收入项
- `DEDUCTION`: 扣除项

### 日期时间格式

- 日期格式: `yyyy-MM-dd` (例如: 2023-07-15)
- 日期时间格式: `yyyy-MM-ddTHH:mm:ss` (例如: 2023-07-15T09:30:00)
- 月份格式: `yyyy-MM` (例如: 2023-07)

### 分页参数

所有支持分页的接口都使用以下参数：
- `page`: 页码，从1开始，默认1
- `size`: 每页数量，默认10

分页响应格式：
```json
{
  "total": 100,
  "list": [...]
}
```

### 文件上传

文件上传接口使用 `multipart/form-data` 格式，字段名为 `file`。

### 注意事项

1. 所有需要认证的接口都需要在请求头中携带 `Authorization: Bearer {token}`
2. 权限要求基于用户角色，具体权限见各接口说明
3. 档案编号、所属机构、职位在复核和变更时不能修改
4. 薪酬标准中的三险一金（养老保险、医疗保险、失业保险、住房公积金）会根据基本工资自动计算
5. 已删除的档案可以恢复，恢复后状态变为NORMAL
6. 薪酬发放单复核通过后状态为EXECUTED，具体的付款由财务系统完成

