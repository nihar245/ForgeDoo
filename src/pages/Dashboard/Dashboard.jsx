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
      title: 'Invoices Awaiting Payment',
      value: '45/76',
      subtitle: 'Invoices Awaiting',
      change: '$5,569 (68%)',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Converted Leads',
      value: '48/86',
      subtitle: 'Converted Leads', 
      change: '52 Completed (63%)',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Projects in Progress',
      value: '16/20',
      subtitle: 'Projects in Progress',
      change: '16 Completed (78%)',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Conversion Rate',
      value: '46.59%',
      subtitle: 'Conversion Rate',
      change: '$2,254 (68%)',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100'
    }
  ]

  // Status colors handled by <StatusBadge />

  return (
    <div className="space-y-8 overflow-x-hidden max-w-[100vw]">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass p-6 rounded-xl hover:shadow-xl transition-all duration-300 border border-slate-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div className="text-right ml-auto">
                    <div className="text-2xl font-bold text-slate-800">{kpi.value}</div>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">{kpi.subtitle}</p>
                <p className="text-xs text-slate-500">{kpi.change}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Record Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-6 rounded-xl min-w-0 w-full overflow-hidden border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Payment Record</h3>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-slate-600">Awaiting: $5,486</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-slate-600">Completed: $9,275</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
              12%
            </div>
          </div>
          <div className="max-w-full sm:max-w-[420px] md:max-w-[500px] lg:max-w-[420px] xl:max-w-[540px] mx-auto">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(226, 232, 240, 0.6)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.08)'
                  }}
                />
                <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="planned" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Total Sales Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-6 rounded-xl border border-slate-200 bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Total Sales</h3>
            <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium">
              12%
            </div>
          </div>
          <div className="mb-8">
            <div className="text-3xl font-bold mb-2">30,569</div>
            <div className="text-blue-100">Total Sales</div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <div>
                  <div className="font-medium">Shopify eCommerce Store</div>
                  <div className="text-blue-100 text-sm">8 Projects</div>
                </div>
              </div>
              <div className="font-bold">$1200</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div>
                  <div className="font-medium">iOS App Development</div>
                  <div className="text-blue-100 text-sm">3 Projects</div>
                </div>
              </div>
              <div className="font-bold">$1450</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">F</span>
                </div>
                <div>
                  <div className="font-medium">Figma Dashboard Design</div>
                  <div className="text-blue-100 text-sm">5 Projects</div>
                </div>
              </div>
              <div className="font-bold">$1250</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section - Task Completion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Completed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-6 rounded-xl border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Tasks Completed</div>
              <div className="text-sm text-slate-500">22/35 completed</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">22/35</div>
          <div className="flex items-center gap-2 text-sm">
            <div className="text-green-600 font-medium">28% more</div>
            <div className="text-slate-500">from last week</div>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* New Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass p-6 rounded-xl border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">New Tasks</div>
              <div className="text-sm text-slate-500">0/20 tasks</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">5/20</div>
          <div className="flex items-center gap-2 text-sm">
            <div className="text-green-600 font-medium">34% more</div>
            <div className="text-slate-500">from last week</div>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Project Done */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass p-6 rounded-xl border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Project Done</div>
              <div className="text-sm text-slate-500">20/30 project</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">20/30</div>
          <div className="flex items-center gap-2 text-sm">
            <div className="text-red-600 font-medium">43% more</div>
            <div className="text-slate-500">from last week</div>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard