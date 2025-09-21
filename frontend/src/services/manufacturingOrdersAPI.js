import api from '../config/api'

export const manufacturingOrdersAPI = {
  // Get all manufacturing orders
  getAll: async () => {
    console.log('🌐 [API] MO getAll request initiated')
    try {
      const response = await api.get('/mos', {
        params: { _t: Date.now() }, // Cache busting parameter
        headers: { 'Cache-Control': 'no-cache' }
      })
      console.log('✅ [API] MO getAll response received:', { count: response.data?.data?.length || 0 })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO getAll failed:', error)
      throw error
    }
  },

  // Get MO by ID
  getById: async (id) => {
    console.log('🌐 [API] MO getById request initiated:', { id })
    try {
      const response = await api.get(`/mos/${id}`, {
        params: { _t: Date.now() }, // Cache busting parameter
        headers: { 'Cache-Control': 'no-cache' }
      })
      console.log('✅ [API] MO getById response received:', { 
        id, 
        reference: response.data?.data?.reference,
        status: response.data?.data?.status 
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO getById failed:', { id, error })
      throw error
    }
  },

  // Create MO by product
  createByProduct: async (moData) => {
    console.log('🌐 [API] MO createByProduct request initiated:', moData)
    try {
      const response = await api.post('/mos/create/by-product', moData)
      console.log('✅ [API] MO createByProduct response received:', { 
        id: response.data?.data?.id,
        reference: response.data?.data?.reference,
        status: response.data?.data?.status 
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO createByProduct failed:', { moData, error })
      throw error
    }
  },

  // Create MO by BOM
  createByBOM: async (moData) => {
    console.log('🌐 [API] MO createByBOM request initiated:', moData)
    try {
      const response = await api.post('/mos/create/by-bom', moData)
      console.log('✅ [API] MO createByBOM response received:', { 
        id: response.data?.data?.id,
        reference: response.data?.data?.reference,
        status: response.data?.data?.status 
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO createByBOM failed:', { moData, error })
      throw error
    }
  },

  // Confirm MO
  confirm: async (id) => {
    console.log('🌐 [API] MO confirm request initiated:', { id })
    try {
      const response = await api.post(`/mos/${id}/confirm`)
      console.log('✅ [API] MO confirm response received:', { 
        id, 
        status: response.data?.data?.status,
        componentsCount: response.data?.data?.components?.length || 0,
        workOrdersCount: response.data?.data?.work_orders?.length || 0
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO confirm failed:', { id, error })
      throw error
    }
  },

  // Start MO
  start: async (id) => {
    console.log('🌐 [API] MO start request initiated:', { id })
    try {
      const response = await api.post(`/mos/${id}/start`)
      console.log('✅ [API] MO start response received:', { 
        id, 
        status: response.data?.data?.status 
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO start failed:', { id, error })
      throw error
    }
  },

  // Complete MO
  complete: async (id) => {
    console.log('🌐 [API] MO complete request initiated:', { id })
    try {
      const response = await api.post(`/mos/${id}/complete`)
      console.log('✅ [API] MO complete response received:', { 
        id, 
        status: response.data?.data?.status 
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO complete failed:', { id, error })
      throw error
    }
  },

  // Cancel MO
  cancel: async (id) => {
    console.log('🌐 [API] MO cancel request initiated:', { id })
    try {
      const response = await api.post(`/mos/${id}/cancel`)
      console.log('✅ [API] MO cancel response received:', { 
        id, 
        status: response.data?.data?.status 
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO cancel failed:', { id, error })
      throw error
    }
  },

  // Update MO
  update: async (id, moData) => {
    console.log('🌐 [API] MO update request initiated:', { id, moData })
    try {
      const response = await api.put(`/mos/${id}`, moData)
      console.log('✅ [API] MO update response received:', { 
        id, 
        status: response.data?.data?.status 
      })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO update failed:', { id, moData, error })
      throw error
    }
  },

  // Get assignable users (operators)
  getAssignees: async () => {
    console.log('🌐 [API] MO getAssignees request initiated')
    try {
      const response = await api.get('/mos/assignees', {
        params: { _t: Date.now() }, // Cache busting parameter
        headers: { 'Cache-Control': 'no-cache' }
      })
      console.log('✅ [API] MO getAssignees response received:', { count: response.data?.data?.length || 0 })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO getAssignees failed:', error)
      throw error
    }
  },

  // Delete MO
  delete: async (id) => {
    console.log('🌐 [API] MO delete request initiated:', { id })
    try {
      const response = await api.delete(`/mos/${id}`)
      console.log('✅ [API] MO delete response received:', { id })
      return response.data
    } catch (error) {
      console.error('❌ [API] MO delete failed:', { id, error })
      throw error
    }
  }
}

export default manufacturingOrdersAPI