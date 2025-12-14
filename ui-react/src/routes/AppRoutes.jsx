import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Login from '../pages/Login'
import MainLayout from '../layouts/MainLayout'
import Loading from '../components/Loading'

// 系统管理
import OrgLevel1 from '../pages/system/OrgLevel1'
import OrgLevel2 from '../pages/system/OrgLevel2'
import OrgLevel3 from '../pages/system/OrgLevel3'
import Position from '../pages/system/Position'
import SalaryItem from '../pages/system/SalaryItem'

// 员工档案管理
import ArchiveRegister from '../pages/archive/ArchiveRegister'
import ArchiveReview from '../pages/archive/ArchiveReview'
import ArchiveQuery from '../pages/archive/ArchiveQuery'
import ArchiveDelete from '../pages/archive/ArchiveDelete'

// 薪酬标准管理
import SalaryStandardRegister from '../pages/salary/SalaryStandardRegister'
import SalaryStandardReview from '../pages/salary/SalaryStandardReview'
import SalaryStandardQuery from '../pages/salary/SalaryStandardQuery'
import SalaryStandardUpdate from '../pages/salary/SalaryStandardUpdate'

// 薪酬发放管理
import SalaryIssuanceRegister from '../pages/issuance/SalaryIssuanceRegister'
import SalaryIssuanceReview from '../pages/issuance/SalaryIssuanceReview'
import SalaryIssuanceQuery from '../pages/issuance/SalaryIssuanceQuery'

// 权限保护组件
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, hasRole, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />
  }

  return children
}

// 根据角色跳转到默认页面
const DefaultRedirect = () => {
  const { user, hasRole } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // 人事专员：跳转到档案登记
  if (hasRole(['HR_SPECIALIST'])) {
    return <Navigate to="/archive-register" replace />
  }
  
  // 人事经理：跳转到档案复核
  if (hasRole(['HR_MANAGER'])) {
    return <Navigate to="/archive-review" replace />
  }
  
  // 薪酬专员：跳转到薪酬标准登记
  if (hasRole(['SALARY_SPECIALIST'])) {
    return <Navigate to="/salary-standard-register" replace />
  }
  
  // 薪酬经理：跳转到薪酬标准复核
  if (hasRole(['SALARY_MANAGER'])) {
    return <Navigate to="/salary-standard-review" replace />
  }
  
  // 默认跳转到登录页（如果没有匹配的角色）
  return <Navigate to="/login" replace />
}

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* 系统管理 - 只有人力资源经理可以访问 */}
        <Route path="org-level1" element={<ProtectedRoute roles={['HR_MANAGER']}><OrgLevel1 /></ProtectedRoute>} />
        <Route path="org-level2" element={<ProtectedRoute roles={['HR_MANAGER']}><OrgLevel2 /></ProtectedRoute>} />
        <Route path="org-level3" element={<ProtectedRoute roles={['HR_MANAGER']}><OrgLevel3 /></ProtectedRoute>} />
        <Route path="position" element={<ProtectedRoute roles={['HR_MANAGER']}><Position /></ProtectedRoute>} />
        
        {/* 薪酬项目管理 - 只有薪酬经理可以访问 */}
        <Route path="salary-item" element={<ProtectedRoute roles={['SALARY_MANAGER']}><SalaryItem /></ProtectedRoute>} />

        {/* 员工档案管理 */}
        <Route path="archive-register" element={<ProtectedRoute roles={['HR_SPECIALIST']}><ArchiveRegister /></ProtectedRoute>} />
        <Route path="archive-review" element={<ProtectedRoute roles={['HR_MANAGER']}><ArchiveReview /></ProtectedRoute>} />
        <Route path="archive-query" element={<ProtectedRoute roles={['HR_SPECIALIST', 'HR_MANAGER']}><ArchiveQuery /></ProtectedRoute>} />
        <Route path="archive-delete" element={<ProtectedRoute roles={['HR_MANAGER']}><ArchiveDelete /></ProtectedRoute>} />

        {/* 薪酬标准管理 */}
        <Route path="salary-standard-register" element={<ProtectedRoute roles={['SALARY_SPECIALIST']}><SalaryStandardRegister /></ProtectedRoute>} />
        <Route path="salary-standard-review" element={<ProtectedRoute roles={['SALARY_MANAGER']}><SalaryStandardReview /></ProtectedRoute>} />
        <Route path="salary-standard-query" element={<ProtectedRoute roles={['SALARY_SPECIALIST', 'SALARY_MANAGER']}><SalaryStandardQuery /></ProtectedRoute>} />
        <Route path="salary-standard-update" element={<ProtectedRoute roles={['SALARY_SPECIALIST']}><SalaryStandardUpdate /></ProtectedRoute>} />

        {/* 薪酬发放管理 */}
        <Route path="salary-issuance-register" element={<ProtectedRoute roles={['SALARY_SPECIALIST']}><SalaryIssuanceRegister /></ProtectedRoute>} />
        <Route path="salary-issuance-review" element={<ProtectedRoute roles={['SALARY_MANAGER']}><SalaryIssuanceReview /></ProtectedRoute>} />
        <Route path="salary-issuance-query" element={<ProtectedRoute roles={['SALARY_SPECIALIST', 'SALARY_MANAGER']}><SalaryIssuanceQuery /></ProtectedRoute>} />

        {/* 默认路由：根据角色跳转 */}
        <Route index element={<DefaultRedirect />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes

