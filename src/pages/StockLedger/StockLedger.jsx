import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, TrendingDown, TrendingUp, Search, Filter, Plus, X } from 'lucide-react'

const StockLedger = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stockProducts, setStockProducts] = useState([
    { 
      id: 1, 
      product: 'Dining Table', 
      unitCost: 1200, 
      unit: 'Unit', 
      totalValue: 600000, 
      onHand: 500, 
      freeToUse: 270, 
      incoming: 0, 
      outgoing: 230 
    },
    { 
      id: 2, 
      product: 'Drawer', 
      unitCost: 100, 
      unit: 'Unit', 
      totalValue: 2000, 
      onHand: 20, 
      freeToUse: 20, 
      incoming: 0, 
      outgoing: 0 
    },
    { 
      id: 3, 
      product: 'Chair Set', 
      unitCost: 800, 
      unit: 'Unit', 
      totalValue: 48000, 
      onHand: 60, 
      freeToUse: 45, 
      incoming: 15, 
      outgoing: 5 
    },
    { 
      id: 4, 
      product: 'Coffee Table', 
      unitCost: 600, 
      unit: 'Unit', 
      totalValue: 18000, 
      onHand: 30, 
      freeToUse: 25, 
      incoming: 5, 
      outgoing: 3 
    },
    { 
      id: 5, 
      product: 'Bookshelf', 
      unitCost: 1500, 
      unit: 'Unit', 
      totalValue: 75000, 
      onHand: 50, 
      freeToUse: 40, 
      incoming: 8, 
      outgoing: 12 
    }
  ])

  const filteredProducts = stockProducts.filter(product => {
    // Check search term first
    const matchesSearch = searchTerm === '' || product.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If search doesn't match, exclude this product
    if (!matchesSearch) {
      return false;
    }
    
    // Then apply filter status
    if (filterStatus === 'low-stock') {
      return product.onHand < 50;
    }
    if (filterStatus === 'incoming') {
      return product.incoming > 0;
    }
    if (filterStatus === 'outgoing') {
      return product.outgoing > 0;
    }
    if (filterStatus === 'all') {
      return true;
    }
    
    return true;
  });

  const handleCreateStock = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const product = formData.get('product');
    const unitCost = parseInt(formData.get('unitCost')) || 0;
    const unit = formData.get('unit');
    const onHand = parseInt(formData.get('onHand')) || 0;
    const freeToUse = parseInt(formData.get('freeToUse')) || 0;
    const incoming = parseInt(formData.get('incoming')) || 0;
    const outgoing = parseInt(formData.get('outgoing')) || 0;
    
    const newStock = {
      id: stockProducts.length + 1,
      product,
      unitCost,
      unit,
      totalValue: unitCost * onHand,
      onHand,
      freeToUse,
      incoming,
      outgoing
    };

    setStockProducts([...stockProducts, newStock]);
    setShowCreateModal(false);
    
    // Reset form
    e.target.reset();
  };

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
          <span>Create New Stock</span>
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">1,935</p>
            </div>
            <Package className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <TrendingDown className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock In (Today)</p>
              <p className="text-2xl font-bold text-green-600">510</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-700" />
          </div>
        </div>
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Out (Today)</p>
              <p className="text-2xl font-bold text-orange-600">145</p>
            </div>
            <TrendingDown className="w-8 h-8 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
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
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 appearance-none cursor-pointer hover:border-blue-300 transition-colors font-medium"
              >
                <option value="all">All Products</option>
                <option value="low-stock">Low Stock</option>
                <option value="incoming">With Incoming</option>
                <option value="outgoing">With Outgoing</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button className="neomorphism p-3 rounded-lg hover:shadow-glow transition-all">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
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
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-slate-100 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                >
                  <td className="py-5 px-6 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{product.product}</td>
                  <td className="py-5 px-6 text-slate-700 font-medium">₹{product.unitCost.toLocaleString()}</td>
                  <td className="py-5 px-6 text-slate-600 font-medium">{product.unit}</td>
                  <td className="py-5 px-6 text-slate-700 font-semibold">₹{product.totalValue.toLocaleString()}</td>
                  <td className="py-5 px-6">
                    <span className={`font-semibold ${product.onHand < 50 ? 'text-red-600' : 'text-slate-900'}`}>
                      {product.onHand}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-slate-700 font-medium">{product.freeToUse}</td>
                  <td className="py-5 px-6">
                    <span className={`font-medium ${product.incoming > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                      {product.incoming}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`font-medium ${product.outgoing > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
                      {product.outgoing}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
        <div className="space-y-3">
          <div className="neomorphism-inset p-4 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Wooden Legs</p>
                <p className="text-sm text-gray-600">Only 10 units remaining</p>
              </div>
              <span className="text-red-600 font-bold">Critical</span>
            </div>
          </div>
          <div className="neomorphism-inset p-4 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Varnish Bottle</p>
                <p className="text-sm text-gray-600">25 units remaining</p>
              </div>
              <span className="text-orange-600 font-bold">Low</span>
            </div>
          </div>
          <div className="neomorphism-inset p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Chair Cushions</p>
                <p className="text-sm text-gray-600">45 units remaining</p>
              </div>
              <span className="text-yellow-600 font-bold">Warning</span>
            </div>
          </div>
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
                <h3 className="text-lg font-semibold text-slate-900">Create New Stock</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => handleCreateStock(e)}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="product"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Unit Cost</label>
                    <input
                      type="number"
                      name="unitCost"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      placeholder="₹0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Unit Type</label>
                    <select
                      name="unit"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                    >
                      <option value="">Select unit</option>
                      <option value="Unit">Unit</option>
                      <option value="kg">Kilogram</option>
                      <option value="lbs">Pounds</option>
                      <option value="pcs">Pieces</option>
                      <option value="box">Box</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">On Hand</label>
                    <input
                      type="number"
                      name="onHand"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Free to Use</label>
                    <input
                      type="number"
                      name="freeToUse"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Incoming</label>
                    <input
                      type="number"
                      name="incoming"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      placeholder="0"
                      defaultValue="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Outgoing</label>
                    <input
                      type="number"
                      name="outgoing"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 transition-colors"
                      placeholder="0"
                      defaultValue="0"
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
                    Create Stock
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