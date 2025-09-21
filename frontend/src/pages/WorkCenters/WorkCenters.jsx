import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { workCentersAPI } from '../../services'
import toast from 'react-hot-toast'

export default function WorkCenters() {
  const [workCenters, setWorkCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWorkCenters = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await workCentersAPI.getAll()
      if (response.items) {
        setWorkCenters(response.items)
      }
    } catch (error) {
      console.error('Failed to fetch work centers:', error)
      toast.error('Failed to load work centers')
      
      // Fallback data if API fails
      setWorkCenters([
        { id: 1, name: 'Work Center - 1', cost_per_hour: 50, capacity_per_hour: 8, location: 'Assembly Area' },
        { id: 2, name: 'Work Center - 2', cost_per_hour: 60, capacity_per_hour: 6, location: 'Quality Control' },
      ])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWorkCenters()
  }, [])

  const handleRefresh = () => {
    fetchWorkCenters(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Centers</h1>
            <p className="text-gray-600">Define locations and their hourly cost</p>
          </div>
        </div>
        
        <div className="glass p-6 rounded-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading work centers...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!loading && workCenters.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Centers</h1>
            <p className="text-gray-600">Define locations and their hourly cost</p>
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
        
        <div className="glass p-6 rounded-xl text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Centers Found</h3>
          <p className="text-gray-600">No work centers are currently configured in the system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Centers</h1>
          <p className="text-gray-600">Define locations and their hourly cost</p>
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

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Work Center Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Location</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Capacity/Hour</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cost per Hour</th>
              </tr>
            </thead>
            <tbody>
              {workCenters.map((workCenter, i) => (
                <motion.tr 
                  key={workCenter.id} 
                  initial={{opacity:0,y:10}} 
                  animate={{opacity:1,y:0}} 
                  transition={{delay:i*0.05}} 
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-gray-900">{workCenter.name}</td>
                  <td className="py-4 px-6 text-gray-700">{workCenter.location || '-'}</td>
                  <td className="py-4 px-6 text-gray-700">{workCenter.capacity_per_hour || 0} units</td>
                  <td className="py-4 px-6 text-green-600 font-medium">${workCenter.cost_per_hour || 0}/hr</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
