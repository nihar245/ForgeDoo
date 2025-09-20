import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { ensureBOMSeed, getBOMById, nextBOMId, upsertBOM } from '../../utils/bomStorage'

const products = [
  'Wooden Table',
  'Chair Set',
  'Dining Set',
  'Office Desk',
  'Bookshelf',
]

const units = ['pcs', 'set', 'kg', 'hr']

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-t-md border-b-2 transition-colors ${
      active ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
)

const BOMDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = id === 'new'

  const [form, setForm] = useState({
    id: '',
    productName: '',
    quantity: 1,
    unit: 'pcs',
    reference: '',
    components: [],
    workOrders: [],
  })
  const [tab, setTab] = useState('components')
  const referenceTooLong = useMemo(() => form.reference && form.reference.length > 8, [form.reference])

  useEffect(() => {
    ensureBOMSeed()
    if (isNew) {
      setForm(f => ({ ...f, id: nextBOMId() }))
    } else if (id) {
      const existing = getBOMById(id)
      if (existing) setForm(existing)
      else navigate('/bom')
    }
  }, [id])

  const handleChange = (patch) => setForm(prev => ({ ...prev, ...patch }))

  const onSave = () => {
    if (!form.productName) return toast.error('Finished product is required')
    if (!form.quantity || Number(form.quantity) <= 0) return toast.error('Quantity must be greater than 0')
    if (referenceTooLong) return toast.error('Reference must be 8 characters or less')
    upsertBOM(form)
    toast.success('BOM saved')
    navigate('/bom')
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/bom')} className="neomorphism px-3 py-2 rounded-lg flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="text-sm neomorphism px-3 py-2 rounded-lg font-mono">{form.id || 'BOM-......'}</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          className="neomorphism hover-glow px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </motion.button>
      </div>

      {/* Header fields */}
      <div className="glass rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Finished product</label>
            <div className="relative">
              <select
                className="neomorphism-inset mt-1 w-full h-10 pl-3 pr-10 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                value={form.productName}
                onChange={(e) => handleChange({ productName: e.target.value })}
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min={0}
              step={0.01}
              className="neomorphism-inset mt-1 w-full px-3 py-2 rounded-lg"
              value={form.quantity}
              onChange={(e) => handleChange({ quantity: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Units</label>
            <div className="relative">
              <select
                className="neomorphism-inset mt-1 w-full h-10 pl-3 pr-8 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                value={form.unit}
                onChange={(e) => handleChange({ unit: e.target.value })}
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Reference (max 8 chars)</label>
            <input
              type="text"
              maxLength={8}
              className={`neomorphism-inset mt-1 w-full px-3 py-2 rounded-lg ${referenceTooLong ? 'ring-2 ring-red-500' : ''}`}
              placeholder="e.g., TBLE001"
              value={form.reference}
              onChange={(e) => handleChange({ reference: e.target.value })}
            />
            {referenceTooLong && (
              <div className="text-xs text-red-600 mt-1">Must be 8 characters or less</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl">
        <div className="flex border-b border-white/20 px-4">
          <TabButton active={tab === 'components'} onClick={() => setTab('components')}>Components</TabButton>
          <TabButton active={tab === 'workorders'} onClick={() => setTab('workorders')}>Work Orders</TabButton>
        </div>
        {tab === 'components' ? (
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-2">Components</div>
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Component</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">To consume</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {form.components?.length ? form.components.map((c, idx) => (
                    <tr key={idx} className="border-t border-white/10">
                      <td className="py-2 px-3">{c.name}</td>
                      <td className="py-2 px-3">{c.qty}</td>
                      <td className="py-2 px-3">{c.unit}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-3 text-gray-500 text-sm">No components yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => handleChange({ components: [...(form.components || []), { name: 'Component A', qty: 1, unit: 'pcs' }] })}
              className="mt-3 neomorphism px-3 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add a product
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-2">Operations</div>
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Operation</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Work Center</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-700">Expected Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {form.workOrders?.length ? form.workOrders.map((w, idx) => (
                    <tr key={idx} className="border-t border-white/10">
                      <td className="py-2 px-3">{w.name}</td>
                      <td className="py-2 px-3">{w.center}</td>
                      <td className="py-2 px-3">{w.duration} hr</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-3 text-gray-500 text-sm">No work orders yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => handleChange({ workOrders: [...(form.workOrders || []), { name: 'Operation 1', center: 'Assembly', duration: 1 }] })}
              className="mt-3 neomorphism px-3 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add a line
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BOMDetail
