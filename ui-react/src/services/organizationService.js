import apiClient from './api'

/**
 * 机构管理服务
 */
export const organizationService = {
  /**
   * 获取一级机构列表
   */
  getLevel1List: async () => {
    return await apiClient.get('/organizations/level1')
  },

  /**
   * 获取二级机构列表（可选parentId）
   */
  getLevel2List: async (parentId) => {
    if (parentId) {
      return await apiClient.get(`/organizations/level2?parentId=${parentId}`)
    } else {
      return await apiClient.get('/organizations/level2/all')
    }
  },

  /**
   * 获取三级机构列表（可选parentId）
   * @param {Number|String} parentId - 父机构ID（二级机构ID）
   * @param {Number|String} firstOrgId - 一级机构ID（可选，用于获取一级机构下的所有三级机构）
   */
  getLevel3List: async (parentId, firstOrgId) => {
    if (firstOrgId) {
      // 如果提供了一级机构ID，获取该一级机构下的所有三级机构
      return await apiClient.get(`/organizations/level3/by-first?firstOrgId=${firstOrgId}`)
    } else if (parentId) {
      // 如果提供了二级机构ID，获取该二级机构下的三级机构
      return await apiClient.get(`/organizations/level3?parentId=${parentId}`)
    } else {
      // 否则获取所有三级机构
      return await apiClient.get('/organizations/level3/all')
    }
  },

  /**
   * 根据机构ID获取机构详情
   */
  getById: async (orgId) => {
    return await apiClient.get(`/organizations/${orgId}`)
  },

  /**
   * 创建一级机构
   */
  createLevel1: async (data) => {
    return await apiClient.post('/organizations/level1', data)
  },

  /**
   * 创建二级机构
   */
  createLevel2: async (data) => {
    return await apiClient.post('/organizations/level2', data)
  },

  /**
   * 创建三级机构
   */
  createLevel3: async (data) => {
    return await apiClient.post('/organizations/level3', data)
  },

  /**
   * 更新机构
   */
  update: async (orgId, data) => {
    return await apiClient.put(`/organizations/${orgId}`, data)
  },

  /**
   * 删除机构
   */
  delete: async (orgId) => {
    return await apiClient.delete(`/organizations/${orgId}`)
  }
}

