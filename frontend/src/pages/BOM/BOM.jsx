import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { bomAPI } from '../../services/bomAPI'
import toast from 'react-hot-toast'

const BOM = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [boms, setBOMs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBOMs()
  }, [])

  const fetchBOMs = async () => {
    try {
      setLoading(true)
      const response = await bomAPI.getAll()
      if (response.data) {
        setBOMs(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch BOMs:', error)
      toast.error('Failed to load BOMs')
    } finally {
      setLoading(false)
    }
  }

  // Filter BOMs based on search term
  const filteredBoms = boms.filter(bom => 
    (bom.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bom.version || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bill of Materials</h1>
            <p className="text-gray-600">Manage product recipes and manufacturing steps</p>
          </div>
        </div>
        <div className="glass p-8 rounded-xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading BOMs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bill of Materials</h1>
          <p className="text-gray-600">Manage product recipes and manufacturing steps</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/bom/new')}
          className="neomorphism hover-glow flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-gray-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create New BOM</span>
        </motion.button>
      </div>

      {/* Filters/Search above table (stacked) */}
      <div className="glass p-4 rounded-xl space-y-3">
        <div className="text-sm font-semibold text-gray-900">Filters</div>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search finished products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neomorphism-inset w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Simplified BOM Table: Finished Product + Reference */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Finished Product</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoms.map((bom, index) => (
                <motion.tr
                  key={bom.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/bom/${bom.id}`)}
                >
                  <td className="py-4 px-6 text-gray-800">{bom.product_name}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{bom.version}</td>
                </motion.tr>
              ))}
              {filteredBoms.length === 0 && (
                <tr>
                  <td colSpan="2" className="py-8 px-6 text-center text-gray-500">
                    {searchTerm ? 'No BOMs found matching your search.' : 'No BOMs available. Create your first BOM to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BOM