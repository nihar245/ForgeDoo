import api from '../config/api'

export const reportsAPI = {
  // Get dashboard analytics
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  // Get production reports
  getProduction: async (params = {}) => {
    const response = await api.get('/reports/production', { params })
    return response.data
  },

  // Get inventory reports
  getInventory: async (params = {}) => {
    const response = await api.get('/reports/inventory', { params })
    return response.data
  },

  // Get user reports
  getUserReports: async () => {
    const response = await api.get('/me/reports/work-orders')
    return response.data
  },

  // Export reports
  exportReport: async (type, params = {}) => {
    const response = await api.get(`/reports/${type}/export`, { 
      params,
      responseType: 'blob'
    })
    return response.data
  }
}

export default reportsAPI