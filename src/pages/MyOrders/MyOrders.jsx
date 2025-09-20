import React from 'react'
import { motion } from 'framer-motion'
import StatusBadge from '../../components/StatusBadge'

const MyOrders = () => {
  // Mock data for user's own orders
  const myOrders = [
    { id: 'MO101', product: 'Custom Table', status: 'In Progress', deadline: '2025-09-27', progress: 60 },
    { id: 'MO099', product: 'Office Chair', status: 'Planned', deadline: '2025-09-29', progress: 0 },
    { id: 'MO095', product: 'Bookshelf', status: 'Completed', deadline: '2025-09-20', progress: 100 },
  ]

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
