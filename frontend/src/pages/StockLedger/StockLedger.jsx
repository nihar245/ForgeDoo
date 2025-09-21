import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, TrendingDown, TrendingUp, Search, Plus, X } from 'lucide-react'
import { stockLedgerAPI } from '../../services/stockLedgerAPI'
import { productsAPI } from '../../services/productsAPI'
import toast from 'react-hot-toast'

const StockLedger = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stockProducts, setStockProducts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStockData()
  }, [])

  const fetchStockData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch stock summary and products
      const [stockResponse, productsResponse] = await Promise.all([
        stockLedgerAPI.getSummary(),
        productsAPI.getAll()
      ])
      
      if (stockResponse?.data) {
        setStockProducts(Array.isArray(stockResponse.data) ? stockResponse.data : [])
      } else {
        setStockProducts([])
      }
      
      if (productsResponse?.data) {
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : [])
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error)
      setError('Failed to load stock data. Please try again.')
      setStockProducts([])
      setProducts([])
      toast.error('Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = stockProducts.filter(product => {
    // Only apply search filter
    const productName = String(product?.name || '');
    return searchTerm === '' || productName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate summary statistics dynamically from actual stock data
  const summaryStats = stockProducts.reduce((stats, product) => {
    const onHand = Number(product?.on_hand) || 0;
    const incoming = Number(product?.incoming) || 0;
    const outgoing = Number(product?.outgoing) || 0;
    const totalValue = Number(product?.total_value) || 0;

    return {
      totalItems: stats.totalItems + onHand,
      stockIn: stats.stockIn + incoming,
      stockOut: stats.stockOut + outgoing,
      totalValue: stats.totalValue + totalValue
    };
  }, { totalItems: 0, stockIn: 0, stockOut: 0, totalValue: 0 });

  // Calculate low stock threshold dynamically (10% of average stock or minimum 10)
  const averageStock = stockProducts.length > 0 ? summaryStats.totalItems / stockProducts.length : 0;
  const lowStockThreshold = Math.max(Math.floor(averageStock * 0.1), 10);

  const handleCreateStock = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const productId = formData.get('product_id');
      const quantity = formData.get('quantity');
      const unitCost = formData.get('unit_cost');
      
      // Validate required fields
      if (!productId || !quantity) {
        toast.error('Product and quantity are required');
        return;
      }

      const stockData = {
        product_id: parseInt(productId),
        quantity: parseFloat(quantity),
        movement_type: formData.get('movement_type') || 'in',
        reference: formData.get('reference') || null
      };

      // Only include unit_cost if it's provided and valid
      if (unitCost && !isNaN(parseFloat(unitCost))) {
        stockData.unit_cost = parseFloat(unitCost);
      }

      await stockLedgerAPI.addStock(stockData)
      toast.success('Stock entry added successfully')
      
      // Refresh data
      await fetchStockData()
      setShowCreateModal(false)
      e.target.reset()
    } catch (error) {
      console.error('Failed to add stock:', error)
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to add stock entry';
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
            <p className="text-gray-600">Track inventory movements and stock levels</p>
          </div>
        </div>
        <div className="glass p-8 rounded-xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
            <p className="text-gray-600">Track inventory movements and stock levels</p>
          </div>
        </div>
        <div className="glass p-8 rounded-xl text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchStockData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!loading && stockProducts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
            <p className="text-gray-600">Track inventory movements and stock levels</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="neomorphism hover-glow flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-gray-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create First Stock Entry</span>
          </motion.button>
        </div>
        
        <div className="glass p-8 rounded-xl text-center">
          <div className="text-gray-400 mb-4">
            <Package className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Stock Data Found</h3>
          <p className="text-gray-600 mb-4">Start tracking your inventory by adding your first stock entry.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Stock Entry
          </button>
        </div>

        {/* Include the modal for creating first entry */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass max-w-md w-full rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Create Stock Entry</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleCreateStock}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Product *</label>
                    <select
                      name="product_id"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Movement Type *</label>
                      <select
                        name="movement_type"
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      >
                        <option value="in">Stock In</option>
                        <option value="out">Stock Out</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Unit Cost</label>
                      <input
                        type="number"
                        name="unit_cost"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                        placeholder="Enter cost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Reference</label>
                      <input
                        type="text"
                        name="reference"
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:border-slate-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add Stock
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
          <p className="text-gray-600">Track inventory movements and stock levels</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="neomorphism hover-glow flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-gray-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Stock Entry</span>
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalItems.toLocaleString()}</p>
            </div>
            <Package className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock In</p>
              <p className="text-2xl font-bold text-green-600">{summaryStats.stockIn.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Out</p>
              <p className="text-2xl font-bold text-red-600">{summaryStats.stockOut.toLocaleString()}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">₹{summaryStats.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <Package className="w-8 h-8 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="glass p-6 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 hover:border-blue-300 transition-colors"
            />
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="neomorphism px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
        
        {/* Results Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Showing <strong>{filteredProducts.length}</strong> of <strong>{stockProducts.length}</strong> products</span>
          </div>
        </div>
      </div>

      {/* Stock Products Table */}
      <div className="glass rounded-xl overflow-hidden shadow-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Product</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Unit Cost</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Unit</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Total Value</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">On Hand</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Free to Use</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Incoming</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Outgoing</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-slate-100 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                >
                  <td className="py-5 px-6 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{String(product?.name || 'Unknown Product')}</td>
                  <td className="py-5 px-6 text-slate-700 font-medium">₹{Number(product?.unit_cost || 0).toFixed(2)}</td>
                  <td className="py-5 px-6 text-slate-600 font-medium">{String(product?.uom || 'Units')}</td>
                  <td className="py-5 px-6 text-slate-700 font-semibold">₹{Number(product?.total_value || 0).toFixed(2)}</td>
                  <td className="py-5 px-6">
                    <span className={`font-semibold ${Number(product?.on_hand || 0) < lowStockThreshold ? 'text-red-600' : 'text-slate-900'}`}>
                      {Number(product?.on_hand || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-slate-700 font-medium">{Number(product?.free_to_use || 0).toLocaleString()}</td>
                  <td className="py-5 px-6">
                    <span className={`font-medium ${Number(product?.incoming || 0) > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                      {Number(product?.incoming || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`font-medium ${Number(product?.outgoing || 0) > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
                      {Number(product?.outgoing || 0).toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Stock Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass max-w-md w-full rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Add Stock Entry</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateStock}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Product *</label>
                  <select
                    name="product_id"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                  >
                    <option value="">Select product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Movement Type *</label>
                    <select
                      name="movement_type"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                    >
                      <option value="in">Stock In</option>
                      <option value="out">Stock Out</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Unit Cost</label>
                    <input
                      type="number"
                      name="unit_cost"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      placeholder="Enter cost"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reference</label>
                    <input
                      type="text"
                      name="reference"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:border-slate-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StockLedger