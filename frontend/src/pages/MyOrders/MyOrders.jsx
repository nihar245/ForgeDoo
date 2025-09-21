import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import StatusBadge from '../../components/StatusBadge'
import { reportsAPI } from '../../services/reportsAPI'
import { toast } from 'react-hot-toast'

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyOrders()
  }, [])

  const fetchMyOrders = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getUserReports()
      // Transform the data to match the expected format
      const transformedOrders = (response.data || []).map(order => ({
        id: order.reference || order.id,
        product: order.product_name || order.name || 'Unknown Product',
        status: order.status || 'Draft',
        deadline: order.planned_date || order.end_date || 'No deadline',
        progress: order.progress || getProgressFromStatus(order.status)
      }))
      setMyOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching user orders:', error)
      toast.error('Failed to load your orders')
      // Keep orders empty if API fails to show only real data
      setMyOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getProgressFromStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 0
      case 'confirmed': return 10
      case 'in_progress': case 'in progress': return 50
      case 'to_close': case 'to close': return 90
      case 'done': case 'completed': return 100
      case 'cancelled': return 0
      default: return 0
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <div className="glass p-6 rounded-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      </div>

      <div className="glass p-6 rounded-2xl">
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
              {myOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-white/10 hover:bg-white/20 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                  <td className="py-3 px-4 text-gray-700">{order.product}</td>
                  <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                  <td className="py-3 px-4 text-gray-700">{order.deadline}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${order.progress}%` }} />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{order.progress}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MyOrders
