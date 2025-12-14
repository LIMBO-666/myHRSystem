import apiClient from './api'

/**
 * 薪酬标准管理服务
 */
export const salaryStandardService = {
  /**
   * 创建薪酬标准（登记）
   */
  create: async (data) => {
    return await apiClient.post('/salary-standards', data)
  },

  /**
   * 获取薪酬标准详情
   */
  getDetail: async (standardId) => {
    return await apiClient.get(`/salary-standards/${standardId}`)
  },

  /**
   * 更新薪酬标准
   */
  update: async (standardId, data) => {
    return await apiClient.put(`/salary-standards/${standardId}`, data)
  },

  /**
   * 查询薪酬标准列表
   */
  query: async (params = {}) => {
    // 确保数字参数正确转换为字符串
    const queryParams = {}
    Object.keys(params).forEach(key => {
      const value = params[key]
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = String(value)
      }
    })
    const queryString = new URLSearchParams(queryParams).toString()
    const url = queryString ? `/salary-standards?${queryString}` : '/salary-standards'
    console.log('请求URL:', url)
    return await apiClient.get(url)
  },

  /**
   * 获取待复核薪酬标准列表
   */
  getPendingReviewList: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const url = `/salary-standards/pending-review?${queryString}`
    return await apiClient.get(url)
  },

  /**
   * 复核通过
   */
  approveReview: async (standardId, reviewComments) => {
    return await apiClient.post(`/salary-standards/${standardId}/review/approve`, {
      reviewComments
    })
  },

  /**
   * 复核驳回
   */
  rejectReview: async (standardId, rejectReason) => {
    return await apiClient.post(`/salary-standards/${standardId}/review/reject`, {
      rejectReason
    })
  },

  /**
   * 根据职位和职称获取薪酬标准
   */
  getByPositionAndJobTitle: async (positionId, jobTitle) => {
    return await apiClient.get(`/salary-standards/by-position?positionId=${positionId}&jobTitle=${jobTitle}`)
  }
}

