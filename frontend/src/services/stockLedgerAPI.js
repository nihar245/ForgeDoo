import api from '../config/api'

export const stockLedgerAPI = {
  // Get stock summary
  getSummary: async () => {
    const response = await api.get('/ledger')
    return response.data
  },

  // Add stock entry
  addStock: async (stockData) => {
    const response = await api.post('/ledger/add', stockData)
    return response.data
  },

  // Get stock ledger entries
  getEntries: async (params = {}) => {
    const response = await api.get('/ledger/entries', { params })
    return response.data
  },

  // Get stock by product ID
  getByProduct: async (productId) => {
    const response = await api.get(`/ledger/product/${productId}`)
    return response.data
  }
}

export default stockLedgerAPI