import React from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Users,
  Factory,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import StatusBadge from '../../components/StatusBadge'

const Dashboard = () => {
  // Mock data for charts
  const productionData = [
    { month: 'Jan', completed: 45, planned: 50 },
    { month: 'Feb', completed: 52, planned: 55 },
    { month: 'Mar', completed: 48, planned: 60 },
    { month: 'Apr', completed: 61, planned: 65 },
    { month: 'May', completed: 55, planned: 58 },
    { month: 'Jun', completed: 67, planned: 70 },
  ]

  const resourceData = [
    { name: 'Assembly Line', value: 35, color: '#60a5fa' }, // blue-400
    { name: 'Paint Floor', value: 25, color: '#34d399' }, // emerald-400
    { name: 'Packaging', value: 20, color: '#a78bfa' }, // violet-400
    { name: 'Quality Control', value: 20, color: '#f59e0b' }, // amber-500
  ]

  const recentOrders = [
    { id: 'MO001', product: 'Wooden Table', status: 'In Progress', deadline: '2025-09-25', progress: 75 },
    { id: 'MO002', product: 'Chair Set', status: 'Planned', deadline: '2025-09-29', progress: 0 },
    { id: 'MO003', product: 'Dining Set', status: 'Completed', deadline: '2025-09-22', progress: 100 },
    { id: 'MO004', product: 'Office Desk', status: 'In Progress', deadline: '2025-09-28', progress: 45 },
  ]

  const kpiCards = [
    {
      title: 'Total Orders',
      value: '156',
      change: '+12%',
      icon: Package,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'In Progress',
      value: '23',
      change: '+5%',
      icon: Clock,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Completed',
      value: '128',
      change: '+18%',
      icon: CheckCircle,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Delayed',
      value: '5',
      change: '-2%',
      icon: AlertTriangle,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100'
    }
  ]

  // Status colors handled by <StatusBadge />

  return (
  <div className="space-y-6 overflow-x-hidden max-w-[100vw]">
      {/* Auto-scrolling Announcement Carousel */}
  {/* <div className="glass rounded-2xl p-4 overflow-hidden">
        <motion.div
          animate={{ x: [1000, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-lg font-medium text-gray-800"
        >
          🎉 New feature: Drag & Drop work order assignments now available! 
          📊 Monthly production target achieved 105% 
          🔧 Maintenance scheduled for Assembly Line #2 on Sept 25th
        </motion.div>
      </div> */}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass p-6 rounded-2xl hover:shadow-glass transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trends */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-6 rounded-2xl min-w-0 w-full overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Trends</h3>
          <div className="max-w-full sm:max-w-[420px] md:max-w-[500px] lg:max-w-[420px] xl:max-w-[540px] mx-auto">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Resource Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-6 rounded-2xl min-w-0 w-full overflow-hidden"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
          <div className="max-w-full sm:max-w-[420px] md:max-w-[500px] lg:max-w-[420px] xl:max-w-[540px] mx-auto">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Manufacturing Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Manufacturing Orders</h3>
          <button className="neomorphism hover-glow px-4 py-2 rounded-lg text-sm font-medium text-gray-800 transition-all">
            View All
          </button>
        </div>

  <div className="overflow-x-auto max-w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Deadline</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Progress</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/20 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                  <td className="py-3 px-4 text-gray-700">{order.product}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-700">{order.deadline}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{order.progress}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass p-6 rounded-2xl text-center hover:shadow-glass transition-all cursor-pointer group">
          <Factory className="w-12 h-12 text-gray-800 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Create Manufacturing Order</h4>
          <p className="text-gray-600 text-sm">Start a new production workflow</p>
        </div>

  <div className="glass p-6 rounded-2xl text-center hover:shadow-glass transition-all cursor-pointer group">
          <Users className="w-12 h-12 text-gray-800 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Assign Work Orders</h4>
          <p className="text-gray-600 text-sm">Manage operator assignments</p>
        </div>

  <div className="glass p-6 rounded-2xl text-center hover:shadow-glass transition-all cursor-pointer group">
          <BarChart3 className="w-12 h-12 text-gray-800 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">View Reports</h4>
          <p className="text-gray-600 text-sm">Analyze production performance</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard