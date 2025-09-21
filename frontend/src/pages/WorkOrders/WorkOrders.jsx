import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, RotateCcw, Search, RefreshCw, Play, Pause } from 'lucide-react'
import { manufacturingOrdersAPI } from '../../services'
import StatusBadge from '../../components/StatusBadge'
import { workOrdersAPI } from '../../services'
import toast from 'react-hot-toast'

const WorkOrders = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  // tick used to force re-render for live elapsed timer
  const [tick, setTick] = useState(0)

  const fetchWorkOrders = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const response = await workOrdersAPI.getAll()
      // Backend returns { data: [...] } per controller
      const list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
      console.log('[WO-FRONTEND] Raw work orders response:', response)
      console.log('[WO-FRONTEND] Parsed work orders length:', list.length)
      setWorkOrders(list)
    } catch (error) {
      console.error('Failed to fetch work orders:', error)
      toast.error('Failed to load work orders')
      setWorkOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  // Auto-attempt generation if we have MOs and zero WOs (runs once)
  useEffect(() => {
    if(!loading && workOrders.length === 0){
      (async () => {
        try {
          console.log('[WO-FRONTEND] No work orders found, attempting generation from BOMs...')
          const moResp = await manufacturingOrdersAPI.getAll()
          const moList = moResp?.data || []
          if(moList.length === 0) return;
          for(const mo of moList){
            try {
              const genResp = await workOrdersAPI.generateForMO(mo.id)
              console.log('[WO-FRONTEND] Generate response for MO', mo.id, genResp)
            } catch(e){
              console.warn('Generation failed for MO', mo.id, e)
            }
          }
          await fetchWorkOrders(true)
        } catch(e){
          console.warn('[WO-FRONTEND] Auto generation skipped:', e)
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, workOrders.length])

  // periodic refresh of elapsed duration display only (every 30s)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  // Filter work orders based on search term only
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Text search across multiple fields
      return searchTerm === '' || 
        (wo.operation_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wo.work_center_name || 'general').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (wo.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [workOrders, searchTerm])

  const handleStart = async (id) => {
    try {
      await workOrdersAPI.start(id)
      await fetchWorkOrders(true) // Refresh with loading state
      toast.success('Work order started')
    } catch (error) {
      console.error('Failed to start work order:', error)
      toast.error('Failed to start work order')
    }
  }

  const handleComplete = async (id) => {
    try {
      await workOrdersAPI.complete(id)
      await fetchWorkOrders(true) // Refresh with loading state
      toast.success('Work order completed')
    } catch (error) {
      console.error('Failed to complete work order:', error)
      toast.error('Failed to complete work order')
    }
  }

  const handleRefresh = () => {
    fetchWorkOrders(true)
  }

  const handlePause = async (id) => {
    try {
      await workOrdersAPI.pause(id)
      await fetchWorkOrders(true)
      toast.success('Work order paused')
    } catch (e) {
      console.error('Failed to pause work order', e)
      toast.error('Failed to pause work order')
    }
  }

  // compute expected duration with fallbacks
  const getExpected = (wo) => {
    const val = wo.expected_duration_mins ?? wo.duration_mins ?? wo.planned_duration_mins
    return val ? Number(val) : 0
  }

  // compute elapsed (real_duration_mins if finished, live if in_progress)
  const getElapsed = (wo) => {
    if (wo.real_duration_mins) return Number(wo.real_duration_mins)
    if (wo.status === 'in_progress' && wo.started_at) {
      const start = new Date(wo.started_at).getTime()
      const now = Date.now()
      return (now - start) / 60000
    }
    return null
  }

  const formatStatusLabel = (s) => ({
    pending: 'Pending',
    in_progress: 'In Progress',
    paused: 'Paused',
    done: 'Done',
    cancelled: 'Cancelled'
  })[s] || s

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        </div>
        
        <div className="glass p-6 rounded-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading work orders...</p>
        </div>
      </div>
    )
  }

  // Empty state (with manual generation button)
  if (!loading && workOrders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        </div>
        
        <div className="glass p-6 rounded-xl text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Orders Found</h3>
          <p className="text-gray-600 mb-4">There are no work orders yet. Generate them from BOM operations.</p>
          <button
            onClick={async () => {
              try {
                const moResp = await manufacturingOrdersAPI.getAll()
                const moList = moResp?.data || []
                if(moList.length === 0){
                  toast.error('No manufacturing orders to generate from')
                  return
                }
                let totalInserted = 0
                for(const mo of moList){
                  const genResp = await workOrdersAPI.generateForMO(mo.id)
                  totalInserted += genResp?.data?.inserted || 0
                }
                toast.success(totalInserted ? `Generated ${totalInserted} operations` : 'Nothing to generate')
                await fetchWorkOrders(true)
              } catch(e){
                console.error('Manual generation failed', e)
                toast.error('Generation failed')
              }
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >Generate Work Orders</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600">Manage work assignments and track progress</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Search Section */}
      <div className="glass p-6 rounded-xl">
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
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="neomorphism px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
        
        {/* Results Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Showing <strong>{filteredWorkOrders.length}</strong> of <strong>{workOrders.length}</strong> work orders</span>
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
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Expected</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Elapsed</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkOrders.map((order, index) => {
                const expected = getExpected(order)
                const elapsedVal = getElapsed(order) // depends on tick for live updates
                const elapsed = elapsedVal != null ? `${elapsedVal.toFixed(1)} mins` : '-'
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">{order.operation_name}</td>
                    <td className="py-4 px-6 text-gray-700">{order.work_center_name || 'General'}</td>
                    <td className="py-4 px-6 font-medium text-blue-600">{order.product_name}</td>
                    <td className="py-4 px-6 text-gray-700">{expected ? `${expected.toFixed(1)} mins` : '-'}</td>
                    <td className="py-4 px-6 text-gray-700">
                      {elapsed}
                      {expected > 0 && elapsedVal != null && (
                        <span className={`ml-2 text-xs ${elapsedVal > expected ? 'text-red-600' : 'text-green-600'}`}>
                          {((elapsedVal / expected) * 100).toFixed(0)}%
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={formatStatusLabel(order.status)} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {(order.status === 'pending' || order.status === 'paused') && (
                          <button
                            onClick={() => handleStart(order.id)}
                            className="neomorphism p-2 rounded-lg hover:text-blue-600 transition-all"
                            aria-label={`Start ${order.id}`}
                            title={order.status === 'paused' ? 'Resume' : 'Start'}
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => handlePause(order.id)}
                            className="neomorphism p-2 rounded-lg hover:text-yellow-600 transition-all"
                            aria-label={`Pause ${order.id}`}
                            title="Pause"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            className="neomorphism p-2 rounded-lg hover:text-green-600 transition-all"
                            aria-label={`Complete ${order.id}`}
                            title="Complete"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'done' && (
                          <button
                            onClick={() => handleStart(order.id)}
                            className="neomorphism p-2 rounded-lg hover:text-blue-600 transition-all"
                            aria-label={`Reopen ${order.id}`}
                            title="Reopen"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
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