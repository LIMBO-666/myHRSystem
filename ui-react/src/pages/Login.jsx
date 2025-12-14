import React, { useState, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { statisticsService } from '../services/statisticsService'
import './Login.css'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ employees: 0, departments: 0, positions: 0 })

  // 从数据库获取统计数据并播放动画
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await statisticsService.getDashboardStatistics()
        if (response.code === 200 && response.data) {
          const targetStats = {
            employees: response.data.employees || 0,
            departments: response.data.departments || 0,
            positions: response.data.positions || 0
          }
          
          // 数字递增动画
          const duration = 2000
          const steps = 60
          const stepTime = duration / steps
          
          let currentStep = 0
          const interval = setInterval(() => {
            currentStep++
            const progress = currentStep / steps
            const easeOut = 1 - Math.pow(1 - progress, 3)
            
            setStats({
              employees: Math.floor(targetStats.employees * easeOut),
              departments: Math.floor(targetStats.departments * easeOut),
              positions: Math.floor(targetStats.positions * easeOut)
            })
            
            if (currentStep >= steps) {
              clearInterval(interval)
            }
          }, stepTime)
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        // 如果获取失败，使用默认值
        const targetStats = { employees: 0, departments: 0, positions: 0 }
        setStats(targetStats)
      }
    }

    loadStatistics()
  }, [])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const result = await login(values.username, values.password)
      if (result.success) {
        message.success('登录成功')
        navigate('/')
      } else {
        message.error(result.message || '登录失败')
      }
    } catch (error) {
      message.error('登录失败：' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* 背景动态元素 */}
      <div className="animated-background">
        {/* 移动的渐变圆形 */}
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        <div className="bg-circle circle-4"></div>
        
        {/* 流动的线条 */}
        <div className="flowing-line line-1"></div>
        <div className="flowing-line line-2"></div>
        <div className="flowing-line line-3"></div>
        
        {/* 粒子效果 */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
        
        {/* 闪烁的星星 */}
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`star star-${i + 1}`}></div>
        ))}
      </div>

      {/* 浮动图标 */}
      <div className="floating-icons">
        <div className="floating-icon icon-1">👥</div>
        <div className="floating-icon icon-2">📊</div>
        <div className="floating-icon icon-3">💼</div>
        <div className="floating-icon icon-4">📋</div>
        <div className="floating-icon icon-5">💰</div>
        <div className="floating-icon icon-6">📈</div>
      </div>

      <div className="login-left">
        <div className="artistic-title">
          <div className="artistic-text-main">Human Resource</div>
          <div className="artistic-text-sub">Management System</div>
          <div className="artistic-text-en">HRMS</div>
        </div>
        <h1 className="welcome-text">Welcome Back .!</h1>
        <div className="hr-stats">
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.employees.toLocaleString()}</div>
              <div className="stat-label">员工总数</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <div className="stat-number">{stats.departments}</div>
              <div className="stat-label">部门机构</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <div className="stat-number">{stats.positions}</div>
              <div className="stat-label">职位岗位</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="login-card">
        {/* 登录卡片装饰元素 */}
        <div className="card-decorations">
          <div className="decoration-circle circle-dec-1"></div>
          <div className="decoration-circle circle-dec-2"></div>
          <div className="decoration-circle circle-dec-3"></div>
          <div className="decoration-line line-dec-1"></div>
          <div className="decoration-line line-dec-2"></div>
          <div className="decoration-icon icon-dec-1">💼</div>
          <div className="decoration-icon icon-dec-2">📊</div>
          <div className="decoration-icon icon-dec-3">👥</div>
          <div className="decoration-icon icon-dec-4">📈</div>
        </div>

        <div className="login-header">
          <div className="header-icon">💰</div>
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Glad you're back.!</p>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          className="login-form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              placeholder="Username"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              placeholder="Password"
              className="login-input password-input"
              iconRender={(visible) => (
                <span className="password-icon">{visible ? '👁️' : '👁️‍🗨️'}</span>
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              loading={loading}
              className="login-button"
              block
            >
              <span className="button-content">
                <span>Login</span>
                <span className="button-arrow">→</span>
              </span>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login

