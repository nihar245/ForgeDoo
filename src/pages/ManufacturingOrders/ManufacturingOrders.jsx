import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'
import { ensureSeedData, loadMOs, computeComponentStatus } from '../../utils/moStorage'
import { useNavigate } from 'react-router-dom'

const ManufacturingOrders = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const seeded = ensureSeedData()
    setOrders(seeded)
  }, [])

  // Status colors handled by <StatusBadge />

  const list = useMemo(() => (orders || []).map(o => ({
    ...o,
    componentStatus: computeComponentStatus(o),
  })), [orders])

  const filteredOrders = list.filter(order => {
    const matchesSearch = order.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const stateStr = (order.state || '').toLowerCase().replace(/\s+/g,'')
    const matchesFilter = filterStatus === 'all' || stateStr === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manufacturing Orders</h1>
          <p className="text-gray-600">Manage your production workflows</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="neomorphism hover-glow flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-gray-800 transition-all"
          onClick={() => navigate('/manufacturing-orders/new')}
        >
          <Plus className="w-5 h-5" />
          <span>Create New MO</span>
        </motion.button>
      </div>

      {/* Filters and Search */}
      <div className="glass p-6 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by reference or product name..."
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
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="inprogress">In Progress</option>
                <option value="toclose">To Close</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
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

      {/* Orders Table */}
      <div className="glass rounded-xl overflow-hidden shadow-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Reference</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Start Date</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Finished Product</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Component Status</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Quantity</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">Unit</th>
                <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 tracking-wide">State</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-slate-100 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(`/manufacturing-orders/${order.id}`)}
                >
                  <td className="py-5 px-6 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{order.id}</td>
                  <td className="py-5 px-6 text-slate-600 font-medium">{order.startDate}</td>
                  <td className="py-5 px-6 text-slate-700 font-medium">{order.product}</td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${order.componentStatus === 'Available' ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
                      {order.componentStatus}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-slate-700 font-semibold">{order.quantity}</td>
                  <td className="py-5 px-6 text-slate-600 font-medium">{order.unit}</td>
                  <td className="py-5 px-6">
                    <StatusBadge status={order.state || 'Draft'} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl text-center border border-slate-200 hover:shadow-lg transition-all duration-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {orders.filter(o => o.status === 'Planned').length}
          </div>
          <div className="text-sm text-slate-600 font-medium">Planned Orders</div>
        </div>
        <div className="glass p-6 rounded-xl text-center border border-slate-200 hover:shadow-lg transition-all duration-200">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {orders.filter(o => o.status === 'In Progress').length}
          </div>
          <div className="text-sm text-slate-600 font-medium">In Progress</div>
        </div>
        <div className="glass p-6 rounded-xl text-center border border-slate-200 hover:shadow-lg transition-all duration-200">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {orders.filter(o => o.status === 'Completed').length}
          </div>
          <div className="text-sm text-slate-600 font-medium">Completed</div>
        </div>
        <div className="glass p-6 rounded-xl text-center border border-slate-200 hover:shadow-lg transition-all duration-200">
          <div className="text-3xl font-bold text-slate-700 mb-2">
            {orders.reduce((sum, o) => sum + o.quantity, 0)}
          </div>
          <div className="text-sm text-slate-600 font-medium">Total Quantity</div>
        </div>
      </div>
    </div>
  )
}

export default ManufacturingOrders