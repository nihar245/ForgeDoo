import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, LineChart, PieChart, Download, Calendar, Filter } from 'lucide-react'
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('production')
  const [dateRange, setDateRange] = useState('6months')

  const productionTrends = [
    { month: 'Jan', completed: 45, planned: 50, efficiency: 90 },
    { month: 'Feb', completed: 52, planned: 55, efficiency: 95 },
    { month: 'Mar', completed: 48, planned: 60, efficiency: 80 },
    { month: 'Apr', completed: 61, planned: 65, efficiency: 94 },
    { month: 'May', completed: 55, planned: 58, efficiency: 95 },
    { month: 'Jun', completed: 67, planned: 70, efficiency: 96 },
  ]

  const stockOverTime = [
    { month: 'Jan', stock: 1200 },
    { month: 'Feb', stock: 1150 },
    { month: 'Mar', stock: 1300 },
    { month: 'Apr', stock: 1250 },
    { month: 'May', stock: 1400 },
    { month: 'Jun', stock: 1350 },
  ]

  const resourceAllocation = [
    { name: 'Assembly Line', value: 35, color: '#60a5fa' }, // blue-400
    { name: 'Paint Floor', value: 25, color: '#34d399' }, // emerald-400
    { name: 'Packaging', value: 20, color: '#a78bfa' }, // violet-400
    { name: 'Quality Control', value: 20, color: '#f59e0b' }, // amber-500
  ]

  const delayedOrders = [
    { product: 'Wooden Table', days: 3, reason: 'Material shortage' },
    { product: 'Chair Set', days: 1, reason: 'Machine maintenance' },
    { product: 'Office Desk', days: 2, reason: 'Worker unavailable' },
  ]

  const reportTypes = [
    { id: 'production', name: 'Production Trends', icon: BarChart },
    { id: 'stock', name: 'Stock Analysis', icon: LineChart },
    { id: 'resource', name: 'Resource Utilization', icon: PieChart },
    { id: 'delays', name: 'Delay Analysis', icon: Calendar },
  ]

  const renderReport = () => {
    switch (selectedReport) {
      case 'production':
        return (
          <div className="space-y-6">
            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Efficiency Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart data={productionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="planned" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Efficiency %</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={productionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      
      case 'stock':
        return (
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Levels Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsLineChart data={stockOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="stock" stroke="#f59e0b" strokeWidth={3} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )
      
      case 'resource':
        return (
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsPieChart>
                <Pie
                  data={resourceAllocation}
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {resourceAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )
      
      case 'delays':
        return (
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delayed Orders Analysis</h3>
            <div className="space-y-4">
              {delayedOrders.map((order, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="neomorphism-inset p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{order.product}</h4>
                      <p className="text-sm text-gray-600">{order.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{order.days}</p>
                      <p className="text-xs text-gray-600">days delayed</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Analyze your manufacturing performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800 appearance-none cursor-pointer hover:border-blue-300 transition-colors pr-10"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button className="neomorphism hover-glow flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-gray-800 transition-all">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="glass p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`p-4 rounded-lg transition-all ${
                selectedReport === type.id
                  ? 'neomorphism-inset border-l-4 border-gray-900'
                  : 'hover:neomorphism'
              }`}
            >
              <div className="flex items-center space-x-3">
                <type.icon className={`w-6 h-6 ${selectedReport === type.id ? 'text-gray-900' : 'text-gray-600'}`} />
                <span className={`font-medium ${selectedReport === type.id ? 'text-gray-900' : 'text-gray-700'}`}>
                  {type.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <motion.div
        key={selectedReport}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderReport()}
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">94.5%</div>
          <div className="text-sm text-gray-600">Average Efficiency</div>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">328</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">6</div>
          <div className="text-sm text-gray-600">Delayed Orders</div>
        </div>
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">₹2.4M</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>
    </div>
  )
}

export default Reports