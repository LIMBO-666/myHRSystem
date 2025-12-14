import apiClient from './api'

/**
 * 统计信息服务
 */
export const statisticsService = {
  /**
   * 获取系统统计数据
   */
  getDashboardStatistics: async () => {
    return await apiClient.get('/statistics/dashboard')
  }
}

