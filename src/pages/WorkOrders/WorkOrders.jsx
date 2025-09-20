import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, RotateCcw, Search, Filter } from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'

const WorkOrders = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [workCenterFilter, setWorkCenterFilter] = useState('all')
  const [operationFilter, setOperationFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')
  
  const initialOrders = [
    { id: 'WO001', operation: 'Assembly', workCenter: 'Assembly Line A', assignedTo: 'John Smith', status: 'To Do', expectedDuration: '60 mins', realDuration: '45 mins', finishedProduct: 'Dining Table', priority: 'High' },
    { id: 'WO002', operation: 'Painting', workCenter: 'Paint Floor B', assignedTo: 'Sarah Johnson', status: 'To Do', expectedDuration: '30 mins', realDuration: '', finishedProduct: 'Chair Set', priority: 'Medium' },
    { id: 'WO003', operation: 'Packing', workCenter: 'Packaging Line', assignedTo: 'Mike Wilson', status: 'To Do', expectedDuration: '20 mins', realDuration: '', finishedProduct: 'Coffee Table', priority: 'Low' },
    { id: 'WO004', operation: 'Quality Check', workCenter: 'QC Station', assignedTo: 'Lisa Brown', status: 'Done', expectedDuration: '15 mins', realDuration: '12 mins', finishedProduct: 'Bookshelf', priority: 'High' },
    { id: 'WO005', operation: 'Sanding', workCenter: 'Preparation Area', assignedTo: 'David Lee', status: 'To Do', expectedDuration: '45 mins', realDuration: '', finishedProduct: 'Dining Table', priority: 'Medium' },
    { id: 'WO006', operation: 'Welding', workCenter: 'Metal Shop', assignedTo: 'Anna Garcia', status: 'To Do', expectedDuration: '90 mins', realDuration: '75 mins', finishedProduct: 'Office Desk', priority: 'High' },
    { id: 'WO007', operation: 'Assembly', workCenter: 'Assembly Line B', assignedTo: 'Tom Martinez', status: 'Done', expectedDuration: '75 mins', realDuration: '80 mins', finishedProduct: 'Wardrobe', priority: 'Medium' },
    { id: 'WO008', operation: 'Cutting', workCenter: 'Wood Shop', assignedTo: 'Emma Davis', status: 'To Do', expectedDuration: '40 mins', realDuration: '', finishedProduct: 'Shelf Unit', priority: 'Low' },
    { id: 'WO009', operation: 'Polishing', workCenter: 'Finishing Area', assignedTo: 'James Wilson', status: 'Done', expectedDuration: '25 mins', realDuration: '30 mins', finishedProduct: 'Chair Set', priority: 'Medium' },
    { id: 'WO010', operation: 'Quality Check', workCenter: 'QC Station', assignedTo: 'Lisa Brown', status: 'To Do', expectedDuration: '10 mins', realDuration: '', finishedProduct: 'Coffee Table', priority: 'High' },
  ]

  const [workOrders, setWorkOrders] = useState(initialOrders)

  // Extract unique values for filter dropdowns
  const uniqueWorkCenters = [...new Set(workOrders.map(wo => wo.workCenter))].sort()
  const uniqueOperations = [...new Set(workOrders.map(wo => wo.operation))].sort()
  const uniqueProducts = [...new Set(workOrders.map(wo => wo.finishedProduct))].sort()
  const uniquePriorities = [...new Set(workOrders.map(wo => wo.priority))].sort()

  const handleStart = (id) => {
    setWorkOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      status: 'To Do'
    } : o))
  }

  const handleComplete = (id) => {
    setWorkOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      status: 'Done'
    } : o))
  }

  // Filter work orders based on all filter criteria
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Text search across multiple fields
      const matchesSearch = searchTerm === '' || 
        wo.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.workCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.finishedProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.id.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || wo.status.toLowerCase() === statusFilter.toLowerCase()
      
      // Work center filter
      const matchesWorkCenter = workCenterFilter === 'all' || wo.workCenter === workCenterFilter
      
      // Operation filter
      const matchesOperation = operationFilter === 'all' || wo.operation === operationFilter
      
      // Product filter
      const matchesProduct = productFilter === 'all' || wo.finishedProduct === productFilter

      // Duration filter
      const matchesDuration = (() => {
        if (durationFilter === 'all') return true
        const durationValue = parseInt(wo.expectedDuration.replace(/\D/g, ''))
        switch (durationFilter) {
          case 'short': return durationValue <= 30
          case 'medium': return durationValue > 30 && durationValue <= 60
          case 'long': return durationValue > 60
          case 'overdue': return wo.realDuration && parseInt(wo.realDuration.replace(/\D/g, '')) > durationValue
          default: return true
        }
      })()

      return matchesSearch && matchesStatus && matchesWorkCenter && 
             matchesOperation && matchesProduct && matchesDuration
    })
  }, [workOrders, searchTerm, statusFilter, workCenterFilter, operationFilter, 
      productFilter, durationFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600">Manage work assignments and track progress</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="glass p-6 rounded-xl">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by operation, work center, product, or work order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 hover:border-blue-300 transition-colors"
              />
            </div>
            <button className="neomorphism p-3 rounded-lg hover:shadow-glow transition-all">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 text-sm transition-colors"
              >
                <option value="all">All Status</option>
                <option value="to do">To Do</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Work Center</label>
              <select
                value={workCenterFilter}
                onChange={(e) => setWorkCenterFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 text-sm transition-colors"
              >
                <option value="all">All Work Centers</option>
                {uniqueWorkCenters.map(center => (
                  <option key={center} value={center}>{center}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Operation</label>
              <select
                value={operationFilter}
                onChange={(e) => setOperationFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 text-sm transition-colors"
              >
                <option value="all">All Operations</option>
                {uniqueOperations.map(operation => (
                  <option key={operation} value={operation}>{operation}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 text-sm transition-colors"
              >
                <option value="all">All Products</option>
                {uniqueProducts.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 text-sm transition-colors"
              >
                <option value="all">All Durations</option>
                <option value="short">Short (≤30 mins)</option>
                <option value="medium">Medium (31-60 mins)</option>
                <option value="long">Long (&gt;60 mins)</option>
                <option value="overdue">Overdue Tasks</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setWorkCenterFilter('all')
                  setOperationFilter('all')
                  setProductFilter('all')
                  setDurationFilter('all')
                }}
                className="neomorphism px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Showing <strong>{filteredWorkOrders.length}</strong> of <strong>{workOrders.length}</strong> work orders</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>To Do: {filteredWorkOrders.filter(wo => wo.status === 'To Do').length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Done: {filteredWorkOrders.filter(wo => wo.status === 'Done').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Assignment Area */}
      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Drag & Drop Task Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="neomorphism-inset p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">To Do Tasks</h4>
            <div className="space-y-2">
              {filteredWorkOrders.filter(wo => wo.status === 'To Do').map(wo => (
                <div key={wo.id} className="glass p-3 rounded-lg cursor-move hover:shadow-glow transition-all">
                  <div className="font-medium text-gray-900">{wo.operation}</div>
                  <div className="text-sm text-gray-600">{wo.workCenter}</div>
                  <div className="text-xs text-blue-600">{wo.finishedProduct}</div>
                  <div className="text-xs text-gray-500">Expected: {wo.expectedDuration}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="neomorphism-inset p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Completed</h4>
            <div className="space-y-2">
              {filteredWorkOrders.filter(wo => wo.status === 'Done').map(wo => (
                <div key={wo.id} className="glass p-3 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{wo.operation}</div>
                      <div className="text-sm text-gray-600">{wo.workCenter}</div>
                      <div className="text-xs text-blue-600">{wo.finishedProduct}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Expected: {wo.expectedDuration}</div>
                      <div className="text-xs text-green-600">Actual: {wo.realDuration}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Operation</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Work Center</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Finished Product</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Expected Duration</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Real Duration</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-gray-900">{order.operation}</td>
                  <td className="py-4 px-6 text-gray-700">{order.workCenter}</td>
                  <td className="py-4 px-6 font-medium text-blue-600">{order.finishedProduct}</td>
                  <td className="py-4 px-6 text-gray-700">{order.expectedDuration}</td>
                  <td className="py-4 px-6 text-gray-700">{order.realDuration || '-'}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {/* Show Complete button only for To Do tasks */}
                      {order.status === 'To Do' && (
                        <button 
                          onClick={() => handleComplete(order.id)} 
                          className="neomorphism p-2 rounded-lg hover:text-green-600 transition-all" 
                          aria-label={`Complete ${order.id}`}
                          title="Mark as Done"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {/* Show Reset button for Done tasks */}
                      {order.status === 'Done' && (
                        <button 
                          onClick={() => handleStart(order.id)} 
                          className="neomorphism p-2 rounded-lg hover:text-blue-600 transition-all" 
                          aria-label={`Reset ${order.id}`}
                          title="Mark as To Do"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Update duration column to show elapsed if available */}
      <style>{`
        /* purely presentational; no structure changes */
      `}</style>
    </div>
  )
}

export default WorkOrders