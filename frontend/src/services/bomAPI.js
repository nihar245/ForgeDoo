import api from '../config/api'

export const bomAPI = {
  // Get all BOMs
  getAll: async () => {
    const response = await api.get('/boms', {
      params: { _t: Date.now() }, // Cache busting parameter
      headers: { 'Cache-Control': 'no-cache' }
    })
    return response.data
  },

  // Get BOM by ID
  getById: async (id) => {
    const response = await api.get(`/boms/${id}`, {
      params: { _t: Date.now() }, // Cache busting parameter
      headers: { 'Cache-Control': 'no-cache' }
    })
    return response.data
  },

  // Get BOM references
  getReferences: async () => {
    const response = await api.get('/boms/refs/all', {
      params: { _t: Date.now() }, // Cache busting parameter
      headers: { 'Cache-Control': 'no-cache' }
    })
    return response.data
  },

  // Create or update BOM (upsert)
  upsert: async (bomData) => {
    const response = await api.post('/boms/upsert', bomData)
    return response.data
  },

  // Create new BOM
  create: async (bomData) => {
    const response = await api.post('/boms', bomData)
    return response.data
  },

  // Update BOM
  update: async (id, bomData) => {
    const response = await api.put(`/boms/${id}`, bomData)
    return response.data
  },

  // Delete BOM
  delete: async (id) => {
    const response = await api.delete(`/boms/${id}`)
    return response.data
  }
}

export default bomAPI