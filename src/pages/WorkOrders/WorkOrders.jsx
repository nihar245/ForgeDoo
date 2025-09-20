import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, Play, Pause, CheckCircle, RotateCcw } from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'

const WorkOrders = () => {
  const initialOrders = [
    { id: 'WO001', step: 'Assembly', workCenter: 'Assembly Line', assignedTo: 'Worker #1', status: 'In Progress', duration: '60 mins' },
    { id: 'WO002', step: 'Painting', workCenter: 'Paint Floor', assignedTo: 'Worker #2', status: 'Planned', duration: '30 mins' },
    { id: 'WO003', step: 'Packing', workCenter: 'Packaging Line', assignedTo: 'Worker #3', status: 'Pending', duration: '20 mins' },
    { id: 'WO004', step: 'Quality Check', workCenter: 'QC Station', assignedTo: 'Worker #4', status: 'Completed', duration: '15 mins' },
  ]

  const [workOrders, setWorkOrders] = useState(() =>
    initialOrders.map(o => ({
      ...o,
      elapsedSec: o.status === 'In Progress' ? 0 : undefined,
      running: o.status === 'In Progress',
      startedAt: o.status === 'In Progress' ? Date.now() : undefined,
    }))
  )

  const timerRef = useRef(null)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setWorkOrders(prev => prev.map(o => {
        if (o.running) {
          const base = o.startedAt ? Math.floor((Date.now() - o.startedAt) / 1000) : (o.elapsedSec || 0) + 1
          return { ...o, elapsedSec: base }
        }
        return o
      }))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const fmt = (sec) => {
    if (sec == null) return null
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
  }

  const handlePlay = (id) => {
    setWorkOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      status: 'In Progress',
      running: true,
      startedAt: Date.now() - (o.elapsedSec || 0) * 1000,
      elapsedSec: o.elapsedSec || 0,
    } : o))
  }

  const handlePause = (id) => {
    setWorkOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      status: 'Paused',
      running: false,
      elapsedSec: o.startedAt ? Math.floor((Date.now() - o.startedAt) / 1000) : (o.elapsedSec || 0),
      startedAt: undefined,
    } : o))
  }

  const handleComplete = (id) => {
    setWorkOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      status: 'Completed',
      running: false,
      elapsedSec: o.startedAt ? Math.floor((Date.now() - o.startedAt) / 1000) : (o.elapsedSec || 0),
      startedAt: undefined,
    } : o))
  }

  const handleReset = (id) => {
    setWorkOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      status: 'Pending',
      running: false,
      elapsedSec: 0,
      startedAt: undefined,
    } : o))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600">Manage work assignments and track progress</p>
        </div>
      </div>

      {/* Drag & Drop Assignment Area */}
      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Drag & Drop Task Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neomorphism-inset p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Available Tasks</h4>
            <div className="space-y-2">
              {workOrders.filter(wo => wo.status === 'Planned').map(wo => (
                <div key={wo.id} className="glass p-3 rounded-lg cursor-move hover:shadow-glow transition-all">
                  <div className="font-medium text-gray-900">{wo.step}</div>
                  <div className="text-sm text-gray-600">{wo.workCenter}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="neomorphism-inset p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">In Progress</h4>
            <div className="space-y-2">
              {workOrders.filter(wo => wo.status === 'In Progress').map(wo => (
                <div key={wo.id} className="glass p-3 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{wo.step}</div>
                      <div className="text-sm text-gray-600">{wo.assignedTo}</div>
                    </div>
                    <div className="text-sm font-mono text-gray-800">
                      {fmt(wo.elapsedSec)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="neomorphism-inset p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Completed</h4>
            <div className="space-y-2">
              {workOrders.filter(wo => wo.status === 'Completed').map(wo => (
                <div key={wo.id} className="glass p-3 rounded-lg border-l-4 border-green-500">
                  <div className="font-medium text-gray-900">{wo.step}</div>
                  <div className="text-sm text-gray-600">{wo.assignedTo}</div>
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
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Work Step</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Work Center</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Assigned To</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Duration</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-gray-900">{order.step}</td>
                  <td className="py-4 px-6 text-gray-700">{order.workCenter}</td>
                  <td className="py-4 px-6 text-gray-700">{order.assignedTo}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 px-6 text-gray-700">{fmt(order.elapsedSec) || order.duration}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {/* Show Play button only when not running */}
                      {!order.running && order.status !== 'Completed' && (
                        <button 
                          onClick={() => handlePlay(order.id)} 
                          className="neomorphism p-2 rounded-lg hover:text-green-600 transition-all" 
                          aria-label={`Start ${order.id}`}
                          title="Start/Resume"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {/* Show Pause button only when running */}
                      {order.running && (
                        <button 
                          onClick={() => handlePause(order.id)} 
                          className="neomorphism p-2 rounded-lg hover:text-yellow-600 transition-all" 
                          aria-label={`Pause ${order.id}`}
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {/* Show Complete button when in progress or paused */}
                      {(order.status === 'In Progress' || order.status === 'Paused') && (
                        <button 
                          onClick={() => handleComplete(order.id)} 
                          className="neomorphism p-2 rounded-lg hover:text-blue-600 transition-all" 
                          aria-label={`Complete ${order.id}`}
                          title="Mark Complete"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {/* Show Reset button when paused or completed */}
                      {(order.status === 'Paused' || order.status === 'Completed') && (
                        <button 
                          onClick={() => handleReset(order.id)} 
                          className="neomorphism p-2 rounded-lg hover:text-red-600 transition-all" 
                          aria-label={`Reset ${order.id}`}
                          title="Reset Timer"
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