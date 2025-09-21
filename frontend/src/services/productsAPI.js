import api from '../config/api'

export const productsAPI = {
  // Get all products
  getAll: async () => {
    const response = await api.get('/products')
    return { data: response.data.items } // Convert items to data format for consistency
  },

  // Get product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  // Create new product
  create: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  // Update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  // Get raw materials only
  getRawMaterials: async () => {
    const response = await api.get('/products?category=raw_material')
    return { data: response.data.items } // Convert items to data format for consistency
  },

  // Get finished products only
  getFinishedProducts: async () => {
    const response = await api.get('/products?category=finished')
    return { data: response.data.items } // Convert items to data format for consistency
  }
}

export default productsAPI