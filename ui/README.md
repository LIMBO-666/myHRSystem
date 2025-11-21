# 人力资源管理系统 - 前端

## 项目结构

```
ui/
├── index.html          # 主页面
├── login.html          # 登录页面
├── css/
│   └── common.css      # 通用样式
├── js/
│   ├── api.js          # API接口封装
│   ├── common.js       # 通用工具函数
│   ├── main.js         # 主入口文件
│   ├── org-level1.js   # 一级机构管理
│   ├── org-level2.js   # 二级机构管理
│   ├── org-level3.js   # 三级机构管理
│   ├── position.js     # 职位管理
│   └── salary-item.js  # 薪酬项目管理
└── README.md           # 说明文档
```

## 功能模块

### 1. 一级机构管理
- 添加一级机构
- 编辑一级机构名称
- 查看一级机构列表

### 2. 二级机构管理
- 选择一级机构
- 添加二级机构
- 编辑二级机构
- 查看二级机构列表（显示所属一级机构）

### 3. 三级机构管理
- 选择二级机构
- 添加三级机构
- 编辑三级机构
- 查看三级机构列表（显示完整机构路径）

### 4. 职位设置
- 新增职位
- 编辑职位信息
- 删除职位
- 查看职位列表（显示所属三级机构完整路径）

### 5. 薪酬项目管理
- 新增薪酬项目
- 编辑薪酬项目
- 删除薪酬项目
- 查看薪酬项目列表

## 使用方法

### 🎯 方式一：使用Mock API（无需后端，推荐用于前端开发测试）

1. **直接打开页面**
   - 双击 `demo.html` 查看演示说明
   - 或直接打开 `login.html` 开始使用

2. **使用本地服务器（推荐）**
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 使用Node.js
   npx http-server -p 8000
   ```
   然后访问 `http://localhost:8000/login.html`

3. **Mock模式说明**
   - Mock API已默认启用（`js/mock-api.js` 中 `USE_MOCK = true`）
   - 所有数据保存在浏览器LocalStorage中
   - 刷新页面后数据仍然保留
   - 可以完整测试所有前端功能

### 🔌 方式二：连接真实后端API

1. **启动后端服务**
   确保后端API服务已启动，默认地址：`http://localhost:8080/api`

2. **关闭Mock模式**
   修改 `js/mock-api.js` 文件：
   ```javascript
   const USE_MOCK = false; // 改为false
   ```

3. **打开前端页面**
- 直接在浏览器中打开 `login.html` 进行登录
- 或使用本地服务器（推荐）：
  ```bash
  # 使用Python
  python -m http.server 8000
  
  # 使用Node.js
  npx http-server -p 8000
  ```
  然后访问 `http://localhost:8000/login.html`

### 3. 登录
使用数据库中的测试账号登录：
- 用户名：`hr01`，密码：`password123`（人事专员）
- 用户名：`hr02`，密码：`password123`（人事经理）
- 用户名：`salary01`，密码：`password123`（薪酬专员）
- 用户名：`salary02`，密码：`password123`（薪酬经理）
- 用户名：`admin`，密码：`password123`（系统管理员）

### 4. 使用功能
登录成功后，从左侧菜单选择相应的功能模块进行操作。

## API配置

API基础URL在 `js/api.js` 中配置：
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

如需修改API地址，请修改此配置。

## 技术栈

- 原生HTML/CSS/JavaScript
- 无依赖，纯前端实现
- 使用Fetch API进行HTTP请求
- 使用LocalStorage存储Token

## 注意事项

1. **跨域问题**：如果前端和后端不在同一域名/端口，需要后端配置CORS
2. **Token管理**：Token存储在LocalStorage中，退出登录或Token过期会自动清除
3. **错误处理**：所有API请求都有错误处理，失败时会显示错误提示
4. **数据验证**：前端进行了基本的数据验证，但后端也需要进行验证

## 开发说明

### 添加新功能模块

1. 在 `js/` 目录下创建新的JS文件
2. 在 `index.html` 中添加对应的script标签
3. 在 `common.js` 的 `loadPage` 函数中添加路由
4. 在侧边栏菜单中添加链接

### 样式定制

所有样式都在 `css/common.css` 中，可以根据需要修改：
- 主题色：`#1890ff`
- 成功色：`#52c41a`
- 错误色：`#ff4d4f`
- 警告色：`#faad14`

## 浏览器兼容性

- Chrome/Edge（推荐）
- Firefox
- Safari
- 不支持IE浏览器

