import React from 'react'
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  UserOutlined,
  LogoutOutlined,
  BankOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import './MainLayout.css'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, hasRole } = useAuth()

  // 根据用户角色生成菜单
  const getMenuItems = () => {
    const items = []

    // 系统管理菜单（系统管理员可见）
    if (hasRole(['SYSTEM_ADMIN'])) {
      const systemMenu = {
        key: 'system',
        icon: <SettingOutlined />,
        label: '系统管理',
        children: [
          { key: '/org-level1', label: '一级机构管理' },
          { key: '/org-level2', label: '二级机构管理' },
          { key: '/org-level3', label: '三级机构管理' },
          { key: '/position', label: '职位管理' }
        ]
      }
      items.push(systemMenu)
    }

    // 员工档案管理
    const archiveMenu = {
      key: 'archive',
      icon: <FileTextOutlined />,
      label: '员工档案管理',
      children: []
    }

    // 档案登记：只有人事专员可以访问
    if (hasRole(['HR_SPECIALIST'])) {
      archiveMenu.children.push({ key: '/archive-register', label: '档案登记' })
    }
    if (hasRole(['HR_MANAGER'])) {
      archiveMenu.children.push({ key: '/archive-review', label: '档案复核' })
    }
    if (hasRole(['HR_SPECIALIST', 'HR_MANAGER'])) {
      archiveMenu.children.push({ key: '/archive-query', label: '档案查询' })
    }
    if (hasRole(['HR_MANAGER'])) {
      archiveMenu.children.push({ key: '/archive-delete', label: '删除管理' })
    }

    if (archiveMenu.children.length > 0) {
      items.push(archiveMenu)
    }

    // 薪酬标准管理
    const salaryStandardMenu = {
      key: 'salary-standard',
      icon: <DollarOutlined />,
      label: '薪酬标准管理',
      children: []
    }

    // 标准登记：只有薪酬专员可以访问
    if (hasRole(['SALARY_SPECIALIST'])) {
      salaryStandardMenu.children.push({ key: '/salary-standard-register', label: '标准登记' })
    }
    // 标准复核：只有薪酬经理可以访问
    if (hasRole(['SALARY_MANAGER'])) {
      salaryStandardMenu.children.push({ key: '/salary-standard-review', label: '标准复核' })
    }
    // 标准查询：薪酬专员和经理都可以访问
    if (hasRole(['SALARY_SPECIALIST', 'SALARY_MANAGER'])) {
      salaryStandardMenu.children.push({ key: '/salary-standard-query', label: '标准查询' })
    }
    // 薪酬项目管理：系统管理员或薪酬经理可以访问
    if (hasRole(['SYSTEM_ADMIN', 'SALARY_MANAGER'])) {
      salaryStandardMenu.children.push({ key: '/salary-item', label: '薪酬项目管理' })
    }

    if (salaryStandardMenu.children.length > 0) {
      items.push(salaryStandardMenu)
    }

    // 薪酬发放管理
    const issuanceMenu = {
      key: 'issuance',
      icon: <TeamOutlined />,
      label: '薪酬发放管理',
      children: []
    }

    // 发放登记：只有薪酬专员可以访问
    if (hasRole(['SALARY_SPECIALIST'])) {
      issuanceMenu.children.push({ key: '/salary-issuance-register', label: '发放登记' })
    }
    if (hasRole(['SALARY_MANAGER'])) {
      issuanceMenu.children.push({ key: '/salary-issuance-review', label: '发放复核' })
    }
    if (hasRole(['SALARY_SPECIALIST', 'SALARY_MANAGER'])) {
      issuanceMenu.children.push({ key: '/salary-issuance-query', label: '发放查询' })
    }

    if (issuanceMenu.children.length > 0) {
      items.push(issuanceMenu)
    }

    return items
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname
    return [path]
  }

  return (
    <Layout className="main-layout">
      <Header className="header">
        <div className="header-left">
          <BankOutlined className="logo-icon" />
          <h1 className="logo-title">人力资源管理系统</h1>
        </div>
        <div className="header-right">
          <span className="username">{user?.realName || user?.username || '未登录'}</span>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="sider">
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            items={getMenuItems()}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Content className="content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout

