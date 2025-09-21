import api from '../config/api'

export const workCentersAPI = {
  // Get all work centers
  getAll: async () => {
    const response = await api.get('/work-centers')
    return response.data
  },

  // Get work center by ID
  getById: async (id) => {
    const response = await api.get(`/work-centers/${id}`)
    return response.data
  },

  // Get work center costs
  getCosts: async () => {
    const response = await api.get('/work-centers/costs')
    return response.data
  },

  // Create work center
  create: async (workCenterData) => {
    const response = await api.post('/work-centers', workCenterData)
    return response.data
  },

  // Update work center
  update: async (id, workCenterData) => {
    const response = await api.put(`/work-centers/${id}`, workCenterData)
    return response.data
  },

  // Delete work center
  delete: async (id) => {
    const response = await api.delete(`/work-centers/${id}`)
    return response.data
  }
}

export default workCentersAPI