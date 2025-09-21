import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { workOrdersAPI } from '../../services'

const Reports = () => {
  const [woAnalysisData, setWoAnalysisData] = useState([])
  const [woSearch, setWoSearch] = useState('')
  const [woLoading, setWoLoading] = useState(false)

  const filteredWOs = useMemo(() => {
    if(!woSearch) return woAnalysisData
    const term = woSearch.toLowerCase()
    return woAnalysisData.filter(w =>
      (w.operation_name||'').toLowerCase().includes(term) ||
      (w.work_center_name||'').toLowerCase().includes(term) ||
      (w.product_name||'').toLowerCase().includes(term) ||
      (w.status||'').toLowerCase().includes(term)
    )
  }, [woSearch, woAnalysisData])

  useEffect(() => { (async () => { await fetchWOAnalysis() })() }, [])

  const fetchWOAnalysis = async () => {
    try {
      setWoLoading(true)
      const res = await workOrdersAPI.getAll()
      const rows = res?.data || res?.items || []
      setWoAnalysisData(rows)
    } catch (e) { console.error('Error fetching work orders', e) }
    finally { setWoLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Work Order Analysis</h1>
        <p className="text-gray-600">Operational insight into each work order</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="glass p-6 rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Work Orders</h3>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={woSearch}
                onChange={e=>setWoSearch(e.target.value)}
                placeholder="Search work orders..."
                className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-0 bg-white text-slate-800"
              />
              <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Operation</th>
                  <th className="px-4 py-2 text-left font-medium">Work Centre</th>
                  <th className="px-4 py-2 text-left font-medium">Product</th>
                  <th className="px-4 py-2 text-left font-medium">Qty</th>
                  <th className="px-4 py-2 text-left font-medium">Expected (min)</th>
                  <th className="px-4 py-2 text-left font-medium">Real (min)</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {woLoading && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">Loading work orders...</td></tr>
                )}
                {!woLoading && filteredWOs.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-500">No work orders found</td></tr>
                )}
                {!woLoading && filteredWOs.map(wo => {
                  // Calculate real duration with proper business logic
                  let realDuration = null
                  if (wo.real_duration_mins != null) {
                    // Work order is completed, use stored duration
                    realDuration = Number(wo.real_duration_mins).toFixed(1)
                  } else if (wo.started_at && wo.status === 'in_progress') {
                    // Work order is in progress, calculate current duration
                    const currentDuration = (Date.now() - new Date(wo.started_at).getTime()) / 60000
                    realDuration = currentDuration.toFixed(1)
                  } else if (wo.started_at && wo.status === 'paused') {
                    // Work order is paused, show duration up to pause (estimated)
                    const pausedDuration = (Date.now() - new Date(wo.started_at).getTime()) / 60000
                    realDuration = `~${pausedDuration.toFixed(1)}`
                  }
                  
                  return (
                    <tr key={wo.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-4 py-2 font-medium text-slate-800">{wo.operation_name}</td>
                      <td className="px-4 py-2 text-slate-700">{wo.work_center_name || '—'}</td>
                      <td className="px-4 py-2 text-slate-700">{wo.product_name || '—'}</td>
                      <td className="px-4 py-2 text-slate-700 font-semibold">{wo.mo_quantity || wo.quantity || '-'}</td>
                      <td className="px-4 py-2 text-slate-700">{wo.expected_duration_mins ?? '—'}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium">{realDuration || '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          wo.status === 'done' ? 'bg-green-100 text-green-700' :
                          wo.status === 'in_progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                          wo.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                          wo.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>{wo.status.replace('_', ' ')}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Reports