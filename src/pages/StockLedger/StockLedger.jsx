import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, TrendingDown, TrendingUp, Search, Filter } from 'lucide-react'

const StockLedger = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMovement, setFilterMovement] = useState('all')

  const stockMovements = [
    { id: 1, product: 'Wooden Legs', movementType: 'Out', quantity: 40, date: '2025-09-20', reason: 'MO #001', remainingStock: 160 },
    { id: 2, product: 'Wooden Table', movementType: 'In', quantity: 10, date: '2025-09-21', reason: 'Completed MO #001', remainingStock: 50 },
    { id: 3, product: 'Chair Legs', movementType: 'Out', quantity: 100, date: '2025-09-19', reason: 'MO #002', remainingStock: 200 },
    { id: 4, product: 'Screws Pack', movementType: 'In', quantity: 500, date: '2025-09-18', reason: 'Purchase Order', remainingStock: 1500 },
    { id: 5, product: 'Varnish Bottle', movementType: 'Out', quantity: 5, date: '2025-09-20', reason: 'MO #001', remainingStock: 25 },
  ]

  const filteredMovements = stockMovements.filter(movement => {
    const matchesSearch = movement.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterMovement === 'all' || movement.movementType.toLowerCase() === filterMovement
    return matchesSearch && matchesFilter
  })

  const getMovementIcon = (type) => {
    return type === 'In' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const getMovementColor = (type) => {
    return type === 'In' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
          <p className="text-gray-600">Track inventory movements and stock levels</p>
        </div>
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
              placeholder="Search by product name or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 hover:border-blue-300 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterMovement}
              onChange={(e) => setFilterMovement(e.target.value)}
              className="neomorphism-inset px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Movements</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
            <button className="neomorphism p-2 rounded-lg hover:shadow-glow transition-all">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Movements Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Product Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Movement Type</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Reason</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Remaining Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movement, index) => (
                <motion.tr
                  key={movement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-gray-900">{movement.product}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getMovementIcon(movement.movementType)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.movementType)}`}>
                        {movement.movementType}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{movement.quantity}</td>
                  <td className="py-4 px-6 text-gray-700">{movement.date}</td>
                  <td className="py-4 px-6 text-gray-700">{movement.reason}</td>
                  <td className="py-4 px-6">
                    <span className={`font-medium ${movement.remainingStock < 50 ? 'text-red-600' : 'text-gray-900'}`}>
                      {movement.remainingStock}
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
    </div>
  )
}

export default StockLedger