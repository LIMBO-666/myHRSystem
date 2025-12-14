import apiClient from './api'

/**
 * 职位管理服务
 */
export const positionService = {
  /**
   * 获取职位列表
   * @param {Object} params - 查询参数 {firstOrgId, secondOrgId, thirdOrgId}
   */
  getList: async (params) => {
    let url = '/positions?'
    const queryParams = []
    
    if (typeof params === 'number' || typeof params === 'string') {
      // 兼容旧版本：只传thirdOrgId
      if (params) {
        queryParams.push(`thirdOrgId=${params}`)
      }
    } else if (params && typeof params === 'object') {
      // 新版本：传对象参数
      if (params.firstOrgId) {
        queryParams.push(`firstOrgId=${params.firstOrgId}`)
      }
      if (params.secondOrgId) {
        queryParams.push(`secondOrgId=${params.secondOrgId}`)
      }
      if (params.thirdOrgId) {
        queryParams.push(`thirdOrgId=${params.thirdOrgId}`)
      }
    }
    
    if (queryParams.length > 0) {
      url += queryParams.join('&')
    } else {
      url = '/positions'
    }
    
    return await apiClient.get(url)
  },

  /**
   * 获取职位详情
   */
  getDetail: async (positionId) => {
    return await apiClient.get(`/positions/${positionId}`)
  },

  /**
   * 创建职位
   */
  create: async (data) => {
    return await apiClient.post('/positions', data)
  },

  /**
   * 更新职位
   */
  update: async (positionId, data) => {
    return await apiClient.put(`/positions/${positionId}`, data)
  },

  /**
   * 删除职位
   */
  delete: async (positionId) => {
    return await apiClient.delete(`/positions/${positionId}`)
  }
}

