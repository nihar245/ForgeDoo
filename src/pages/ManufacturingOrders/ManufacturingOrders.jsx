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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neomorphism-inset w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="neomorphism-inset px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="inprogress">In Progress</option>
              <option value="toclose">To Close</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="neomorphism p-2 rounded-lg hover:shadow-glow transition-all">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Reference</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Start Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Finished Product</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Component Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Unit</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">State</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/manufacturing-orders/${order.id}`)}
                >
                  <td className="py-4 px-6 font-medium text-gray-900">{order.id}</td>
                  <td className="py-4 px-6 text-gray-700">{order.startDate}</td>
                  <td className="py-4 px-6 text-gray-700">{order.product}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-gray-300 ${order.componentStatus === 'Available' ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-700'}`}>
                      {order.componentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{order.quantity}</td>
                  <td className="py-4 px-6 text-gray-700">{order.unit}</td>
                  <td className="py-4 px-6">
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
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {orders.filter(o => o.status === 'Planned').length}
          </div>
          <div className="text-sm text-gray-600">Planned Orders</div>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {orders.filter(o => o.status === 'In Progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {orders.filter(o => o.status === 'Completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-600 mb-2">
            {orders.reduce((sum, o) => sum + o.quantity, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Quantity</div>
        </div>
      </div>
    </div>
  )
}

export default ManufacturingOrders