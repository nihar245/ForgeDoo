import api from '../config/api'

export const workOrdersAPI = {
  // Get all work orders
  getAll: async (params = {}) => {
    const response = await api.get('/wos', { 
      params: { ...params, _t: Date.now() }, // Cache busting parameter
      headers: { 'Cache-Control': 'no-cache' }
    })
    return response.data
  },

  // Get work order by ID
  getById: async (id) => {
    const response = await api.get(`/wos/${id}`, {
      params: { _t: Date.now() }, // Cache busting parameter
      headers: { 'Cache-Control': 'no-cache' }
    })
    return response.data
  },

  // Start work order
  start: async (id) => {
    const response = await api.post(`/wos/${id}/start`)
    return response.data
  },

  // Pause work order
  pause: async (id) => {
    const response = await api.post(`/wos/${id}/pause`)
    return response.data
  },

  // Resume work order
  resume: async (id) => {
    const response = await api.post(`/wos/${id}/resume`)
    return response.data
  },

  // Complete work order
  complete: async (id) => {
    const response = await api.post(`/wos/${id}/complete`)
    return response.data
  },

  // Update work order
  update: async (id, woData) => {
    const response = await api.patch(`/wos/${id}`, woData)
    return response.data
  },

  // Assign work order
  assign: async (id, userId) => {
    const response = await api.post(`/wos/${id}/assign`, { userId })
    return response.data
  },

  // Add comment to work order
  addComment: async (id, comment) => {
    const response = await api.post(`/wos/${id}/comment`, { comment })
    return response.data
  },

  // Generate missing work orders for a manufacturing order
  generateForMO: async (moId) => {
    const response = await api.post(`/wos/generate/${moId}`)
    return response.data
  }
}

export default workOrdersAPI