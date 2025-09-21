import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  TrendingUp
} from 'lucide-react'

import StatusBadge from '../../components/StatusBadge'
import { reportsAPI, manufacturingOrdersAPI } from '../../services'
// Removed throughput analytics import (no longer showing manufacturing throughput chart)
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Get date range for analytics (last 6 months)
        const endDate = new Date().toISOString().split('T')[0]
        const startDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        // Fetch dashboard KPIs, recent orders, analytics, and work centers in parallel
        const [dashboardResponse, ordersResponse] = await Promise.all([
          reportsAPI.getDashboard(),
          manufacturingOrdersAPI.getAll()
        ])

        if (dashboardResponse.data) {
          setDashboardData(dashboardResponse.data)
        }

        if (ordersResponse.data) {
          // Get the 4 most recent orders
          const recent = ordersResponse.data.slice(0, 4).map(order => ({
            id: order.reference || `MO${order.id}`,
            product: order.product_name || 'Unknown Product',
            status: order.status,
            deadline: order.end_date ? new Date(order.end_date).toLocaleDateString() : 'Not set',
            progress: getProgressFromStatus(order.status)
          }))
          setRecentOrders(recent)
        }

        // Throughput removed - no transformation needed

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getProgressFromStatus = (status) => {
    switch (status) {
      case 'draft': return 0
      case 'confirmed': return 25
      case 'in_progress': return 60
      case 'done': return 100
      case 'cancelled': return 0
      default: return 0
    }
  }

  const kpiCards = dashboardData ? [
    {
      title: 'Manufacturing Orders',
      value: `${dashboardData.in_progress || 0}/${(dashboardData.draft || 0) + (dashboardData.confirmed || 0) + (dashboardData.in_progress || 0)}`,
      subtitle: 'Orders In Progress',
      change: `${dashboardData.done || 0} Completed`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Work Orders',
      value: `${dashboardData.wo_in_progress || 0}/${(dashboardData.wo_pending || 0) + (dashboardData.wo_in_progress || 0)}`,
      subtitle: 'Work Orders Active', 
      change: `${dashboardData.wo_done || 0} Completed`,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Pending Orders',
      value: `${dashboardData.draft || 0}`,
      subtitle: 'Orders Awaiting Confirmation',
      change: `${dashboardData.confirmed || 0} Confirmed`,
      icon: AlertTriangle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(((dashboardData.done || 0) / Math.max((dashboardData.draft || 0) + (dashboardData.confirmed || 0) + (dashboardData.in_progress || 0) + (dashboardData.done || 0), 1)) * 100)}%`,
      subtitle: 'Overall Completion',
      change: `${dashboardData.cancelled || 0} Cancelled`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100'
    }
  ] : [
    {
      title: 'Manufacturing Orders',
      value: '---',
      subtitle: 'Loading...',
      change: '---',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Work Orders',
      value: '---',
      subtitle: 'Loading...',
      change: '---',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Pending Orders',
      value: '---',
      subtitle: 'Loading...',
      change: '---',
      icon: AlertTriangle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Completion Rate',
      value: '---',
      subtitle: 'Loading...',
      change: '---',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100'
    }
  ]

  // Recent orders table rows (limit 6)
  const recentOrderRows = useMemo(() => recentOrders.slice(0,6), [recentOrders])

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



      {/* Recent Manufacturing Orders */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass p-6 rounded-xl border border-slate-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Recent Manufacturing Orders</h3>
          <span className="text-xs text-slate-500">Latest {recentOrderRows.length}</span>
        </div>
        {recentOrderRows.length === 0 ? (
          <div className="text-sm text-slate-500">No manufacturing orders yet.</div>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200/70">
                  <th className="py-2 px-2 font-medium">Reference</th>
                  <th className="py-2 px-2 font-medium">Product</th>
                  <th className="py-2 px-2 font-medium">Status</th>
                  <th className="py-2 px-2 font-medium">Deadline</th>
                  <th className="py-2 px-2 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {recentOrderRows.map(o => (
                  <tr key={o.id} className="border-b last:border-b-0 border-slate-100/70 hover:bg-slate-50/40 transition-colors">
                    <td className="py-2 px-2 font-mono text-slate-700 text-xs">{o.id}</td>
                    <td className="py-2 px-2 text-slate-700">{o.product}</td>
                    <td className="py-2 px-2"><StatusBadge status={o.status} /></td>
                    <td className="py-2 px-2 text-slate-600">{o.deadline}</td>
                    <td className="py-2 px-2 text-slate-700">{o.progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard